# -*- coding: utf-8 -*-

from flask import g
from sqlalchemy import or_, func

from app.model import db

__author__ = 'admin'


def find(bag):
    sql = g.tran.query(db.DirBrand).filter_by(_deleted='infinity')
    if bag.get('id'):
        sql = sql.filter(db.DirBrand._id == bag['id'])
    elif bag.get('ids'):
        sql = sql.filter(db.DirBrand._id.in_(bag['ids']))
        return {'docs': sql.limit(bag.get('limit', 20)).all()}
    elif bag.get('search'):
        search = bag['search'] if bag.get('search') else ''
        sql = sql.filter(or_(func.concat(db.DirBrand.name, ' ', db.DirBrand.name_kg, ' ', db.DirBrand.name_en, ' ')).ilike(u"%{0}%".format(search)))

    return {'docs': sql.limit(str(bag.get('limit', 20))).all()}
