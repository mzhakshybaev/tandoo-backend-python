# coding=utf-8
from sets import Set

from flask import g

from app import controller
from app.controller import entity
from app.keys import BOBJECT, CRUD, ID
from app.messages import GENERIC_ERROR
from app.model import db
from app.utils import CbsException
from apputils import orm_to_json


def save(bag):
    for specifations in bag:
        tab_spec = {}
        ds = {}
        if 'id' not in specifations:
            tab_spec['dircategory_id'] = specifations['dircategory_id']
            spec_data = entity.add({CRUD: db.Specification, BOBJECT: tab_spec})
            dirsection = g.tran.query(db.DirSection).filter_by(_deleted='infinity', _id=specifations['section']).first()
            dirsection = orm_to_json(dirsection)
            if spec_data.id not in dirsection['dircategories_id']:
                dirsection['type'] = "DirSection"
                dirsection['dircategories_id'].append(spec_data.id)
                dirsec_save = controller.call(controller_name='data.put', bag=dirsection)
            if 'dictionaries' in specifations:
                for dictionary in specifations['dictionaries']:
                    dict = {}
                    dict['specification_id'] = spec_data.id
                    dict['dirname'] = dictionary['table']
                    dict['name'] = dictionary['name']
                    dict['role_id'] = dictionary['roles_id']
                    if 'id' in dictionary:
                        dict['id'] = dictionary['id']
                    entity.add({CRUD: db.SpecificationDictionary, BOBJECT: dict})
            if 'attr' in specifations:
                for spec_attr in specifations['attr']:
                    spec_attr_data = {}
                    if 'id' in spec_attr:
                        spec_attr_data['id'] = spec_attr['id']
                    spec_attr_data['specification_id'] = spec_data.id
                    spec_attr_data['order'] = int(spec_attr['order'])
                    spec_attr_data['name'] = spec_attr['name']
                    spec_attr_data['name_kg'] = spec_attr['name_kg'] or None
                    spec_attr_data['name_en'] = spec_attr['name_en'] or None
                    spec_attr_data['roles_id'] = spec_attr['roles_id']
                    res_spec_attr_data = entity.add({CRUD: db.SpecificationProperty, BOBJECT: spec_attr_data})
                    if 'values' in spec_attr:
                        for spec_attr_val in spec_attr['values']:
                            spec_attr_val_data = {}
                            if 'id' in spec_attr:
                                spec_attr_val_data['id'] = spec_attr_val['id']
                            spec_attr_val_data['specificationproperty_id'] = res_spec_attr_data.id
                            spec_attr_val_data['name'] = spec_attr_val['name']
                            spec_attr_val_data['name_kg'] = spec_attr_val['name_kg'] or None
                            spec_attr_val_data['name_en'] = spec_attr_val['name_en'] or None
                            entity.add({CRUD: db.SpecificationPropertyValue, BOBJECT: spec_attr_val_data})
        else:
            tab_spec['id'] = specifations['id']
            tab_spec['dircategory_id'] = specifations['dircategory_id']
            spec_data = entity.add({CRUD: db.Specification, BOBJECT: tab_spec})
            dirsection = g.tran.query(db.DirSection).filter_by(_deleted='infinity', _id=specifations['section']).first()
            dirsection = orm_to_json(dirsection)
            if spec_data.id not in dirsection['dircategories_id']:
                dirsection['type'] = "DirSection"
                dirsection['dircategories_id'].append(spec_data.id)
                dirsec_save = controller.call(controller_name='data.put', bag=dirsection)
            if 'dictionaries' in specifations:
                spec_disc_ts_id = []
                dict_Spec_id = []
                spec_dict_lists = g.tran.query(db.SpecificationDictionary)\
                    .filter(db.SpecificationDictionary.specification_id == spec_data.id).all()
                for dict_Spec in spec_dict_lists:
                    dict_Spec_id.append(dict_Spec.id)
                for dict_s in specifations['dictionaries']:
                    if 'id' in dict_s:
                        spec_disc_ts_id.append(dict_s['id'])
                sd = Set(dict_Spec_id)
                td = Set(spec_disc_ts_id)
                dfd = sd.symmetric_difference(td)
                if len(dfd) > 0:
                    for d_id in dfd:
                        entity.remove({CRUD: db.SpecificationDictionary, ID: d_id})
                for dictionary in specifations['dictionaries']:
                    dict = {}
                    dict['specification_id'] = spec_data.id
                    dict['dirname'] = dictionary['table']
                    dict['name'] = dictionary['name']
                    dict['roles_id'] = dictionary['roles_id']
                    if 'id' in dictionary:
                        dict['id'] = dictionary['id']
                    entity.add({CRUD: db.SpecificationDictionary, BOBJECT: dict})
            if 'attr' in specifations:
                for attr_s in specifations['attr']:
                    if 'id' in attr_s:
                        spec_list_values_ids = []
                        spec_values_ids = []
                        spec_attr_val_lists = g.tran.query(db.SpecificationPropertyValue)\
                            .filter(db.SpecificationPropertyValue.specificationproperty_id == attr_s['id']).all()
                        if spec_attr_val_lists:
                            for spec_prop_value in spec_attr_val_lists:
                                spec_list_values_ids.append(spec_prop_value.id)
                        for value in attr_s['values']:
                            if 'id' in value:
                                spec_values_ids.append(value['id'])
                        sd = Set(spec_list_values_ids)
                        td = Set(spec_values_ids)
                        dfd = sd.symmetric_difference(td)
                        if len(dfd) > 0:
                            for d_id in dfd:
                                entity.remove({CRUD: db.SpecificationPropertyValue, ID: d_id})
                        spec_list_ids = []
                        spec_attr_ids = []
                        spec_attr_lists = g.tran.query(db.SpecificationProperty) \
                            .filter(db.SpecificationProperty.specification_id == spec_data.id).all()
                        if spec_attr_lists:
                            for property_Spec in spec_attr_lists:
                                spec_list_ids.append(property_Spec.id)
                        for attr in specifations['attr']:
                            if 'id' in attr:
                                spec_attr_ids.append(attr['id'])
                        sd = Set(spec_list_ids)
                        td = Set(spec_attr_ids)
                        dfd = sd.symmetric_difference(td)
                        if len(dfd) > 0:
                            for d_id in dfd:
                                spec_attr_val_list = g.tran.query(db.SpecificationPropertyValue)\
                                    .filter(db.SpecificationPropertyValue.specificationproperty_id == d_id).all()
                                if spec_attr_val_list:
                                    for val in spec_attr_val_list:
                                        entity.remove({CRUD: db.SpecificationPropertyValue, ID: val.id})
                                entity.remove({CRUD: db.SpecificationProperty, ID: d_id})
                for spec_attr in specifations['attr']:
                    spec_attr_data = {}
                    if 'id' in spec_attr:
                        spec_attr_data['id'] = spec_attr['id']
                    spec_attr_data['specification_id'] = spec_data.id
                    spec_attr_data['order'] = int(spec_attr['order'])
                    spec_attr_data['name'] = spec_attr['name']
                    spec_attr_data['name_kg'] = spec_attr['name_kg'] or None
                    spec_attr_data['name_en'] = spec_attr['name_en'] or None
                    spec_attr_data['roles_id'] = spec_attr['roles_id']
                    res_spec_attr_data = entity.add({CRUD: db.SpecificationProperty, BOBJECT: spec_attr_data})
                    if 'values' in spec_attr:
                        for spec_attr_val in spec_attr['values']:
                            spec_attr_val_data = {}
                            if 'id' in spec_attr_val:
                                spec_attr_val_data['id'] = spec_attr_val['id']
                            spec_attr_val_data['specificationproperty_id'] = res_spec_attr_data.id
                            spec_attr_val_data['name'] = spec_attr_val['name']
                            spec_attr_val_data['name_kg'] = spec_attr_val['name_kg'] or None
                            spec_attr_val_data['name_en'] = spec_attr_val['name_en'] or None
                            entity.add({CRUD: db.SpecificationPropertyValue, BOBJECT: spec_attr_val_data})
    return {'message': u'Успешно сохранили'}


def listing(bag):
    if 'dircategory_id' in bag:
        specifications = g.tran.query(db.Specification).filter_by(dircategory_id=bag['dircategory_id'])\
            .order_by(db.Specification.id.asc()).all()
        specifications = orm_to_json(specifications)
        for spec in specifications:
            spec['property'] = []
            spec['dictionaries'] = []
            dictionaries = g.tran.query(db.SpecificationDictionary).filter_by(specification_id=spec['id']).all()
            property = g.tran.query(db.SpecificationProperty).filter_by(specification_id=spec['id'])\
                .order_by(db.SpecificationProperty.id.asc()).all()
            property = orm_to_json(property)
            dictionaries = orm_to_json(dictionaries)
            spec['dictionaries'] = dictionaries
            for prop in property:
                values = g.tran.query(db.SpecificationPropertyValue).filter_by(specificationproperty_id=prop['id'])\
                    .order_by(db.SpecificationPropertyValue.id.asc()).all()
                values = orm_to_json(values)
                prop['values'] = values or []
                spec['property'].append(prop)
        return {'docs': specifications}
    else:
        raise CbsException(GENERIC_ERROR, u'Выберите категорию')


def speclist(bag):
    if "local" in bag and bag["local"] is True:
        products = g.tran.query(db.Product).filter_by(_deleted='infinity') \
            .filter(db.Product.local == bag["local"]).all()
        specification_ids = []
        for product in products:
            prodspecs = g.tran.query(db.ProductSpec).filter_by(_deleted='infinity', product_id=product._id).all()
            for prodspec in prodspecs:
                if prodspec.specification_id not in specification_ids:
                    specification_ids.append(prodspec.specification_id)
        specifications = g.tran.query(db.Specification).filter(db.Specification.id.in_(specification_ids)).all()
        specifications = orm_to_json(specifications)
        for spec in specifications:
            dircategory = g.tran.query(db.DirCategory).filter(db.DirCategory.id == spec['dircategory_id']).first()
            spec['dircategory'] = orm_to_json(dircategory)
        return {'docs': specifications}
    elif "local" in bag and bag["local"] is False:
        company_products = g.tran.query(db.Company_product).filter_by(_deleted='infinity', status='active').all()
        dircategories_ids = []
        for product in company_products:
            prods = g.tran.query(db.Product) \
                .filter_by(_deleted='infinity', _id=product.product_id).all()
            if prods:
                for pr in prods:
                    if pr.dircategory_id not in dircategories_ids:
                        dircategories_ids.append(pr.dircategory_id)
        specifications = g.tran.query(db.Specification)\
            .filter(db.Specification.dircategory_id.in_(dircategories_ids)).all()
        specifications = orm_to_json(specifications)
        for spec in specifications:
            dircategory = g.tran.query(db.DirCategory).filter(db.DirCategory.id == spec['dircategory_id']).first()
            spec['dircategory'] = orm_to_json(dircategory)
        return {'docs': specifications}
    else:
        specifications = g.tran.query(db.Specification).all()
        specifications = orm_to_json(specifications)
        for spec in specifications:
            dircategory = g.tran.query(db.DirCategory).filter(db.DirCategory.id == spec['dircategory_id']).first()
            spec['dircategory'] = orm_to_json(dircategory)
        return {'docs': specifications}


def get_by_ids(bag):
    sql = g.tran.query(db.Specification)
    if bag.get('ids'):
        sql = sql.filter(db.Specification.id.in_(bag['ids']))
        sql = sql.order_by(db.Specification.id.asc())
        specifications = orm_to_json(sql.all())
        for spec in specifications:
            c = g.tran.query(db.DirCategory).filter(db.DirCategory.id == spec['dircategory_id']).first()
            spec['dircategory'] = orm_to_json(c)
        return {'docs': specifications}
    else:
        raise CbsException(GENERIC_ERROR, 'no ids provided')
