# coding=utf-8
from copy import deepcopy

from flask import g
from sqlalchemy import func
from sqlalchemy.orm.attributes import InstrumentedAttribute
from sqlalchemy.sql import label

from app.controller import entity
from app.keys import BOBJECT, CRUD
from app.model import db
from app.service import chain
from app.utils import orm_to_json, CbsException


@chain(controller_name='notcompany.read', output=['notification'])
def read(bag):
    pass


@chain(controller_name='notcompany.listing', output=['notifications', 'count'])
def listing(bag):
    pass


@chain(controller_name='notcompany.put', output=['notification'])
def save(bag):
    pass


def get_count(bag):
    if hasattr(g, 'company'):
        count = g.tran.query(db.NotificationCompany).filter(
            db.NotificationCompany.notification_status == 'active',
            db.NotificationCompany.company_id == g.company._id).count()

        product_count = g.tran.query(db.NotificationCompany).filter(
            db.NotificationCompany.notification_status == 'active',
            db.NotificationCompany.company_id == g.company._id, db.NotificationCompany.type == 'Products').count()

        company_docs_count = g.tran.query(db.NotificationCompany).filter(
            db.NotificationCompany.notification_status == 'active',
            db.NotificationCompany.company_id == g.company._id, db.NotificationCompany.type == 'CompanyDocs').count()

        announce_count = g.tran.query(db.NotificationCompany).filter(
            db.NotificationCompany.notification_status == 'active',
            db.NotificationCompany.company_id == g.company._id, db.NotificationCompany.type == 'Announce').count()

        return {"product_count": product_count, "count": count,
                "company_docs_count": company_docs_count, "announce_count": announce_count}
    else:
        return {"product_count": 0, "count": 0,
                "company_docs_count": 0, "announce_count": 0}


def remove(bag):
    for item in bag:
        report = entity.remove({CRUD: db.NotificationCompany, BOBJECT: item})
    return
