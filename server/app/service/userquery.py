# coding=utf-8
from flask import g

from app.messages import GENERIC_ERROR
from app.model import db
from app.service import table_access, chain
from app.utils import CbsException


@table_access('UserQuery')
@chain(controller_name='data.listing', output=['docs', 'count'])
def listing(bag):
    pass


@table_access('UserQuery')
@chain(controller_name='data.put', output=['id', 'rev'])
def save(bag):
    pass


def get(bag):
    if "id" in bag:
        userquery = g.tran.query(db.UserQuery).filter_by(_deleted='infinity')\
            .filter(db.UserQuery._id == bag["id"]).first()
        userquery.comments = g.tran.qeury(db.UserQueryComment).filter_by(_deleted='infinity')\
            .filter(db.UserQueryComment.userquery_id == userquery._id).all()
        return {'doc': userquery}

