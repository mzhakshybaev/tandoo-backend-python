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
    notification = entity.add({CRUD: db.Notification, BOBJECT: bag})
    return {'notification': notification}


def read(bag):
    notification = g.tran.query(db.Notification).filter_by(user_id=g.user.id, id=bag[ID]).first()
    if notification:
        notification.notification_status = 'read'
        return {'notification': notification}
    raise CbsException(NO_DATA)


def listing(bag):
    notifications = g.tran.query(db.Notification).filter_by(user_id=g.user.id, notification_status='active')
    notifications_count = notifications.count()
    notifications = notifications.all()
    return {'notifications': orm_to_json(notifications), 'count': notifications_count}


def get_doc(bag):
    notifications = g.tran.query(db.Notification).filter_by(notification_status='active', user_id=g.user.id) \
        .filter(db.Notification.data.contains(type_coerce({'document_id': bag['_id']}, JSONB))).all()
    for notification in notifications:
        notification.notification_status = 'read'

