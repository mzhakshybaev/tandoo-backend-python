# coding=utf-8
from flask import g
from sqlalchemy import INTEGER
from sqlalchemy import TEXT
from sqlalchemy import type_coerce
from sqlalchemy.dialects.postgresql import JSONB

from app.controller import entity
from app.keys import CRUD, BOBJECT, ID
from app.messages import NO_DATA, DOCUMENT_TYPE_UNDEFINED
from app.model import db
from app.utils import CbsException
from apputils import orm_to_json


def put(bag):
    notification = entity.add({CRUD: db.NotificationCompany, BOBJECT: bag})
    return {'notification': notification}


def read(bag):
    notification = g.tran.query(db.NotificationCompany).filter_by(company_id=g.company._id, id=bag[ID]).first()
    if notification:
        notification.notification_status = 'read'
        return {'notification': notification}
    raise CbsException(NO_DATA)


def listing(bag):
    query = g.tran.query(db.NotificationCompany)\
        .filter_by(company_id=g.company._id, type=bag['type'])
    count = query.count()
    if "limit" in bag:
        query = query.limit(bag["limit"])
    if "offset" in bag:
        query = query.offset(bag["offset"])
    notifications = orm_to_json(query.all())
    return {'notifications': notifications, 'count': count}


def get_doc(bag):
    notifications = g.tran.query(db.NotificationCompany)\
        .filter_by(notification_status='active', company_id=g.company._id).all()
    for notification in notifications:
        notification.notification_status = 'read'

