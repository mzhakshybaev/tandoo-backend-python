# coding=utf-8
import datetime
import operator
from itertools import groupby

from flask import g
from sqlalchemy import and_

from app import controller
from app.keys import INFINITY
from app.model import db
from app.utils import orm_to_json, CbsException, portal_post
from messages import GENERIC_ERROR


def put(bag):
    advert = g.tran.query(db.Advert).filter_by(_deleted='infinity', _id=bag['_id']).first()
    advert = orm_to_json(advert)
    lots = g.tran.query(db.Advert_lot).filter_by(_deleted='infinity', advert_id=advert['_id']).all()
    payments = advert['data']['payments'] or None
    tehadress = ''
    data = {'companyInn': g.user.company['companyInn'], 'userPin': g.user.inn, 'username': g.user.username}
    userdata = portal_post('user', data)
    dirprocurement = g.tran.query(db.DirProcurement) \
        .filter_by(_deleted='infinity', _id=advert['dirprocurement_id']).first()
    dirsection = g.tran.query(db.DirSection) \
        .filter_by(_deleted='infinity').filter(db.DirSection._id == advert['dirsection_id']).first()

    # generate lots data
    ls = []
    totalSum = 0
    for lot in lots:
        specifications = getSpecDict({'id': lot._id})
        dircategory = g.tran.query(db.DirCategory).filter(db.DirCategory.id == lot.dircategory_id).first()
        totalSum += lot.budget
        ls.append({
            "name": dircategory.name,
            "okgz": dircategory.code,
            "deliveryDetails": lot.delivery_place,
            "deliveryDate": None,
            "deliveryPeriod": lot.estimated_delivery_time,
            "deliveryCondition": "",
            "number": lot._id,
            "sumContest": lot.budget,
            "planId": lot.planid,
            "products": [
                {
                    "specifications": specifications['specifications'],
                    "okgz": dircategory.code,
                    "measurementUnit": int(specifications['dirunitcode'].code),
                    "amount": lot.quantity,
                    "priceForOneUnit": lot.unit_price
                }
            ]
        })

    data = {
        "dateContest": str(advert['deadline']),
        "dateCreated": str(advert['created_date']),
        "name": dirsection.name,
        "totalSum": totalSum,
        "orderType": "PRODUCT",
        "orderFormat": "STANDART",
        "company": {
            "id": g.user.company['id'],
            "title": g.user.company['title'],
            "companyInn": g.user.company['companyInn']
        },
        "specialRequirement": {
            "allowBenefits": advert['concession'] > 0,
            "benefits": advert['concession'] or 0
        },
        "contract": {
            "payment": {
                "allowAdvance": payments['advanceEnabled'],
                "advance": payments['advance'] or 0,
                "allowAfterShipment": payments['shipmentEnabled'],
                "afterShipment": payments['shipment'] or 0,
                "allowAfterAcceptance": payments['acceptEnabled'],
                "afterAcceptance": payments['accept'] or 0
            },
            "allowTechnicalControl": len(tehadress) > 0,
            "control": {
                "title": "",
                "placeOfAttendancetitle": tehadress
            }
        },
        "status": 'VERIFIED_PUBLISHED',
        "procurementMethod": dirprocurement.code if dirprocurement.code == 'SIMPLICATED' else 'SINGLE_SOURCE',
        "singleSourceReason": dirprocurement.code if dirprocurement.code != 'SIMPLICATED' else None,
        "userId": userdata['id'],
        "lots": ls
    }

    resp = portal_post("order/publish", data)

    if len(resp['lots']):
        for lot in lots:
            l = orm_to_json(lot)
            response_lot = next((x for x in resp['lots'] if x.get('tandoo_uid') == lot._id), None)
            if response_lot:
                l['lot_id'] = response_lot['id']
                l['product_id'] = response_lot['products'][0]['id']
                l['type'] = 'Advert_lot'
                controller.call(controller_name='data.put', bag=l)
    return resp


def getSpecDict(bag):
    if "id" in bag:
        Advert_lot_specifications = g.tran.query(db.Advert_lot_specification) \
            .filter_by(_deleted='infinity', advert_lot_id=bag['id']).all()
        Advert_lot_dictionary = g.tran.query(db.Advert_lot_dictionaries) \
            .filter_by(_deleted='infinity', advert_lot_id=bag['id']).all()
        s = ''
        code = ''
        for lot_spec in Advert_lot_specifications:
            property = g.tran.query(db.SpecificationProperty) \
                .filter_by(id=lot_spec.specification_property_id).first()
            value = g.tran.query(db.SpecificationPropertyValue) \
                .filter_by(id=lot_spec.specification_property_value_id).first()
            s += ' ' + property.name + ": " + value.name + ', '
        for lot_dict in Advert_lot_dictionary:
            table = getattr(db, lot_dict.dirname) if hasattr(db, lot_dict.dirname) else None
            dirvalue = g.tran.query(table).filter_by(_deleted='infinity').filter(
                table._id == lot_dict.dictionary_id).first()
            spec_dict = g.tran.query(db.SpecificationDictionary).filter_by(dirname=lot_dict.dirname).first()
            s += ' ' + spec_dict.name + ": " + dirvalue.name + ', '
            if table == db.DirUnits:
                code = dirvalue
        return {'specifications': s, 'dirunitcode': code}
    else:
        raise CbsException(GENERIC_ERROR, u'Не хватает LotId')


def sendAnnounce(bag):
    check_role()
    advert = g.tran.query(db.Advert).filter_by(_deleted='infinity', _id=bag['advert_id']).first()
    contract = g.tran.query(db.Contract).filter_by(code=bag['contract_code']).first()

    if advert.status != 'Results':
        raise CbsException(GENERIC_ERROR, u'Ваше объявление не в статусе "Оценка предложении"')

    advert_lots = g.tran.query(db.Advert_lot).filter_by(_deleted='infinity', advert_id=advert._id).all()
    items = []
    lots_id = []
    evaluation = {
        "date": None,
        "orderId": 1,
        "comment": "",
        "lotEvaluations": []
    }
    for lot in advert_lots:
        evaluation['lotEvaluations'].append({
            "lotId": lot.lot_id,
            "canceled": False,
            "note": ""
        })
        lots_id.append(lot._id)
    lot_applications = g.tran.query(db.Application) \
        .filter(and_(db.Application.advert_lot_id.in_(lots_id),
                     db.Application._deleted == INFINITY)) \
        .order_by(db.Application.total, db.Application._created).all()
    lot_applications = orm_to_json(lot_applications)

    c = map(operator.itemgetter("company_id"), lot_applications)
    companies = [el for el, _ in groupby(c)]
    for company in companies:
        item = {
            "companyId": g.user.company['id'],
            "orderId": 1,
            "lotIds": [],
            "priceTables": [],

            "dateComplated": None,
            "status": 3,
            "contractNumber": contract.code,
            "dateOfContract": str(contract.date_sup_submit),
            "currencyId": None,
            "ratePerSom": None,
            "confirmed": None,
            "confirmedQualification": None,
            "confirmedQualificationText": None
        }
        lots = [x for x in lot_applications if x['company_id'] == company]
        for lot in lots:
            specs = getProductSpecs({'id': lot['company_product_id']})
            item['lotIds'].append(lot['lot_id'])
            item["dateCreated"] = str(lot['_created'])
            item['priceTables'].append({
                "priceOfProduct": [
                    {
                        "priceOfUnit": lot['unit_price'],
                        "techSpecification": specs['s'],
                        "model": specs['model'],
                        "countryOfOriginId": specs['country'],
                        "productId": lot['product_id']
                    }
                ],
                "lotId": lot['lot_id'],
                "position": 1 if lot['selected'] else 0,
                "canceled": True if lot.get('status', '') == 'Canceled' else False,
                "reason": lot['reason'],
                "dateUpdate": None,
                "sumContest": lot['total']
            })
        items.append(item)
    data = {'evaluation': evaluation, 'bids': items}
    return portal_post('order/evaluate', data)


def getProductSpecs(bag):
    p = ''
    s = ''
    model = ''
    country = ''
    product = g.tran.query(db.Product).filter_by(_deleted='infinity').filter(db.Product._id == bag["id"]).first()
    local = 'Отчественная продукция' if product.local else ''
    # p = product.barcode + ', ' + product.code + ', ' + local
    productspec = g.tran.query(db.ProductSpec).filter_by(_deleted='infinity', product_id=product._id).all()
    productdict = g.tran.query(db.ProductDict).filter_by(_deleted='infinity', product_id=product._id).all()
    for prodspec in productspec:
        property = g.tran.query(db.SpecificationProperty) \
            .filter_by(id=prodspec.specification_property_id).first()
        value = g.tran.query(db.SpecificationPropertyValue) \
            .filter_by(id=prodspec.specification_property_value_id).first()
        s += ' ' + property.name + ": " + value.name + ', '
    for proddict in productdict:
        table = getattr(db, proddict.dirname) if hasattr(db, proddict.dirname) else None
        dirvalue = g.tran.query(table).filter_by(_deleted='infinity').filter(
            table._id == proddict.dictionary_id).first()
        spec_dict = g.tran.query(db.SpecificationDictionary).filter_by(dirname=proddict.dirname).first()
        s += ' ' + spec_dict.name + ": " + dirvalue.name + ', '
        if table == db.DirManifacture:
            model = dirvalue.name
        if table == db.DirCountry:
            country = dirvalue.name
    return {'s': s, 'country': country, 'model': model}


def sendContract(bag):
    check_role()
    contract = bag['contract']
    sql = g.tran.query(db.ContractLots, db.Application, db.Product, db.Advert_lot) \
        .filter(db.ContractLots.contract_id == contract.id) \
        .filter(db.Application._id == db.ContractLots.application_id) \
        .filter(db.Product._id == db.Application.company_product_id) \
        .filter(db.Advert_lot._id == db.Application.advert_lot_id)

    purcompany = g.tran.query(db.Companies).filter_by(_deleted='infinity', _id=contract.purchaser_company_id).first()
    supcompany = g.tran.query(db.Companies).filter_by(_deleted='infinity', _id=contract.supplier_company_id).first()

    user_purcompany = g.tran.query(db.User).filter(db.User.id == purcompany.user_id).first()
    user_supcompany = g.tran.query(db.User).filter(db.User.id == supcompany.user_id).first()

    purdata = {'companyInn': purcompany.inn, 'userPin': user_purcompany.inn, 'username': user_purcompany.username}
    presp = portal_post('user', purdata)

    supdata = {'companyInn': supcompany.inn, 'userPin': user_supcompany.inn, 'username': user_supcompany.username}
    sresp = portal_post('user', supdata)

    for cl, appl, prod, adlot in sql.all():
        specifications = getSpecDict({'id': appl.advert_lot_id})
        specs = getProductSpecs({'id': appl.company_product_id})
        dircategory = g.tran.query(db.DirCategory).filter(db.DirCategory.id == adlot.dircategory_id).first()
        consignments = g.tran.query(db.Consignment).filter(db.Consignment.contract_id == contract.id).first()
        data = {
            "dateCreated": contract.created_date.strftime('%Y-%m-%d'),
            "contractDate": contract.date_sup_submit.strftime('%Y-%m-%d'),
            "contractNumber": contract.code,
            "proc_company_id": presp['company']['id'],
            "supplier_company_id": sresp['company']['id'],
            "orderType": "PRODUCT",
            "singleSourceContract": bag['code'],
            "products": [
                {
                    "priceOfUnit": appl.unit_price,
                    "techSpecification": specifications['specifications'],
                    "model": specs['model'],
                    "countryOfOriginId": specs['country'],
                    "product": {
                        "specifications": specifications['specifications'],
                        "okgz": dircategory.code,
                        "measurementUnit": int(specifications['dirunitcode'].code),
                        "amount": adlot.quantity,
                        "priceForOneUnit": adlot.unit_price
                    }
                }
            ],
            "payments": [
                {
                    "type": "PREPAYMENT",
                    "dateFrom": str(consignments.date_from),
                    "dateTo": str(consignments.date_to),
                    "doc": "PAYMENT_INVOICE"
                }
            ],
            "schedules":
                [
                    {
                        "deliveryPlace": adlot.delivery_place,
                        "dateFrom": str(consignments.date_from),
                        "dateTo": str(consignments.date_to),
                        "deliveryCondition": "г.Талас ул.Сарыгулова № 59"
                    }
                ]
        }

        return portal_post('extraContract/publish', data)


def check_role():
    role_type = g.user.roleType
    err_msg = 'У Вас нет полномочий для этой подписи.Необходим учетная запись Руководителя организации.'
    if role_type['roleType'] == 1:
        if role_type['id'] != 8:
            raise CbsException(GENERIC_ERROR, err_msg)
    elif role_type['roleType'] == 2:
        if role_type['id'] != 5:
            raise CbsException(GENERIC_ERROR, err_msg)
