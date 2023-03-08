# coding=utf-8
from flask import g

from app import controller
from app.model import db
from app.service import table_access, chain
from app.service.dictionary import tables
from app.utils import CbsException
from messages import GENERIC_ERROR


@table_access(name=db.Companybank.__name__)
@chain(controller_name='data.listing', output=['docs', 'count'])
def listing(bag):
    pass


@table_access(name=db.Companybank.__name__)
@chain(controller_name='data.put', output=['id', 'rev'])
def save(bag):
    pass


@table_access(name=db.Companybank.__name__)
def get(bag):
    if hasattr(g, 'company'):
        companybank = g.tran.query(db.Companybank).filter_by(_deleted='infinity', company_id=g.company._id).first()
        dirbank = g.tran.query(db.DirBank)\
            .filter_by(_deleted='infinity')\
            .filter(db.DirBank._id == companybank.dirbank_id).first()
        data = {
            "_id": companybank._id,
            "bank": dirbank.name,
            "dirbank_id": dirbank._id,
            "bank_name": companybank.bank_name,
            "account_number": companybank.account_number,
            "bik": companybank.bik,
            "okpo": companybank.okpo,
            "data": companybank.data
        }
        return {'doc': data}
    else:
        raise CbsException(GENERIC_ERROR, u'У вас нет выбранной организации')