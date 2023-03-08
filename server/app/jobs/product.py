# coding=utf-8
from flask import g
from sqlalchemy import and_
from sqlalchemy import func
from sqlalchemy import or_

from app import service
from app.model import db
from app.utils import orm_to_json


def update_statuses(bag):
    date = g.tran.query(db.Company_product).filter_by(_deleted='infinity')\
        .filter(and_(db.Company_product.date_end < func.now(), db.Company_product.status == 'active')).all()
    if len(date) > 0:
        for p in date:
            service.call('companyproduct.status', {'date': orm_to_json(p)})

