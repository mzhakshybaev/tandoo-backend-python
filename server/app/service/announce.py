# coding=utf-8
import datetime
from copy import deepcopy

from flask import g
from sqlalchemy import TEXT
from sqlalchemy import and_
from sqlalchemy import cast
from sqlalchemy import func
from sqlalchemy import or_, asc
from sqlalchemy import text
from sqlalchemy.orm.exc import NoResultFound

from app import controller
from app.controller import entity
from app.helper.utils import get_code
from app.keys import INFINITY, CRUD, BOBJECT, POSITION, FULL_NAME, EMAIL
from app.messages import GENERIC_ERROR
from app.model import db
from app.service import table_access, is_purchaser
from app.service.dictionary import tables
from app.service.employee import save_comm_member
from app.service.user import save_by_inn
from app.utils import orm_to_json, CbsException, portal_post


def getplan(bag):
    data = {
        "companyInn": '02505200110080',
        "okgz": '44512400-6',
        "year": datetime.date.today().year
    }
    response = portal_post('plan/okgz', data)
    if response:
        return {'docs': response}


@table_access('Advert')
def create(bag):
    bag_advert = bag['advert']

    advert_params = {
        'type': 'Advert',
        'status': 'Draft',
        'dirsection_id': bag_advert['dirsection_id'],
        'company_id': g.company._id,
        'created_date': datetime.datetime.now(),
        'update_date': datetime.datetime.now()
    }

    advert = controller.call(controller_name='data.put', bag=advert_params)
    ad_id = advert['id']

    # lots
    for ad_lot in bag['advert_lots']:
        ad_lot['type'] = 'Advert_lot'
        ad_lot['advert_id'] = ad_id
        if 'data' not in ad_lot:
            ad_lot['data'] = {}
        ad_lot['data']['unit_price'] = ad_lot['unit_price']
        if int(ad_lot['quantity']) <= 0:
            raise CbsException(GENERIC_ERROR, u'Кол-во не может быть отрицательным и должно быть больше нуля!')
        ad_lot['quantity'] = int(ad_lot['quantity'])
        if int(ad_lot['estimated_delivery_time']) <= 0:
            raise CbsException(GENERIC_ERROR, u'Не правильно указали срок поставок!!')
        ad_lot['estimated_delivery_time'] = int(ad_lot['estimated_delivery_time'])

        if ad_lot['quantity'] <= 0:
            raise CbsException(GENERIC_ERROR, u'Укажите количество')

        ad_lot['budget'] = format(ad_lot['quantity'] * ad_lot['unit_price'], '.2f')

        advert_lot = controller.call(controller_name='data.put', bag=ad_lot)

        dicts = ad_lot['dicts']
        if len(dicts) > 0:
            for d in dicts:
                for v in d['values']:
                    d_lot = {'type': 'Advert_lot_dictionaries',
                             'advert_lot_id': advert_lot['id'],
                             'dirname': d['dirname'],
                             'dictionary_id': v['_id']}
                    advert_lot_dict = controller.call(controller_name='data.put', bag=d_lot)

        specs = ad_lot['specs']
        if len(specs) > 0:
            for s in specs:
                for v in s['values']:
                    s_lot = {'type': 'Advert_lot_specification',
                             'advert_lot_id': advert_lot['id'],
                             'specification_id': ad_lot['dircategory_id'],
                             'specification_property_id': s['id'],
                             'specification_property_value_id': v['id']}
                    spec_lot = controller.call(controller_name='data.put', bag=s_lot)

    return {'id': ad_id}


@table_access('Advert')
@is_purchaser()
def update_deadline(bag):
    bag_advert = bag['advert']

    advert = g.tran.query(db.Advert) \
        .filter_by(_deleted='infinity', _id=bag_advert['_id'], status='Published') \
        .first()

    if not advert:
        raise CbsException(GENERIC_ERROR, u'Объявление не найдено')

    advert = orm_to_json(advert)

    advert['type'] = 'Advert'

    advert['deadline'] = bag_advert['deadline']
    advert['update_date'] = datetime.datetime.now()

    controller.call(controller_name='data.put', bag=advert)

    return


def update_draft(bag):
    bag_advert = bag['advert']

    advert = g.tran.query(db.Advert) \
        .filter_by(_deleted='infinity', _id=bag_advert['_id'], company_id=g.company._id, status='Draft') \
        .first()

    if not advert:
        raise CbsException(GENERIC_ERROR, u'Объявление не найдено')

    advert = orm_to_json(advert)

    advert['type'] = 'Advert'
    advert['guarantee'] = bag_advert['guarantee'] if bag_advert['guarantee'] else None

    if bag_advert.get('deadline', ''):
        advert['deadline'] = bag_advert['deadline']
    if bag_advert.get('step', ''):
        advert['step'] = bag_advert['step']
    if bag_advert.get('start_date', ''):
        advert['start_date'] = bag_advert['start_date']

    if bag_advert.get('dirprocurement_id', ''):
        dirprop = g.tran.query(db.DirProcurement) \
            .filter_by(_deleted='infinity', _id=bag_advert['dirprocurement_id'], with_concession=True).first()
        if dirprop:
            dirprop = orm_to_json(dirprop)
            dirprod_total = float(dirprop['data']['totalsum'])
            advert_lots_budget = g.tran.query(db.Advert_lot) \
                .filter_by(_deleted='infinity', advert_id=advert['_id']).all()
            total = 0
            for item in advert_lots_budget:
                total += item.budget
            if float(dirprod_total) < float(total):
                raise CbsException(GENERIC_ERROR, u'Планируемая сумма при выборе закупки "Упрощенным методом" не '
                                                  u'может превышать пороговую сумму в  {} сом'
                                   .format(dirprod_total))
        advert['dirprocurement_id'] = bag_advert['dirprocurement_id']

    if 'concession' in bag_advert and bag_advert['concession']:
        if float(bag_advert['concession']) < 0 or float(bag_advert['concession']) > 20:
            raise CbsException(GENERIC_ERROR, u'Значение льготы должно быть от 0 до 20 %')

        advert['concession'] = bag_advert['concession']

    if bag_advert.get('data', False):
        advert['data'] = bag_advert['data']

    advert['update_date'] = datetime.datetime.now()

    if bag_advert.get('comm_members', []):
        users = []
        for cm in bag_advert['comm_members']:
            u = save_by_inn(cm)
            empl = {'company_id': g.company._id, 'user_id': u.id, 'comm_member': True}
            e = save_comm_member(empl)
            cu = {'id': e.id}
            if cm.get('chairman', False):
                cu['chairman'] = True
            users.append(cu)
        if users:
            bag_advert['data'].update({'comm_members': users})

    controller.call(controller_name='data.put', bag=advert)
    return


@table_access('Advert')
@is_purchaser()
def update_lots(bag):
    bag_advert = bag['advert']

    advert = g.tran.query(db.Advert) \
        .filter_by(_deleted='infinity', _id=bag_advert['_id'], company_id=g.company._id, status='Draft') \
        .first()

    if not advert:
        raise CbsException(GENERIC_ERROR, u'Объявление не найдено')

    advert = orm_to_json(advert)
    ad_id = advert['_id']

    # collect ids
    lots = g.tran.query(db.Advert_lot) \
        .filter_by(_deleted='infinity', advert_id=advert['_id'])

    lot_ids = []
    for ad_lot in lots:
        lot_ids.append(ad_lot._id)

    upd_lot_ids = []
    for bag_lot in bag['advert_lots']:
        if '_id' in bag_lot:
            upd_lot_ids.append(bag_lot['_id'])

    # delete
    for lot_id in lot_ids:
        if lot_id not in upd_lot_ids:
            # delete specs
            specs = g.tran.query(db.Advert_lot_specification) \
                .filter_by(_deleted='infinity', advert_lot_id=lot_id) \
                .all()
            for spec in specs:
                spec = orm_to_json(spec)
                spec['type'] = 'Advert_lot_specification'
                controller.call(controller_name='data.delete', bag=spec)

            # delete dicts
            dicts = g.tran.query(db.Advert_lot_dictionaries) \
                .filter_by(_deleted='infinity', advert_lot_id=lot_id) \
                .all()
            for dict in dicts:
                dict = orm_to_json(dict)
                dict['type'] = 'Advert_lot_dictionaries'
                controller.call(controller_name='data.delete', bag=dict)

            # delete lot
            lot = g.tran.query(db.Advert_lot) \
                .filter_by(_deleted='infinity', _id=lot_id) \
                .one()
            lot = orm_to_json(lot)
            lot['type'] = 'Advert_lot'
            controller.call(controller_name='data.delete', bag=lot)

    # create / update
    for ad_lot in bag['advert_lots']:
        if '_id' in ad_lot:
            # update
            lot = g.tran.query(db.Advert_lot) \
                .filter_by(_deleted='infinity', _id=ad_lot['_id'], advert_id=ad_id) \
                .first()
            if not lot:
                raise CbsException(GENERIC_ERROR, u'Позиция не найдена')

            lot = orm_to_json(lot)

            lot['type'] = 'Advert_lot'
            lot['advert_id'] = ad_id
            lot['data'] = ad_lot['data'] if 'data' in ad_lot else {}
            lot['data']['unit_price'] = ad_lot['unit_price']
            lot['quantity'] = int(ad_lot['quantity'])
            # lot['planid'] = ad_lot['planid']

            if lot['quantity'] <= 0:
                raise CbsException(GENERIC_ERROR, u'Укажите количество')

            lot['budget'] = format(lot['quantity'] * lot['unit_price'], '.2f')
            lot['delivery_place'] = ad_lot['delivery_place']
            lot['estimated_delivery_time'] = ad_lot['estimated_delivery_time']

            advert_lot = controller.call(controller_name='data.put', bag=lot)

        else:
            # create
            ad_lot['type'] = 'Advert_lot'
            ad_lot['advert_id'] = ad_id
            if 'data' not in ad_lot:
                ad_lot['data'] = {}
            ad_lot['data']['unit_price'] = ad_lot['unit_price']
            ad_lot['quantity'] = int(ad_lot['quantity'])

            if ad_lot['quantity'] <= 0:
                raise CbsException(GENERIC_ERROR, u'Укажите количество')

            ad_lot['budget'] = format(ad_lot['quantity'] * ad_lot['unit_price'], '.2f')
            advert_lot = controller.call(controller_name='data.put', bag=ad_lot)

            dicts = ad_lot['dicts']
            if len(dicts) > 0:
                for d in dicts:
                    for v in d['values']:
                        d_lot = {'type': 'Advert_lot_dictionaries',
                                 'advert_lot_id': advert_lot['id'],
                                 'dirname': d['dirname'],
                                 'dictionary_id': v['_id']}
                        advert_lot_dict = controller.call(controller_name='data.put', bag=d_lot)

            specs = ad_lot['specs']
            if len(specs) > 0:
                for s in specs:
                    for v in s['values']:
                        s_lot = {'type': 'Advert_lot_specification',
                                 'advert_lot_id': advert_lot['id'],
                                 'specification_id': ad_lot['dircategory_id'],
                                 'specification_property_id': s['id'],
                                 'specification_property_value_id': v['id']}
                        spec_lot = controller.call(controller_name='data.put', bag=s_lot)
    return


@table_access('Advert')
def publish(bag):
    bag_advert = bag['advert']
    result = None

    advert = g.tran.query(db.Advert) \
        .filter_by(_deleted='infinity', _id=bag_advert['_id'], status='Draft') \
        .first()

    if not advert:
        raise CbsException(GENERIC_ERROR, u'Объявление не найдено')
    Force_status_list = ['ENSURE_SECURITY_KR', 'EARLY_ELECTIONS', 'LOCALIZE_FORCE_MAJEURE', 'THREE_PERCENT_SERVICE']
    dirprocumenet = g.tran.query(db.DirProcurement) \
        .filter_by(_deleted='infinity').filter(db.DirProcurement.code.in_(Force_status_list),
                                               db.DirProcurement._id == advert.dirprocurement_id) \
        .first()
    if not dirprocumenet:
        result = controller.call(controller_name='announce.put', bag=bag_advert)

    advert = orm_to_json(advert)

    advert['type'] = 'Advert'
    advert['code'] = result.get('orderNumber', get_code()) if result else get_code()
    advert['published_date'] = datetime.datetime.now()
    advert['update_date'] = datetime.datetime.now()
    advert['status'] = 'Published'

    controller.call(controller_name='data.put', bag=advert)

    return


def get(bag):
    advert = g.tran.query(db.Advert) \
        .filter_by(_deleted='infinity', _id=bag['id']).one()
    advert = orm_to_json(advert)
    advert_lots = g.tran.query(db.Advert_lot).filter_by(_deleted='infinity') \
        .filter(db.Advert_lot.advert_id == advert["_id"]) \
        .order_by(db.Advert_lot._created.desc()).all()

    advert['company'] = g.tran.query(db.Companies).filter_by(_deleted='infinity') \
        .filter(db.Companies._id == advert["company_id"]).first()
    advert['dirsection'] = g.tran.query(db.DirSection).filter_by(_deleted='infinity') \
        .filter(db.DirSection._id == advert["dirsection_id"]).first()

    if advert.get("dirprocurement_id", ''):
        advert['dirprocurement'] = g.tran.query(db.DirProcurement).filter_by(_deleted='infinity') \
            .filter(db.DirProcurement._id == advert["dirprocurement_id"]).first()

    lot_budget = 0
    debt_data = []
    companies_appl = []
    lind = 0

    for lot in advert_lots:
        lot_budget += lot.budget
        lot.specifications = []
        lot.dictionaries = []
        lot.applications = []
        lind = lind + 1
        lot.ind = lind
        dircategory = g.tran.query(db.DirCategory).filter_by(id=lot.dircategory_id).all()
        lot.dircategory = dircategory
        lot.unit_price = lot.data['unit_price'] if lot.data.get('unit_price', '') else 0
        if lot.dirunits_id:
            lot.dirunit = g.tran.query(db.DirUnits) \
                .filter_by(_deleted='infinity', _id=lot.dirunits_id).first()

        lot_dictionaries = g.tran.query(db.Advert_lot_dictionaries) \
            .filter_by(_deleted='infinity').filter(db.Advert_lot_dictionaries.advert_lot_id == lot._id).all()
        for lot_dict in lot_dictionaries:
            dict = {}
            table = getattr(db, lot_dict.dirname) if hasattr(db, lot_dict.dirname) else None
            dirvalue = g.tran.query(table).filter_by(_deleted='infinity').filter(
                table._id == lot_dict.dictionary_id).first()
            dir = next(d for d in tables if d['table'] == lot_dict.dirname)
            dict['dirname'] = lot_dict.dirname
            dict['name'] = dir['name'] if dir else ''
            # dict['displayName'] = dir['name'] if dir else ''
            dict['value'] = dirvalue.name
            dict['values'] = [orm_to_json(dirvalue)]
            lot.dictionaries.append(dict)
        lot_specifications = g.tran.query(db.Advert_lot_specification) \
            .filter_by(_deleted='infinity').filter(db.Advert_lot_specification.advert_lot_id == lot._id).all()
        for prodspec in lot_specifications:
            specs = {}
            property = g.tran.query(db.SpecificationProperty) \
                .filter_by(id=prodspec.specification_property_id).first()
            value = g.tran.query(db.SpecificationPropertyValue) \
                .filter_by(id=prodspec.specification_property_value_id).first()
            specs['property'] = property
            specs['value'] = value
            lot.specifications.append(specs)

        if advert['status'] in ['Evaluation', 'Results']:
            lot_applications = g.tran.query(db.Application, db.Companies, db.Product,
                                            (g.tran.query(db.DirCountry._id).select_from(db.ProductDict)
                                             .join(db.DirCountry,
                                                   and_(db.ProductDict.dictionary_id == db.DirCountry._id,
                                                        db.DirCountry._deleted == INFINITY))
                                             .filter(and_(db.ProductDict._deleted == INFINITY,
                                                          db.ProductDict.dirname == 'DirCountry',
                                                          db.ProductDict.product_id == db.Application.company_product_id))
                                             ).label('country'),
                                            (g.tran.query(db.DirBrand._id).select_from(db.ProductDict)
                                             .join(db.DirBrand,
                                                   and_(db.ProductDict.dictionary_id == db.DirBrand._id,
                                                        db.DirBrand._deleted == INFINITY))
                                             .filter(and_(db.ProductDict._deleted == INFINITY,
                                                          db.ProductDict.dirname == 'DirBrand',
                                                          db.ProductDict.product_id == db.Application.company_product_id))
                                             ).label('brand')
                                            ) \
                .outerjoin(db.Companies, and_(db.Application.company_id == db.Companies._id,
                                              db.Companies._deleted == INFINITY)) \
                .outerjoin(db.Product, and_(db.Application.company_product_id == db.Product._id,
                                            db.Product._deleted == INFINITY)) \
                .filter(and_(db.Application.advert_lot_id == lot._id,
                             db.Application._deleted == INFINITY, db.Application.status == 'Published')) \
                .order_by(db.Application.total, db.Application._created) \
                .all()

            is_first = True

            if 'dirprocurement' in advert and \
                    advert['dirprocurement'].with_concession and \
                    advert['dirprocurement'].with_concession is True:

                applications_list = []
                brand_label = ''
                country_label = ''
                for appl, company, product, country, brand in lot_applications:
                    dircountry = g.tran.query(db.DirCountry).filter_by(_deleted='infinity', _id=country).first()
                    if g.lang == "ru":
                        country_label = dircountry.name
                    elif g.lang == "en":
                        country_label = dircountry.name_en if dircountry.name_en and dircountry.name_en != 'null' \
                            else dircountry.name
                    elif g.lang == "kg":
                        country_label = dircountry.name_kg if dircountry.name_kg and dircountry.name_kg != 'null' \
                            else dircountry.name
                    dirbrand = g.tran.query(db.DirBrand).filter_by(_deleted='infinity', _id=brand).first()
                    if g.lang == "ru":
                        brand_label = dirbrand.name
                    elif g.lang == "en":
                        brand_label = dirbrand.name_en if dirbrand.name_en and dirbrand.name_en != 'null' \
                            else dirbrand.name
                    elif g.lang == "kg":
                        brand_label = dirbrand.name_kg if dirbrand.name_kg and dirbrand.name_kg != 'null' \
                            else dirbrand.name

                    ap = orm_to_json(appl)
                    ap['show_reason'] = True if ap['reason'] else False
                    ap['lot_id'] = lot._id
                    ap['company'] = company.name if company else ''
                    ap['country'] = country_label
                    ap['brand'] = brand_label
                    ap['total_concession'] = ap['total'] * ((100 - advert['concession']) / 100) \
                        if company.resident_state == "resident" and product.local == True else ap['total']

                    if lot.status != 'Canceled':
                        applications_list.append(ap)
                lot.applications = sorted(applications_list,
                                          key=lambda k: ((datetime.datetime.strptime(k["_created"][:10], '%Y-%m-%d')),
                                                         k['total_concession']))
                debt_data = company_debt_check(debt_data, company, advert["_id"])
            else:
                brand_label = ''
                country_label = ''
                for appl, company, product, country, brand in lot_applications:
                    dircountry = g.tran.query(db.DirCountry).filter_by(_deleted='infinity', _id=country).first()

                    debt_data = company_debt_check(debt_data, company, advert["_id"])

                    if g.lang == "ru":
                        country_label = dircountry.name
                    elif g.lang == "en":
                        country_label = dircountry.name_en if dircountry.name_en and dircountry.name_en != 'null' \
                            else dircountry.name
                    elif g.lang == "kg":
                        country_label = dircountry.name_kg if dircountry.name_kg and dircountry.name_kg != 'null' \
                            else dircountry.name
                    dirbrand = g.tran.query(db.DirBrand).filter_by(_deleted='infinity', _id=brand).first()
                    if g.lang == "ru":
                        brand_label = dirbrand.name
                    elif g.lang == "en":
                        brand_label = dirbrand.name_en if dirbrand.name_en and dirbrand.name_en != 'null' \
                            else dirbrand.name
                    elif g.lang == "kg":
                        brand_label = dirbrand.name_kg if dirbrand.name_kg and dirbrand.name_kg != 'null' \
                            else dirbrand.name
                    ap = orm_to_json(appl)

                    ap['show_reason'] = True if ap['reason'] else False
                    ap['lot_id'] = lot._id
                    ap['company'] = company.name if company else ''
                    ap['country'] = country_label
                    ap['brand'] = brand_label

                    lot.applications.append(ap)

        if advert['status'] in ['Results']:
            if lot.status in ['Canceled'] and g.lang == "ru":
                lot.company = 'Не состоялась'
                lot.total = 'Не состоялась'
            if lot.status in ['Canceled'] and g.lang == "en":
                lot.company = 'Did not take place'
                lot.total = 'Did not take place'
            if lot.status in ['Canceled'] and g.lang == "kg":
                lot.company = 'өткөрүлгөн жок'
                lot.total = 'өткөрүлгөн жок'

            else:
                application = g.tran.query(db.Application) \
                    .filter_by(_deleted='infinity', advert_lot_id=lot._id, selected=True).all()
                if application:
                    app2, company = g.tran.query(db.Application, db.Companies) \
                        .join(db.Companies, and_(db.Application.company_id == db.Companies._id,
                                                 db.Companies._deleted == INFINITY)) \
                        .filter(and_(db.Application.advert_lot_id == lot._id,
                                     db.Application._deleted == INFINITY)) \
                        .filter(db.Application.selected == True).first()

                    lot.company = company.name if company else ''
                    lot.total = app2.total if app2 else ''

    if 'with_related' in bag and bag['with_related'] is True:
        advert_status_value = g.tran.query(
            func.row_to_json(text('enums.*'))).select_from(db.Enums) \
            .filter_by(_deleted='infinity', name='advert_status') \
            .filter(db.Enums.data['key'].cast(TEXT) == cast(db.Advert.status, TEXT)) \
            .as_scalar().label('advert_status_value')

        advert = advert.add_columns(advert_status_value)

    comm_members = advert['data'].get('comm_members', [])
    if comm_members:
        for cm in comm_members:
            u = g.tran.query(db.User).select_from(db.Companyemployees) \
                .filter(db.Companyemployees.id == cm['id']).first()
            if u:
                cm[FULL_NAME] = u.fullname or ''
                cm[POSITION] = u.position or ''
                cm[EMAIL] = u.email or ''
                cm['company'] = u.data.get('comm_member', {}).get('company', '')
    advert['lots'] = advert_lots
    advert['debt_data'] = debt_data
    advert['budget'] = lot_budget
    return {'doc': advert}


@table_access('Advert')
def listing(bag):
    if hasattr(g, 'company'):
        adverts = g.tran.query(db.Advert).filter_by(_deleted='infinity', company_id=g.company._id) \
            .order_by(db.Advert.created_date.desc())

        if bag.get('filter', {}):
            if bag['filter'].get('status', ''):
                adverts = adverts.filter(db.Advert.status == bag['filter']['status'])
        adverts = adverts.order_by(asc(db.Advert._created))
        adverts = adverts.all()
        query = []
        for advert in adverts:
            advert_lots = g.tran.query(db.Advert_lot).filter_by(_deleted='infinity').filter(
                db.Advert_lot.advert_id == advert._id).all()
            lot_budget = 0
            for advert_lot in advert_lots:
                lot_budget += advert_lot.budget
            dirsection = g.tran.query(db.DirSection) \
                .filter_by(_deleted='infinity').filter(db.DirSection._id == advert.dirsection_id).first()
            organization = g.tran.query(db.Companies) \
                .filter_by(_deleted='infinity') \
                .filter(db.Companies._id == advert.company_id).first()
            dirprocurement = g.tran.query(db.DirProcurement) \
                .filter_by(_deleted='infinity') \
                .filter(db.DirProcurement._id == advert.dirprocurement_id).first()
            if g.lang == "ru":
                dirsectionlabel = dirsection.name
            elif g.lang == "en":
                dirsectionlabel = dirsection.name_en if dirsection.name_en else dirsection.name
            elif g.lang == "kg":
                dirsectionlabel = dirsection.name_kg if dirsection.name_kg else dirsection.name
            else:
                dirsectionlabel = dirsection.name
            data = {
                "_id": advert._id,
                "code": advert.code,
                "status": advert.status,
                "published_date": advert.published_date,
                "create_date": advert.created_date,
                "update_date": advert.update_date,
                "dirsection": dirsectionlabel,
                "deadline": advert.deadline,
                "organization": organization.name,
                "dirprocurement": dirprocurement.name if dirprocurement else {},
                "count_lot": len(advert_lots),
                "budget": lot_budget
            }
            query.append(data)
        count = len(query)
        return {'docs': query, 'count': count}
    else:
        raise CbsException(GENERIC_ERROR, u'У вас нет выбранной организации')


def getAll(bag):
    query = []

    adverts = g.tran.query(db.Advert).filter_by(_deleted='infinity')
    if bag.get('status') and bag['status'] in ['Published', 'Results', 'Evaluation', 'Canceled']:
        adverts = adverts.filter(db.Advert.status == bag['status'])
    else:
        status_advert = ['Published', 'Results', 'Evaluation']
        adverts = adverts.filter(db.Advert.status.in_(status_advert))

    if 'order' in bag:
        adverts = adverts.order_by(text(*bag['order']))
    else:
        adverts = adverts.order_by(db.Advert.created_date.desc())

    totalCount = adverts.count() or 0
    if 'limit' in bag:
        adverts = adverts.limit(bag['limit'])
    if 'offset' in bag:
        adverts = adverts.offset(bag['offset'])

    adverts = adverts.all()

    if totalCount > 0:
        for advert in adverts:
            advert_lots = g.tran.query(db.Advert_lot).filter_by(_deleted='infinity').filter(
                db.Advert_lot.advert_id == advert._id).all()
            lot_budget = 0
            for advert_lot in advert_lots:
                lot_budget += advert_lot.budget
            dirsection = g.tran.query(db.DirSection) \
                .filter_by(_deleted='infinity').filter(db.DirSection._id == advert.dirsection_id).first()
            dirsection_name = dirsection.name
            if g.lang == 'ru':
                dirsection_name = dirsection.name
            if g.lang == 'en':
                dirsection_name = dirsection.name_en if dirsection.name_en and \
                                                        dirsection.name_en != 'null' else dirsection.name
            if g.lang == 'kg':
                dirsection_name = dirsection.name_kg if dirsection.name_kg and \
                                                        dirsection.name_kg != 'null' else dirsection.name
            organization = g.tran.query(db.Companies) \
                .filter_by(_deleted='infinity') \
                .filter(db.Companies._id == advert.company_id).first()
            dirprocurement = g.tran.query(db.DirProcurement) \
                .filter_by(_deleted='infinity') \
                .filter(db.DirProcurement._id == advert.dirprocurement_id).first()
            dirprocurement_name = dirprocurement.name
            if g.lang == 'ru':
                dirprocurement_name = dirprocurement.name
            if g.lang == 'en':
                dirprocurement_name = dirprocurement.name_en if dirprocurement.name_en and \
                                                                dirprocurement.name_en != 'null' else dirprocurement.name
            if g.lang == 'kg':
                dirprocurement_name = dirprocurement.name_kg if dirprocurement.name_kg and \
                                                                dirprocurement.name_kg != 'null' else dirprocurement.name
            data = {
                "_id": advert._id,
                "code": advert.code,
                "status": advert.status,
                "published_date": advert.published_date,
                "create_date": advert.created_date,
                "update_date": advert.update_date,
                "dirsection": dirsection_name,
                "deadline": advert.deadline,
                "organization": organization.name if organization else '',
                "dirprocurement": dirprocurement_name,
                "count_lot": len(advert_lots),
                "budget": lot_budget
            }
            query.append(data)

        return {'docs': query, 'totalCount': totalCount}
    else:
        return {'docs': [], 'totalCount': 0}


def update_lot(bag):
    try:
        curr_lot = g.tran.query(db.Advert_lot) \
            .filter_by(_deleted='infinity', _id=bag['lot_id'], advert_id=bag['announce_id']).one()

        if bag.get('reason', ''):
            lot = orm_to_json(curr_lot)
            lot['type'] = 'Advert_lot'
            lot['reason'] = bag['reason']
            lot['status'] = 'Canceled'
            advert_lot = controller.call(controller_name='data.put', bag=lot)
        else:
            lot_applications = g.tran.query(db.Application) \
                .filter(and_(db.Application.advert_lot_id == curr_lot._id,
                             db.Application._deleted == INFINITY)) \
                .order_by(db.Application.total, db.Application._created).all()

            for appl in lot_applications:
                appls = [ap for ap in bag['applications'] if appl._id == ap['_id']]
                curr_lot = appls[0]

                if curr_lot['selected']:
                    break
                if not curr_lot['reason']:
                    raise CbsException(GENERIC_ERROR, u'Введите причину для отмены закупки данной позиции')

                appl.reason = curr_lot['reason']
                g.tran.add(appl)

            g.tran.flush()
    except NoResultFound:
        raise CbsException(GENERIC_ERROR, u'Позиция в объявлении не найдены')


def update(bag):
    try:
        curr_advert = g.tran.query(db.Advert) \
            .filter_by(_deleted='infinity', _id=bag['id']) \
            .filter(db.Advert.status.in_(['Evaluation', 'Published'])).one()
        advert = orm_to_json(curr_advert)
        advert['type'] = 'Advert'

        if bag.get('reason', ''):
            advert['status'] = 'Canceled'
            advert['reason'] = bag['reason']
        else:
            advert['status'] = 'Results'

            lots = g.tran.query(db.Advert_lot).filter_by(_deleted='infinity') \
                .filter(and_(db.Advert_lot.advert_id == advert['_id'],
                             or_(db.Advert_lot.status != 'Canceled',
                                 db.Advert_lot.status == None))) \
                .order_by(db.Advert_lot._created.desc()).all()

            for lot in lots:
                appl = g.tran.query(db.Application) \
                    .filter(db.Application.advert_lot_id == lot._id,
                            db.Application._deleted == INFINITY, db.Application.selected == True) \
                    .first()
                if appl:
                    contr = g.tran.query(db.Contract) \
                        .outerjoin(db.ContractLots, db.Contract.id == db.ContractLots.contract_id) \
                        .filter(and_(db.Contract.advert_id == bag['id'],
                                     db.Contract.supplier_company_id == appl.company_id)).first()

                    if not contr:
                        sum_total = 0
                        for l in lots:
                            application = g.tran.query(db.Application) \
                                .filter(and_(db.Application.advert_lot_id == l._id,
                                             db.Application._deleted == INFINITY, db.Application.selected == True,
                                             db.Application.company_id == appl.company_id)) \
                                .first()
                            if application:
                                sum_total += application.total

                        contract = {
                            'code': get_code(),
                            'status': 'Schedule',
                            'advert_id': advert['_id'],
                            'purchaser_company_id': advert['company_id'],
                            'supplier_company_id': appl.company_id,
                            'dirsection_id': advert['dirsection_id'],
                            'total': sum_total,
                            'created_date': func.now(),
                        }

                        contr = entity.add({CRUD: db.Contract, BOBJECT: contract})
                        if contr:
                            text = {
                                "company_id": appl.company_id,
                                "type": "Announce",
                                "title": u"Вам отправили договор",
                                "title_kg": u"Сизге келишим жиберилди",
                                "title_en": u"You sent the contract",
                                "description": u"Вы получили договор, пожалуйста дайте ответ по договору",
                                "description_kg": u"Сизге келишим жөнөтүлдү, келишим боюнча жооп бергиле",
                                "description_en": u"You have received a contract, please give a response to the contract.",
                                "notification_status": "active",
                                "data": {
                                    'contract_id': contr.id,
                                    'application_id': appl._id,
                                    'advert_lot_id': appl.advert_lot_id
                                }
                            }
                            entity.add({CRUD: db.NotificationCompany, BOBJECT: text})

                    con_lot = {
                        'contract_id': contr.id,
                        'status': 'Draft',
                        'application_id': appl._id,
                        'advert_lot_id': appl.advert_lot_id,
                    }
                    con_lot = entity.add({CRUD: db.ContractLots, BOBJECT: con_lot})
                else:
                    break

        advert = controller.call(controller_name='data.put', bag=advert)
    except NoResultFound:
        raise CbsException(GENERIC_ERROR, u'Объявление не найден')


def update_apps(bag):
    advert = g.tran.query(db.Advert).filter_by(_deleted='infinity', _id=bag['announce_id']).first()

    if advert.status != 'Evaluation':
        raise CbsException(GENERIC_ERROR, u'Ваше объявление не в статусе "Оценка предложении"')

    if hasattr(g, 'company') and g.company._id != advert.company_id:
        raise CbsException(GENERIC_ERROR, u'Ваша организация не является создателем этого объявления!')

    for bag_lot in bag['lots']:
        lot = g.tran.query(db.Advert_lot).filter_by(_deleted='infinity', _id=bag_lot['_id']).first()

        if lot.advert_id != advert._id:
            raise CbsException(GENERIC_ERROR, u'Указан неверный id позиции!')

        lot_applications = g.tran.query(db.Application) \
            .filter(and_(db.Application.advert_lot_id == lot._id,
                         db.Application._deleted == INFINITY)) \
            .order_by(db.Application.total, db.Application._created).all()

        for appl in lot_applications:
            next_appls = [ap for ap in bag_lot['applications'] if appl._id == ap['_id']]  # find
            if len(next_appls) == 0:
                continue

            next_appl = next_appls[0]
            appl.reason = next_appl['reason']
            appl.selected = next_appl['selected']
            g.tran.add(appl)
            if appl.selected == True:
                dircategory = g.tran.query(db.DirCategory).filter(db.DirCategory.id == lot.dircategory_id).first()
                label = dircategory.name or ''
                text = {
                    "company_id": appl.company_id,
                    "type": "Announce",
                    "title": advert.code,
                    "description": u"Вы являетесь победителем в позиции {}".format(label),
                    "description_kg": u"Сиз {} өңүттө жеңүүчү деп табылдыңыз".format(label),
                    "description_en": u"Вы являетесь победителем в позиции {}".format(label),
                    "notification_status": "active",
                    "data": {
                        "announce_lot_id": appl.advert_lot_id,
                        "announce_id": advert._id
                    }
                }
                res = entity.add({CRUD: db.NotificationCompany, BOBJECT: text})
            else:
                dircategory = g.tran.query(db.DirCategory).filter(db.DirCategory.id == lot.dircategory_id).first()
                label = dircategory.name or ''
                text = {
                    "company_id": appl.company_id,
                    "type": "Announce",
                    "title": advert.code,
                    "description": u"Уважаемый исполнитель, ваша заявка была отклонена по позиции {}".format(label),
                    "description_kg": u"Урматтуу Аткаруучу, Сиздин {} өңүттөгү "
                                      u"табыштамаңыз четке кагылган” ".format(label),
                    "description_en": u"Уважаемый исполнитель, ваша заявка была отклонена по позиции {}".format(label),
                    "notification_status": "active",
                    "data": {
                        "announce_lot_id": appl.advert_lot_id,
                        "announce_id": advert._id
                    }
                }
                res = entity.add({CRUD: db.NotificationCompany, BOBJECT: text})
    return


def test(bag):
    query = g.tran.query(func.sum(db.Application.total).label('total')) \
        .filter_by(_deleted='infinity')

    query = query.add_column(g.tran.query(db.Companies._id).select_from(db.Companies)
                             .filter_by(_deleted='infinity', _id=db.Application.company_id).as_scalar()
                             .label('company_id'))

    earnings_query = query.group_by('company_id')
    items = orm_to_json(earnings_query.all())
    balance = deepcopy(items)

    return {"application": balance}


def check_company(data, comp_id):
    is_exists = False
    for d in data:
        if d['id'] == comp_id:
            is_exists = True
            break
    return is_exists


def company_debt_check(debt_data, company, advert_id):
    sql = g.tran.query(db.Companydocument, db.DirDocument) \
        .join(db.DirDocument,
              and_(db.Companydocument.dirdocument_id == db.DirDocument._id,
                   db.DirDocument._deleted == INFINITY)) \
        .filter(db.Companydocument.company_id == company._id,
                db.Companydocument.data['advert_id'].astext == advert_id) \
        .order_by(db.Companydocument.date_start.desc()).limit(2)

    if not check_company(debt_data, company._id):
        doc = {'company': company.name, 'id': company._id}
        for cd, dd in sql.all():
            if dd.data['type'] == 'tax':
                doc['tax_debt'] = u'Имеется' if cd.debt else u'Не имеется'
                doc['tax_date'] = cd.date_start
            elif dd.data['type'] == 'sf':
                doc['sf_debt'] = u'Имеется' if cd.debt else u'Не имеется'
                doc['sf_date'] = cd.date_start
        debt_data.append(doc)
        return debt_data
