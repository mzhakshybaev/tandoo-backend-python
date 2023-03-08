# coding=utf-8
from flask import g
from sqlalchemy import and_
from sqlalchemy import func
from sqlalchemy import or_

from app import service
from app.model import db
from app.utils import orm_to_json


def update_statuses(bag):
    adverts = g.tran.query(db.Advert).filter_by(_deleted='infinity') \
        .filter(and_(db.Advert.deadline < func.now(), db.Advert.status == 'Published')).all()

    for p in adverts:
        service.call('job.status_check', {'advert': orm_to_json(p)})
