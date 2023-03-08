# coding=utf-8
import datetime
from sets import Set

from flask import g
from sqlalchemy import and_, func, text, TEXT
from sqlalchemy import or_
from sqlalchemy.orm import aliased

from app import controller
from app.controller import entity
from app.controller.user import get_totp, check_otp
from app.helper import sms
from app.keys import INFINITY, BOBJECT, CRUD, ID
from app.messages import GENERIC_ERROR
from app.model import db
from app.service import is_purchaser, is_supplier
from app.utils import orm_to_json, CbsException
from sqlalchemy.orm.attributes import InstrumentedAttribute


def listing(bag):
    contracts = []
    pur_comp = aliased(db.Companies)
    sup_comp = aliased(db.Companies)

    if bag.get('announce_id'):
        sql = g.tran.query(db.Contract, pur_comp.short_name.label('pur_company'), db.DirSection,
                           sup_comp.short_name.label('sup_company')) \
            .outerjoin(pur_comp, and_(db.Contract.purchaser_company_id == pur_comp._id,
                                      pur_comp._deleted == INFINITY)) \
            .outerjoin(db.Advert, and_(db.Contract.advert_id == db.Advert._id,
                                       db.Advert._deleted == INFINITY)) \
            .outerjoin(db.DirSection, and_(db.Advert.dirsection_id == db.DirSection._id,
                                           db.DirSection._deleted == INFINITY)) \
            .outerjoin(sup_comp, and_(db.Contract.supplier_company_id == sup_comp._id,
                                      sup_comp._deleted == INFINITY)) \
            .filter(or_(db.Contract.purchaser_company_id == g.company._id,
                        db.Contract.supplier_company_id == g.company._id)) \
            .filter(db.Advert._id == bag.get('announce_id')).order_by(db.Contract.created_date.desc())
    else:
        sql = g.tran.query(db.Contract, pur_comp.short_name.label('pur_company'), db.DirSection,
                           sup_comp.short_name.label('sup_company')) \
            .outerjoin(pur_comp, and_(db.Contract.purchaser_company_id == pur_comp._id,
                                      pur_comp._deleted == INFINITY)) \
            .outerjoin(db.Advert, and_(db.Contract.advert_id == db.Advert._id,
                                       db.Advert._deleted == INFINITY)) \
            .outerjoin(db.DirSection, and_(db.Advert.dirsection_id == db.DirSection._id,
                                           db.DirSection._deleted == INFINITY)) \
            .outerjoin(sup_comp, and_(db.Contract.supplier_company_id == sup_comp._id,
                                      sup_comp._deleted == INFINITY)) \
            .filter(or_(db.Contract.purchaser_company_id == g.company._id,
                        db.Contract.supplier_company_id == g.company._id)).order_by(db.Contract.created_date.desc())

    for ct, pur_company, section, sup_company in sql.all():
        if g.lang == "ru":
            dirsectionlabel = section.name
        elif g.lang == "en":
            dirsectionlabel = section.name_en if section.name_en else section.name
        elif g.lang == "kg":
            dirsectionlabel = section.name_kg if section.name_kg else section.name
        else:
            dirsectionlabel = section.name
        contract = orm_to_json(ct)
        contract['pur_company'] = pur_company if pur_company else ''
        contract['sup_company'] = sup_company if sup_company else ''
        contract['dirsection'] = dirsectionlabel
        contracts.append(contract)

    return {'docs': contracts}


def get(bag):
    pur_comp = aliased(db.Companies)
    sup_comp = aliased(db.Companies)

    cont, pur_company, adv, section, procur, sup_company = g.tran.query(
        db.Contract, pur_comp, db.Advert, db.DirSection, db.DirProcurement, sup_comp) \
        .outerjoin(pur_comp, and_(db.Contract.purchaser_company_id == pur_comp._id,
                                  pur_comp._deleted == INFINITY)) \
        .outerjoin(db.Advert, and_(db.Contract.advert_id == db.Advert._id,
                                   db.Advert._deleted == INFINITY)) \
        .outerjoin(db.DirSection, and_(db.Advert.dirsection_id == db.DirSection._id,
                                       db.DirSection._deleted == INFINITY)) \
        .outerjoin(sup_comp, and_(db.Contract.supplier_company_id == sup_comp._id,
                                  sup_comp._deleted == INFINITY)) \
        .filter(db.Contract.id == bag['id']).first()

    contract = orm_to_json(cont)
    pur_company_bank = g.tran.query(db.Companybank).filter_by(_deleted='infinity', company_id=pur_company._id).first()
    if pur_company_bank:
        dirbank = g.tran.query(db.DirBank).filter_by(_deleted='infinity', _id=pur_company_bank.dirbank_id).first()
        if dirbank:
            pur_company_bank.dirbank = dirbank
        pur_company.bank = pur_company_bank
    sup_company_bank = g.tran.query(db.Companybank).filter_by(_deleted='infinity', company_id=sup_company._id).first()
    if sup_company_bank:
        dirbank = g.tran.query(db.DirBank).filter_by(_deleted='infinity', _id=sup_company_bank.dirbank_id).first()
        if dirbank:
            sup_company_bank.dirbank = dirbank
        sup_company.bank = sup_company_bank

    if pur_company.typeofownership_id:
        pur_company.ownership = g.tran.query(db.Typeofownership).filter_by(_id=pur_company.typeofownership_id).first()

    ceo = g.tran.query(db.Companyemployees)\
        .filter(db.Companyemployees.company_id == pur_company._id, db.Companyemployees.head == True).first()

    pur_company.ceo = g.tran.query(db.User).filter(db.User.id == ceo.user_id).first()

    if sup_company.typeofownership_id:
        sup_company.ownership = g.tran.query(db.Typeofownership).filter_by(_id=sup_company.typeofownership_id).first()

    contract['pur_company'] = pur_company if pur_company else ''
    contract['sup_company'] = sup_company if sup_company else ''

    if g.lang == "ru":
        dirprocurement_name = procur.name
    elif g.lang == "en":
        dirprocurement_name = procur.name_en if procur.name_en else procur.name
    elif g.lang == "kg":
        dirprocurement_name = procur.name_kg if procur.name_kg else procur.name
    else:
        dirprocurement_name = procur.name

    ann = orm_to_json(adv)
    ann['dirprocurement_name'] = dirprocurement_name
    contract['announce'] = ann

    cont_lots = g.tran.query(db.ContractLots, db.Advert_lot, db.DirCategory, db.Application) \
        .outerjoin(db.Advert_lot, and_(db.ContractLots.advert_lot_id == db.Advert_lot._id,
                                       db.Advert_lot._deleted == INFINITY)) \
        .outerjoin(db.DirCategory, db.Advert_lot.dircategory_id == db.DirCategory.id) \
        .outerjoin(db.Application, and_(db.ContractLots.application_id == db.Application._id,
                                        db.Application._deleted == INFINITY)) \
        .filter(db.ContractLots.contract_id == cont.id).all()
    lots = []
    for cl, al, cat, appl in cont_lots:
        lot = orm_to_json(al)
        if g.lang == "ru":
            dircategory_name = cat.name
        elif g.lang == "en":
            dircategory_name = cat.name_en if cat.name_en else cat.name
        elif g.lang == "kg":
            dircategory_name = cat.name_kg if cat.name_kg else cat.name
        else:
            dircategory_name = cat.name
        lot['dircategory_name'] = dircategory_name
        lot['unit_price'] = appl.unit_price if appl else 0
        lot['dirunit'] = appl.unit_price if lot else 0
        lot['total'] = appl.total if appl else 0
        lot['lot_id'] = cl.id if cl else ''
        lot['app_id'] = appl._id if appl else ''
        if lot['dirunits_id']:
            lot['dirunit'] = g.tran.query(db.DirUnits) \
                .filter_by(_deleted='infinity', _id=lot['dirunits_id']).first()
        lots.append(lot)
    contract['lots'] = lots

    return {'doc': contract}


def send_otp(bag):
    if not hasattr(g, 'user'):
        raise CbsException(GENERIC_ERROR, u'Пользователь не авторизован')

    otp = get_totp(g.user.phone)
    msg = u'Код подтверждения: {}'.format(otp)
    sms_data = {'source_addr': bag.get('command', 'recovery'), 'dest_addr': g.user.phone, 'msg': msg}
    so = entity.add({CRUD: db.SmsOutbox, BOBJECT: sms_data})
    sms.send(g.user.phone, msg, so.id)


def decline(bag):
    contract = g.tran.query(db.Contract).filter_by(id=bag['id']) \
        .filter(or_(db.Contract.status == 'Pending', db.Contract.status == 'Schedule')) \
        .first()

    if not contract:
        raise CbsException(GENERIC_ERROR,
                           u'Контракт не найден')

    if g.company.company_type != 'supplier':
        raise CbsException(GENERIC_ERROR,
                           u'Вы не являетесь поставщиком!')
    contract.status = 'Declined'
    contract = {
        'id': contract.id,
        'code': contract.code,
        'status': contract.status,
        'advert_id': contract.advert_id,
        'purchaser_company_id': contract.purchaser_company_id,
        'supplier_company_id': contract.supplier_company_id,
        'dirsection_id': contract.dirsection_id,
        'total': contract.total,
        'created_date': contract.created_date
    }

    contr = entity.add({CRUD: db.Contract, BOBJECT: contract})
    return {'doc': contr}


def credit_specs(bag):
    query = g.tran.query(db.User).select_from(db.User).filter(db.User.role == 2)
    doc_vars = vars(db.User)
    for var in doc_vars:
        if var != 'password' and var != 'secure' and isinstance(doc_vars[var], InstrumentedAttribute):
            query = query.add_column(doc_vars[var])
    users = query.all()
    for user in users:
        count = g.tran.query(db.Advert).filter_by(_deleted='infinity', edit_user_id=user.id).count()
        user.policies_count = count
    return {'users': orm_to_json(users)}


@is_purchaser()
def pur_update(bag):
    con_status = ["Schedule", "Review"]
    contract = g.tran.query(db.Contract) \
        .filter_by(id=bag['id']) \
        .filter(and_(db.Contract.status.in_(con_status),
                     db.Contract.purchaser_company_id == g.company._id)) \
        .first()

    if not contract:
        raise CbsException(GENERIC_ERROR, u'Не найден договор')

    cons_bag = bag['consignments']
    invs_bag = bag['invoices']

    for con_bag in cons_bag:
        if 'id' in con_bag:
            cons_lot_list_values_ids = []
            con_bag_lot_values_ids = []
            cons_list = g.tran.query(db.ConsignmentLots) \
                .filter(db.ConsignmentLots.consignment_id == con_bag['id']).all()
            if cons_list:
                for con_value in cons_list:
                    cons_lot_list_values_ids.append(con_value.id)
            for lot in con_bag['lots']:
                con_bag_lot_values_ids.append(lot['id'])
            clv_ids = Set(cons_lot_list_values_ids)
            cbv_ids = Set(con_bag_lot_values_ids)
            dfd = clv_ids.symmetric_difference(cbv_ids)
            if len(dfd) > 0:
                for d_id in dfd:
                    entity.remove({CRUD: db.ConsignmentLots, ID: d_id})

            cons_list_values_ids = []
            con_bag_values_ids = []
            cons_list_values = g.tran.query(db.Consignment) \
                .filter(db.Consignment.contract_id == contract.id).all()
            if cons_list_values:
                for con_val in cons_list_values:
                    cons_list_values_ids.append(con_val.id)
            for con_bag_tmp in cons_bag:
                if 'id' in con_bag_tmp:
                    con_bag_values_ids.append(con_bag_tmp['id'])
            sd = Set(cons_list_values_ids)
            td = Set(con_bag_values_ids)
            dfd = sd.symmetric_difference(td)
            if len(dfd) > 0:
                for d_id in dfd:
                    con_lot_val_list = g.tran.query(db.ConsignmentLots) \
                        .filter(db.ConsignmentLots.consignment_id == d_id).all()
                    if con_lot_val_list:
                        for val in con_lot_val_list:
                            entity.remove({CRUD: db.ConsignmentLots, ID: val.id})
                    entity.remove({CRUD: db.Consignment, ID: d_id})

    for con_bag in cons_bag:
        consigment = {}
        if 'id' in con_bag:
            con = g.tran.query(db.Consignment).filter(and_(
                db.Consignment.id == con_bag['id'],
                db.Consignment.contract_id == contract.id,
            )).first()

            if not con:
                raise CbsException(GENERIC_ERROR, u'Неверный consignment.id')

            consigment['id'] = con_bag['id']

        consigment['advert_id'] = contract.advert_id
        consigment['contract_id'] = contract.id
        consigment['purchaser_company_id'] = contract.purchaser_company_id
        consigment['supplier_company_id'] = contract.supplier_company_id
        consigment['date_to'] = con_bag['date_to'] or None
        consigment['date_from'] = con_bag['date_from'] or None
        consigment['address'] = con_bag['address'] or None
        consigment['conditions'] = con_bag['conditions'] or None
        res_con = entity.add({CRUD: db.Consignment, BOBJECT: consigment})

        for lot_bag in con_bag['lots']:
            lot = {}
            if 'id' in lot_bag:
                lot_db = g.tran.query(db.ConsignmentLots).filter(and_(
                    db.ConsignmentLots.id == lot_bag['id'],
                    db.ConsignmentLots.consignment_id == res_con.id,
                )).first()

                if not lot_db:
                    raise CbsException(GENERIC_ERROR, u'Неверный lot.id')

                lot['id'] = lot_bag['id']

            contract_lot = g.tran.query(db.ContractLots).filter(and_(
                db.ContractLots.advert_lot_id == lot_bag['advert_lot_id'],
                db.ContractLots.contract_id == contract.id,
            )).first()

            if not contract_lot:
                raise CbsException(GENERIC_ERROR, u'Неверный advert_lot_id')

            lot['advert_lot_id'] = lot_bag['advert_lot_id']
            lot['consignment_id'] = res_con.id
            lot['quantity'] = lot_bag['quantity']
            # lot['unit_price'] = item['unit_price']
            # lot['total'] = item['total']
            res_con_lot = entity.add({CRUD: db.ConsignmentLots, BOBJECT: lot})

    sum_percent = sum([d['percent'] for d in invs_bag])
    if sum_percent != 100:
        raise CbsException(GENERIC_ERROR, u'Сумма платежей должна быть не менее 100%')

    invoice_list_values_ids = []
    invoice_bag_values_ids = []
    inv_list = g.tran.query(db.Invoice) \
        .filter(db.Invoice.contract_id == contract.id).all()
    if inv_list:
        for inv_value in inv_list:
            invoice_list_values_ids.append(inv_value.id)
    for lot_bag in invs_bag:
        if 'id' in lot_bag:
            invoice_bag_values_ids.append(lot_bag['id'])
    clv_ids = Set(invoice_list_values_ids)
    cbv_ids = Set(invoice_bag_values_ids)
    dfd = clv_ids.symmetric_difference(cbv_ids)
    if len(dfd) > 0:
        for d_id in dfd:
            entity.remove({CRUD: db.Invoice, ID: d_id})

    for inv in invs_bag:
        invoice = {}
        if 'id' in inv:
            invoice_db = g.tran.query(db.Invoice).filter(and_(
                db.Invoice.id == inv['id'],
                db.Invoice.contract_id == contract.id,
            )).first()

            if not invoice_db:
                raise CbsException(GENERIC_ERROR, u'Неверный Invoice.id')

            invoice['id'] = inv['id']

        invoice['contract_id'] = contract.id
        invoice['advert_id'] = contract.advert_id
        invoice['purchaser_company_id'] = contract.purchaser_company_id
        invoice['supplier_company_id'] = contract.supplier_company_id
        invoice['date'] = inv['date']
        invoice['type'] = inv['type']
        invoice['editable'] = inv['editable']
        invoice['percent'] = inv['percent']
        invoice['amount'] = (contract.total * inv['percent']) / 100
        invoice['created_date'] = datetime.datetime.now()
        invoice['updated_date'] = datetime.datetime.now()
        invoice['conditions'] = inv['conditions']
        # invoice['data'] = inv['data'] or {}
        # invoice['status'] = inv['status']
        result_invoice = entity.add({CRUD: db.Invoice, BOBJECT: invoice})

    if bag.get('comment'):
        contract.comment.append(
            {
                "pur_company": g.company._id,
                "comment": bag['comment'],
                "date": datetime.datetime.now()
            }
        )
        # contract.date_pur_submit = datetime.datetime.now()
        # contract.status = 'Pending'
        entity.add({CRUD: db.Contract, BOBJECT: contract})

    return


@is_purchaser()
def pur_submit(bag):
    con_status = ["Schedule", "Review"]
    contract = g.tran.query(db.Contract) \
        .filter_by(id=bag['id']) \
        .filter(and_(db.Contract.status.in_(con_status),
                     db.Contract.purchaser_company_id == g.company._id)) \
        .first()

    if not contract:
        raise CbsException(GENERIC_ERROR, u'Не найден договор')

    contract.date_pur_submit = datetime.datetime.now()
    contract.status = 'Pending'

    if bag.get('comment'):
        contract.comment.append(
            {
                "pur_company": g.company._id,
                "comment": bag['comment'],
                "date": datetime.datetime.now()
            }
        )

    # save
    entity.add({CRUD: db.Contract, BOBJECT: orm_to_json(contract)})

    return


@is_supplier()
def sup_submit(bag):
    # check_otp(g.user.phone, bag['otpcode'])

    contract = g.tran.query(db.Contract) \
        .filter_by(id=bag['id']) \
        .filter(and_(db.Contract.status == 'Pending',
                     db.Contract.supplier_company_id == g.company._id)) \
        .first()

    if not contract:
        raise CbsException(GENERIC_ERROR, u'Не найден договор')

    contract.date_sup_submit = datetime.datetime.now()
    contract.status = 'Active'

    sql = g.tran.query(db.Advert_lot, db.Application) \
        .outerjoin(db.Application, and_(db.Advert_lot._id == db.Application.advert_lot_id,
                                        db.Application._deleted == INFINITY)) \
        .filter(db.Advert_lot.advert_id == contract.advert_id,
                db.Advert_lot._deleted == INFINITY)
    for lot, appl in sql.all():
        if appl:
            appl.lot_id = lot.lot_id
            appl.product_id = lot.product_id
            g.tran.add(appl)

    if bag.get('comment'):
        contract.comment.append(
            {
                "pur_company": g.company._id,
                "comment": bag['comment'],
                "date": datetime.datetime.now()
            }
        )
    advert = g.tran.query(db.Advert).filter_by(_deleted='infinity').filter(db.Advert._id == contract.advert_id).first()
    Force_status_list = ['ENSURE_SECURITY_KR', 'EARLY_ELECTIONS', 'LOCALIZE_FORCE_MAJEURE', 'THREE_PERCENT_SERVICE']
    dirprocumenet = g.tran.query(db.DirProcurement)\
        .filter_by(_deleted='infinity').filter(and_(db.DirProcurement.code.in_(Force_status_list),
                                               db.DirProcurement._id == advert.dirprocurement_id))\
        .first()
    if dirprocumenet:
        controller.call(controller_name='announce.sendContract', bag={'contract': contract, 'code': dirprocumenet.code})
    else:
        controller.call(controller_name='announce.sendAnnounce',
                    bag={'advert_id': contract.advert_id, 'contract_code': contract.code})

    entity.add({CRUD: db.Contract, BOBJECT: orm_to_json(contract)})
    return


def sign(bag):
    contract = g.tran.query(db.Contract).filter_by(id=bag['id'], status='Pending').first()
    if g.company.company_type != 'supplier':
        raise CbsException(GENERIC_ERROR,
                           u'Вы не являетесь поставщиком!')
    check_otp(g.user.phone, bag['otpcode'])
    contract.status = 'Signed'
    contract = {
        'id': contract.id,
        'code': contract.code,
        'status': contract.status,
        'advert_id': contract.advert_id,
        'purchaser_company_id': contract.purchaser_company_id,
        'supplier_company_id': contract.supplier_company_id,
        'dirsection_id': contract.dirsection_id,
        'total': contract.total,
        'created_date': contract.created_date
    }

    contr = entity.add({CRUD: db.Contract, BOBJECT: contract})
    return {'doc': contr}


@is_supplier()
def sup_review(bag):
    contract = g.tran.query(db.Contract) \
        .filter_by(id=bag['id']) \
        .filter(and_(db.Contract.status == 'Pending',
                     db.Contract.purchaser_company_id == g.company._id)).first()
    if contract:
        if bag.get('comment'):
            contract.comment.append(
                {
                    "pur_company": g.company._id,
                    "comment": bag['comment'],
                    "date": datetime.datetime.now()
                }
            )
            contract.status = 'Review'
            entity.add({CRUD: db.Contract, BOBJECT: contract})
    else:
        raise CbsException(GENERIC_ERROR,
                           u'Не найден договор')
    return


@is_purchaser()
def pur_decline(bag):
    con_status = ["Schedule", "Review"]
    contract = g.tran.query(db.Contract) \
        .filter_by(id=bag['id']) \
        .filter(and_(db.Contract.status.in_(con_status),
                     db.Contract.purchaser_company_id == g.company._id)).first()
    if contract:
        contract.status = 'Canceled'
        contract.update_date = datetime.datetime.now()
        contract.reason = bag['reason'] or ''
        contract.who_canceled = g.company._id
        entity.add({CRUD: db.Contract, BOBJECT: contract})
    return


@is_supplier()
def sup_decline(bag):
    contract = g.tran.query(db.Contract) \
        .filter_by(id=bag['id']) \
        .filter(and_(db.Contract.status == 'Pending',
                     db.Contract.purchaser_company_id == g.company._id)).first()
    if contract:
        contract.status = 'Canceled'
        contract.date_canceled = datetime.datetime.now()
        contract.reason = bag['reason'] or ''
        contract.who_canceled = g.company._id
        entity.add({CRUD: db.Contract, BOBJECT: contract})
    else:
        raise CbsException(GENERIC_ERROR,
                           u'Не найден договор')
    return


@is_purchaser()
def finish(bag):
    contract = g.tran.query(db.Contract) \
        .filter(and_(db.Contract.id == bag['id'],
                     db.Contract.status == 'Active',
                     db.Contract.purchaser_company_id == g.company._id)) \
        .first()

    if not contract:
        raise CbsException(GENERIC_ERROR, u'Не найден договор')

    invoices = g.tran.query(db.Invoice) \
        .filter(and_(db.Invoice.contract_id == contract.id, db.Invoice.status != 'Finished')) \
        .all()

    if invoices:
        raise CbsException(GENERIC_ERROR, u'Необходимо завершить все платежи по данному контракту!')

    consigments = g.tran.query(db.Consignment) \
        .filter(db.Consignment.contract_id == contract.id, db.Consignment.got_status != True) \
        .all()

    if consigments:
        raise CbsException(GENERIC_ERROR, u'Необходимо завершить накладные!')

    contract.status = 'Finished'

    # save
    g.tran.add(contract)
    g.tran.flush()

    return
