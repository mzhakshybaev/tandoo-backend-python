# coding=utf-8

from app.controller import entity
from app.keys import BOBJECT, CRUD
from app.model import db
from app.service import table_access


@table_access(names=db.Dictionary.__name__)
def save(bag):
    tab_dict = {}
    for dictionary in bag:
        if 'id' in dictionary:
            tab_dict['name'] = dictionary.name
            tab_dict['parent_id'] = dictionary.parent_id
        dict_data = entity.add({CRUD: db.Dictionary, BOBJECT: tab_dict})
        dict_attr_data = {}
        if 'id' in dict_data:
            for dict_attr in dictionary.attr:
                dict_attr_data['dictionary_id'] = dict_data['id']
                dict_attr_data['name'] = dict_attr.name
                dict_attr_data = entity.add({CRUD: db.Dicattribute, BOBJECT: dict_attr_data})
    return
