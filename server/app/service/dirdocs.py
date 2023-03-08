# coding=utf-8

from flask import g

from app import controller
from app.controller import entity
from app.keys import CRUD, BOBJECT, ID
from app.model import db
from app.service import table_access, chain
from app.utils import orm_to_json


def listing(bag):
    query = g.tran.query(db.DirDoc)
    if bag.get('title'):
        query = query.filter(db.DirDoc.title.ilike('%' + bag.get('title') + '%'))
        del bag["title"]
    if bag.get('created_from'):
        query = query.filter(db.DirDoc.created_from >= bag.get('created_from'))
        del bag["created_from"]
    if bag.get('active'):
        query = query.filter(db.DirDoc.is_active == bag.get('active'))
        del bag["active"]
    query = query.order_by(db.DirDoc.created_from.desc())
    query = query.limit(10).all()
    dirDocs = orm_to_json(query)

    # builds content without styles
    for n in dirDocs:
        content = ""
        if n.get('data') and n['data']['blocks']:
            for b in n['data']['blocks']:
                content += b['text']
            n['data'] = content
    return {'docs': dirDocs}


@table_access(name='DirDoc')
def activate(bag):
    if 'id' in bag:
        DirDoc = g.tran.query(db.DirDoc).filter_by(id=bag['id']).first()
        DirDoc = orm_to_json(DirDoc)
        if 'active' in bag:
            DirDoc['type'] = 'DirDoc'
            DirDoc['is_active'] = bag['active']
            return entity.add({CRUD: db.DirDoc, BOBJECT: DirDoc})


@table_access(name='DirDoc')
def save(bag):
    reg = entity.add({CRUD: db.DirDoc, BOBJECT: bag})
    return {BOBJECT: orm_to_json(reg)}


@table_access(name='DirDoc')
def remove(bag):
    reg = entity.remove({CRUD: db.DirDoc, ID: bag['id']})


def get(bag):
    query = g.tran.query(db.DirDoc)
    if bag.get('id'):
        query = query.filter(db.DirDoc.id == bag['id'])
        del bag["id"]
    if bag.get('filter') and 'code' in bag['filter']:
        query = query.filter(db.DirDoc.code == bag['filter']['code'])
        del bag['filter']["code"]
    query = query.first()
    return {'doc': query}