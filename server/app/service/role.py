# coding=utf-8
from flask import g

from app import controller
from app.messages import GENERIC_ERROR
from app.model import db
from app.service import table_access, chain
from app.utils import orm_to_json, CbsException


@table_access(name=db.Roles.__name__)
@chain(controller_name='data.listing', output=['docs', 'count'])
def listing(bag):
    pass


@table_access('Roles')
def save(bag):
    if isinstance(bag['menus_id'], (unicode, str)):
        bag['menus_id'] = bag['menus_id'].split(",")
    return controller.call(controller_name='data.put', bag=bag)


@table_access('Roles')
def get(bag):
    if hasattr(g, 'company'):
        roles = g.tran.query(db.Roles).filter_by(_deleted='infinity').filter(db.Roles.parent_id.in_(g.company.roles_id))
        count = roles.count()
        roles = orm_to_json(roles.all())
    else:
        raise CbsException(GENERIC_ERROR, u'У вас не выбрана организация')
    return {'docs': roles, 'count': count}