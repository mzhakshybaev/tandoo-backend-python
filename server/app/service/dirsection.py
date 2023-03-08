# coding=utf-8
from flask import g
from sqlalchemy import func
from sqlalchemy import or_

from app.controller import entity
from app.keys import BOBJECT, CRUD
from app.model import db
from app.utils import orm_to_json


def get(bag):
    label =""
    dirsection = g.tran.query(db.DirSection).filter_by(_deleted='infinity', _id=bag['_id']).first()
    specifications = g.tran.query(db.Specification)\
        .filter(db.Specification.id.in_(dirsection.dircategories_id)).all()
    specifications = orm_to_json(specifications)
    for spec in specifications:
        dircategory = g.tran.query(db.DirCategory).filter_by(id=spec['dircategory_id']).first()
        if g.lang == "ru":
            label = dircategory.name
        elif g.lang == "en":
            label = dircategory.name_en if dircategory.name_en and dircategory.name_en != 'null' else dircategory.name
        elif g.lang == "kg":
            label = dircategory.name_kg if dircategory.name_kg and dircategory.name_kg != 'null' else dircategory.name
        dirc = {
            "code": dircategory.code,
            "data": dircategory.data,
            "id": dircategory.id,
            "name": label,
            "parent_id": dircategory.parent_id
        }
        spec['dircategory'] = dirc
    return {'docs': specifications}