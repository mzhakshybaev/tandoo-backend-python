# -*- coding: utf-8 -*-

from flask import g
from sqlalchemy import or_, func

from app.model import db

__author__ = 'admin'


def find(bag):
    sql = g.tran.query(db.DirCountry).filter_by(_deleted='infinity')
    if bag.get('id'):
        sql = sql.filter(db.DirCountry._id == bag['id'])
    elif bag.get('search'):
        search = bag['search'] if bag.get('search') else ''
        sql = sql.filter(or_(func.concat(db.DirCountry.name, ' ', db.DirCountry.name_kg, ' ', db.DirCountry.name_en, ' ')).ilike(u"%{0}%".format(search)))
    sql = sql.order_by(db.DirCountry.data['index'].asc())
    return {'docs': sql.limit(str(bag.get('limit', 20))).all()}
