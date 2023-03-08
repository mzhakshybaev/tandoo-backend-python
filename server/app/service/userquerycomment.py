# coding=utf-8
from app.model import db
from app.service import table_access, chain


@table_access('UserQueryComment')
@chain(controller_name='data.listing', output=['docs', 'count'])
def listing(bag):
    pass


@table_access('UserQueryComment')
@chain(controller_name='data.put', output=['id', 'rev'])
def save(bag):
    pass