# coding=utf-8

from flask import g

from app import controller
from app.model import db
from app.service import table_access, chain
from app.utils import orm_to_json


def mainlisting(bag):
    query = g.tran.query(db.New).filter_by(_deleted='infinity')
    query.section = None
    if bag.get('title'):
        query = query.filter(db.New.title.ilike('%' + bag.get('title') + '%'))
        del bag["title"]
    if bag.get('created_from'):
        query = query.filter(db.New.created_from >= bag.get('created_from'))
        del bag["created_from"]
    if bag.get('active'):
        query = query.filter(db.New.is_active == bag.get('active'))
        del bag["active"]
    query = query.order_by(db.New.created_from.desc())
    query = query.limit(10).all()
    news = orm_to_json(query)

    # builds content without styles
    for n in news:
        content = ""
        if n.get('data') and n['data']['blocks']:
            for b in n['data']['blocks']:
                content += b['text']
            n['data'] = content
    return {'docs': news}


@table_access(name=db.New.__name__)
@chain(controller_name='data.get', output=['doc'])
def get(bag):
    pass


@table_access('New')
@chain(controller_name='data.listing', output=['docs'])
def listing(bag):
    pass


@table_access(name='New')
@chain(controller_name='data.put', output=['id', 'rev'])
def put(bag):
    pass


@table_access('New')
@chain(controller_name='data.remove', output=["ok", "id", "rev"])
def delete(bag):
    pass


@table_access(name='New')
def activate(bag):
    if '_id' in bag:
        new = g.tran.query(db.New).filter_by(_deleted='infinity', _id=bag['_id']).first()
        new = orm_to_json(new)
        if 'active' in bag:
            new['type'] = 'New'
            new['is_active'] = bag['active']
            return controller.call(controller_name='data.put', bag=new)