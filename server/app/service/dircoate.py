# -*- coding: utf-8 -*-

from flask import g
from sqlalchemy import or_, func
from app.controller import entity
from app.keys import BOBJECT, CRUD, ID
from app.model import db
from app.service import table_access
from app.utils import orm_to_json

__author__ = 'admin'


def listing(bag):
    query = g.tran.query(db.DirCoate)
    if bag.get('name'):
        if bag.get('lang') == 'ru':
            query = query.filter(db.DirCoate.name.ilike('%' + bag.get('name') + '%'))
            del bag['name']
        elif bag.get('lang') == 'kg':
            query = query.filter(db.DirCoate.name_kg.ilike('%' + bag.get('name') + '%'))
            del bag['name']
        elif bag.get('lang') == 'en':
            query = query.filter(db.DirCoate.name_en.ilike('%' + bag.get('name') + '%'))
            del bag['name']
    if bag.get('center'):
        query = query.filter(db.DirCoate.center == bag.get('center'))
    if bag.get('code'):
        query = query.filter(db.DirCoate.code == bag.get('code'))
    if bag.get('parent_id'):
        query = query.filter(db.DirCoate.parent_id == bag.get('parent_id'))
    questions = query.all()
    items = []
    for _questions in questions:
        item = orm_to_json(_questions)
        items.append(item)

    return {'docs': items}


def find(bag):
    sql = g.tran.query(db.DirCoate)
    if bag.get('id'):
        sql = sql.filter(db.DirCoate.id == bag['id'])
    elif bag.get('search'):
        search = bag['search'] if bag.get('search') else ''
        sql = sql.filter(or_(func.concat(db.DirCoate.name, ' ', db.DirCoate.name_kg, ' ', db.DirCoate.name_en, ' ')).ilike(u"%{0}%".format(search)))

    return {'docs': sql.limit(str(bag.get('limit', 20))).all()}


def get_by_id(parent_id):
    try:
        parent = g.tran.query(db.DirCoate).filter(db.DirCoate.id == parent_id).first()
        return parent
    except StopIteration:
        return None


def coate(bag):
    query = g.tran.query(db.DirCoate)
    if bag.get('search'):
        search = bag['search'] if bag.get('search') else ''
        query = query.filter(
            or_(func.concat(db.DirCoate.name, '', db.DirCoate.name_kg, '', db.DirCoate.name_en, '')).ilike(
                u"%{0}%".format(search)))
        del bag['search']
    query = query.filter(or_(db.DirCoate.center == None, db.DirCoate.center == ''))\
        .filter(db.DirCoate.parent_id != None)

    if "limit" in bag:
        query = query.limit(bag["limit"])
    else:
        query = query.limit(10)
    if "offset" in bag:
        query = query.offset(bag["offset"])

    query = query.all()
    for item in query:
        item.list_parent = []
        parent_id = item.parent_id
        item.list_parent.append(item.name)
        while parent_id > 1:
            par = get_by_id(parent_id)
            item.list_parent.append(par.name or '')
            parent_id = par.parent_id or 0
    return {'docs': query}


@table_access(name='DirCoate')
def update(bag):
    reg = entity.add({CRUD: db.DirCoate, BOBJECT: bag})
    return {BOBJECT: orm_to_json(reg)}


@table_access(name='DirCoate')
def save(bag):
    reg = entity.add({CRUD: db.DirCoate, BOBJECT: bag})
    return {BOBJECT: orm_to_json(reg)}


@table_access(name='DirCoate')
def remove(bag):
    reg = entity.remove({CRUD: db.DirCoate, ID: bag['id']})
    # return {BOBJECT: orm_to_json(reg)}