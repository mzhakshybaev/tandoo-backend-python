# coding=utf-8
from flask import g
from sqlalchemy import func
from sqlalchemy import or_

from app.controller import entity
from app.keys import BOBJECT, CRUD
from app.model import db
from app.utils import orm_to_json


def save(bag):
    bag['parent_id'] = str(bag['parent_id'])
    result = entity.add({CRUD: db.DirCategory, BOBJECT: bag})
    return {'doc': result}


def listing(bag):
    dircats = g.tran.query(db.DirCategory).filter_by(parent_id="0").order_by(db.DirCategory.id.asc()).all()
    dircats = orm_to_json(dircats)
    return {'docs': dircats, "count": len(dircats)}


def childlist(bag):
    dircats = g.tran.query(db.DirCategory).filter_by(parent_id=str(bag['id'])).all()
    cats = []
    for dircat in dircats:
        childs = g.tran.query(db.DirCategory).filter_by(parent_id=str(dircat.id)).first()
        cat = orm_to_json(dircat)
        cat['has_child'] = childs is not None
        cats.append(cat)
    return {'docs': cats, "count": len(dircats)}


def search(bag):
    sql = g.tran.query(db.DirCategory)
    if bag.get('id'):
        sql = sql.filter(db.DirCategory.id == bag['id'])
    elif bag.get('ids'):
        sql = sql.filter(db.DirCategory.id.in_(bag['ids']))
    elif bag.get('search'):
        search = bag['search'] if bag.get('search') else ''
        sql = sql.filter(
            or_(func.concat(db.DirCategory.name, ' ', db.DirCategory.code, ' ')).ilike(u"%{0}%".format(search)))
    sql = sql.order_by(db.DirCategory.id.asc())
    return {'docs': sql.limit(str(bag.get('limit', 10))).all()}
