# coding=utf-8
import datetime

from flask import g
from sqlalchemy import and_, func, text, TEXT
from sqlalchemy import or_
from sqlalchemy.orm import aliased

from app.controller import entity
from app.helper.utils import get_code, get_code_consignment
from app.keys import INFINITY, BOBJECT, CRUD
from app.messages import GENERIC_ERROR
from app.model import db
from app.service import is_purchaser
from app.utils import orm_to_json, CbsException


def listing(bag):
    consignments = []
    pur_comp = aliased(db.Companies)
    sup_comp = aliased(db.Companies)

    if not bag.get('contract_id'):
        raise CbsException(GENERIC_ERROR, u'Укажите id договора')

    sql = g.tran.query(db.Consignment, pur_comp.short_name.label('pur_company'), db.DirSection,
                       sup_comp.short_name.label('sup_company')) \
        .outerjoin(pur_comp, and_(db.Consignment.purchaser_company_id == pur_comp._id,
                                  pur_comp._deleted == INFINITY)) \
        .outerjoin(db.Advert, and_(db.Consignment.advert_id == db.Advert._id,
                                   db.Advert._deleted == INFINITY)) \
        .outerjoin(db.DirSection, and_(db.Advert.dirsection_id == db.DirSection._id,
                                       db.DirSection._deleted == INFINITY)) \
        .outerjoin(sup_comp, and_(db.Consignment.supplier_company_id == sup_comp._id,
                                  sup_comp._deleted == INFINITY)) \
        .filter(or_(db.Consignment.purchaser_company_id == g.company._id,
                    db.Consignment.supplier_company_id == g.company._id)) \
        .filter(db.Consignment.contract_id == bag['contract_id'])\
        .order_by(db.Consignment.date_to)

    for ct, pur_company, section, sup_company in sql.all():
        consignment = orm_to_json(ct)
        lots = g.tran.query(db.ConsignmentLots)\
            .filter(db.ConsignmentLots.consignment_id == consignment['id'])
        lots = orm_to_json(lots.all())

        consignment['pur_company'] = pur_company if pur_company else ''
        consignment['sup_company'] = sup_company if sup_company else ''
        consignment['dirsection'] = section.name if section else ''
        consignment['lots'] = lots if lots else []
        consignments.append(consignment)

    return {'docs': consignments}


def get(bag):
    pur_comp = aliased(db.Companies)
    sup_comp = aliased(db.Companies)

    cons, pur_company, adv, section, procur, sup_company = g.tran.query(
        db.Consignment, pur_comp, db.Advert, db.DirSection, db.DirProcurement, sup_comp) \
        .outerjoin(pur_comp, and_(db.Consignment.purchaser_company_id == pur_comp._id,
                                  pur_comp._deleted == INFINITY)) \
        .outerjoin(db.Advert, and_(db.Consignment.advert_id == db.Advert._id,
                                   db.Advert._deleted == INFINITY)) \
        .outerjoin(db.DirSection, and_(db.Advert.dirsection_id == db.DirSection._id,
                                       db.DirSection._deleted == INFINITY)) \
        .outerjoin(sup_comp, and_(db.Consignment.supplier_company_id == sup_comp._id,
                                  sup_comp._deleted == INFINITY)) \
        .filter(db.Consignment.id == bag['id']).first()

    consignment = orm_to_json(cons)
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

    consignment['pur_company'] = pur_company if pur_company else ''
    consignment['sup_company'] = sup_company if sup_company else ''

    ann = orm_to_json(adv)
    ann['dirprocurement_name'] = procur.name if procur else ''
    consignment['announce'] = ann

    cons_lots = g.tran.query(db.ConsignmentLots, db.Advert_lot, db.DirCategory) \
        .outerjoin(db.Advert_lot, and_(db.ConsignmentLots.advert_lot_id == db.Advert_lot._id,
                                       db.Advert_lot._deleted == INFINITY)) \
        .outerjoin(db.DirCategory, db.Advert_lot.dircategory_id == db.DirCategory.id)\
        .filter(db.ConsignmentLots.consignment_id == cons.id).all()
    lots = []
    for cl, al, cat in cons_lots:
        lot = orm_to_json(al)
        lot['dircategory_name'] = cat.name if cat else ''
        lots.append(lot)
    consignment['lots'] = lots

    return {'doc': consignment}


@is_purchaser()
def finish(bag):
    con = g.tran.query(db.Consignment)\
        .filter(db.Consignment.id == int(bag['id']),
                db.Consignment.got_status is not True,
                db.Consignment.purchaser_company_id == g.company._id).first()

    if not con:
        raise CbsException(GENERIC_ERROR, u'Не найдена накладная')

    contract = g.tran.query(db.Contract)\
        .filter(and_(db.Contract.id == con.contract_id,
                     db.Contract.status == 'Active',
                     db.Contract.purchaser_company_id == g.company._id))\
        .first()

    if not contract:
        raise CbsException(GENERIC_ERROR, u'Не найден договор')

    con.got_status = True

    # save
    g.tran.add(con)
    g.tran.flush()

    return


# def sign(bag):
#     consignment = g.tran.query(db.Contract).filter_by(id=bag['id'], status='Pending').first()
#     if g.company.company_type != 'supplier':
#         raise CbsException(GENERIC_ERROR,
#                            u'Вы не являетесь поставщиком!')
#     consignment.status = 'Signed'
#     contract = {
#         'id': consignment.id,
#         'code': consignment.code,
#         'status': consignment.status,
#         'advert_id': consignment.advert_id,
#         'purchaser_company_id': consignment.purchaser_company_id,
#         'supplier_company_id': consignment.supplier_company_id,
#         'dirsection_id': consignment.dirsection_id,
#         'total': consignment.total,
#         'created_date': consignment.created_date
#     }
#
#     contr = entity.add({CRUD: db.Contract, BOBJECT: contract})
#     return {'doc': contr}
#
#
# def decline(bag):
#     contract = g.tran.query(db.Contract).filter_by(id=bag['id'], status='Pending').first()
#     if g.company.company_type != 'supplier':
#         raise CbsException(GENERIC_ERROR,
#                            u'Вы не являетесь поставщиком!')
#     contract.status = 'Declined'
#     contract = {
#         'id': contract.id,
#         'code': contract.code,
#         'status': contract.status,
#         'advert_id': contract.advert_id,
#         'purchaser_company_id': contract.purchaser_company_id,
#         'supplier_company_id': contract.supplier_company_id,
#         'dirsection_id': contract.dirsection_id,
#         'total':contract.total,
#         'created_date': contract.created_date
#     }
#
#     contr = entity.add({CRUD: db.Contract, BOBJECT: contract})
#     return {'doc': contr}
#
#
# def save(bag):
#     consignment = {
#         'number': bag['code']+"-"+get_code_consignment(),
#         'date_number': datetime.datetime.now(),
#         'advert_id': bag['advert_id'],
#         'contract_id': bag['contract_id'],
#         'purchaser_company_id': bag['purchaser_company_id'],
#         'supplier_company_id': bag['supplier_company_id'],
#         'sent_status': bag['sent_status'],
#         'got_status': bag['got_status'],
#         'comment': bag['comment'] if bag.get('comment') else None,
#         'data': bag['data'] if bag.get('data') else {}
#
#     }
#     conts = entity.add({CRUD: db.Consignment, BOBJECT: consignment})
#     if bag.get('lots'):
#         for lot in bag['lots']:
#             con_lot = {
#                 'status': 'Draft',
#                 'consignment_id': conts.id,
#                 'advert_lot_id': lot['lot_id'],
#                 'application_id': lot['app_id'],
#                 'quantity': lot['quantity'],
#                 'unit_price': lot['unit_price'],
#                 'total': lot['total'],
#                 'data': {}
#             }
#             conts_lot = entity.add({CRUD: db.ConsignmentLots, BOBJECT: con_lot})
#     return {'doc': conts}