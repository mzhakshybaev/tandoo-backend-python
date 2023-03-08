# coding=utf-8

from flask import g
from sqlalchemy import and_
from sqlalchemy import or_
from sqlalchemy.orm import aliased

from app import controller
from app.controller import entity
from app.controller.user import get_totp, check_otp
from app.helper import sms
from app.keys import INFINITY, BOBJECT, CRUD
from app.messages import GENERIC_ERROR
from app.model import db
from app.service import is_purchaser
from app.utils import orm_to_json, CbsException


def listing(bag):
    invoices = []
    pur_comp = aliased(db.Companies)
    sup_comp = aliased(db.Companies)

    if not bag.get('contract_id'):
        raise CbsException(GENERIC_ERROR, u'Укажите id договора')

    sql = g.tran.query(db.Invoice, pur_comp.short_name.label('pur_company'), db.DirSection,
                       sup_comp.short_name.label('sup_company')) \
        .outerjoin(pur_comp, and_(db.Invoice.purchaser_company_id == pur_comp._id,
                                  pur_comp._deleted == INFINITY)) \
        .outerjoin(db.Advert, and_(db.Invoice.advert_id == db.Advert._id,
                                   db.Advert._deleted == INFINITY)) \
        .outerjoin(db.DirSection, and_(db.Advert.dirsection_id == db.DirSection._id,
                                       db.DirSection._deleted == INFINITY)) \
        .outerjoin(sup_comp, and_(db.Invoice.supplier_company_id == sup_comp._id,
                                  sup_comp._deleted == INFINITY)) \
        .filter(or_(db.Invoice.purchaser_company_id == g.company._id,
                    db.Invoice.supplier_company_id == g.company._id)) \
        .filter(db.Invoice.contract_id == bag['contract_id'])\
        .order_by(db.Invoice.date)\
        .order_by(db.Invoice.created_date)

    for ct, pur_company, section, sup_company in sql.all():
        contract = orm_to_json(ct)
        contract['pur_company'] = pur_company if pur_company else ''
        contract['sup_company'] = sup_company if sup_company else ''
        contract['dirsection'] = section.name if section else ''
        invoices.append(contract)

    return {'docs': invoices}


def get(bag):
    invoice = g.tran.query(db.Invoice).filter(db.Invoice.id == bag["id"]).first()
    invoice = orm_to_json(invoice)
    return {'doc': invoice}


@is_purchaser()
def finish(bag):
    inv = g.tran.query(db.Invoice)\
        .filter(and_(db.Invoice.id == int(bag['id']),
                     db.Invoice.status is not True,
                     db.Invoice.purchaser_company_id == g.company._id))\
        .first()

    if not inv:
        raise CbsException(GENERIC_ERROR, u'Не найден счет')

    contract = g.tran.query(db.Contract)\
        .filter(and_(db.Contract.id == inv.contract_id,
                     db.Contract.status == 'Active',
                     db.Contract.purchaser_company_id == g.company._id))\
        .first()

    if not contract:
        raise CbsException(GENERIC_ERROR, u'Не найден договор')

    inv.status = 'Finished'

    # save
    g.tran.add(inv)
    g.tran.flush()

    return



def save(bag):
    contr = {}
    bag['type'] = 'Invoice'
    if bag.get('id'):
        invoice = g.tran.query(db.Invoice).filter_by(_deleted='infinity', _id=bag['id']).first()
        if invoice:
            contract = {
                'type': bag['type'],
                'rev': bag['rev'],
                'status': bag['status'],
                'contract_id': bag['contract_id'],
                'advert_id': bag['advert_id'],
                'advert_lot_id': bag['advert_lot_id'],
                'application_id': bag['application_id'],
                'purchaser_company_id': bag['purchaser_company_id'],
                'supplier_company_id': bag['supplier_company_id'],
                'dirsection_id': bag['dirsection_id'],
                'quantity': bag['quantity'],
                'unit_price': bag['unit_price'],
                'total': bag['total'],
                'created_date': bag['created_date'],
                'updated_date': bag['updated_date'],
                'comment': bag['comment'],
                'data': bag['data']
            }
            contr = controller.call(controller_name='data.put', bag=contract)
    else:
        contr = controller.call(controller_name='data.put', bag=bag)
    return {'doc': contr}