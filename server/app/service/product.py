# coding=utf-8
from flask import g

from app import controller
from app.messages import GENERIC_ERROR
from app.model import db
from app.service import table_access
from app.service.dictionary import tables
from app.utils import CbsException


@table_access('Product')
def listing(bag):
    if "dircategory_id" in bag:
        data_products = []
        products = g.tran.query(db.Product).filter_by(_deleted='infinity').filter(
            db.Product.dircategory_id == bag["dircategory_id"]).all()
        for product in products:
            data = {
                "barcode": product.barcode,
                "image": product.image,
                "images": product.images,
                "code": product.code,
                "local": product.local,
                "_id": product._id
            }
            product.specifications = []
            product.dictionaries = []
            dircategory = g.tran.query(db.DirCategory).filter_by(id=product.dircategory_id).all()
            productspec = g.tran.query(db.ProductSpec).filter_by(_deleted='infinity', product_id=product._id).all()
            productdict = g.tran.query(db.ProductDict).filter_by(_deleted='infinity', product_id=product._id).all()
            product.dircategory = dircategory
            for prodspec in productspec:
                property = g.tran.query(db.SpecificationProperty) \
                    .filter_by(id=prodspec.specification_property_id).first()
                value = g.tran.query(db.SpecificationPropertyValue) \
                    .filter_by(id=prodspec.specification_property_value_id).first()
                if not value:
                    continue
                if g.lang == "ru":
                    prop_label = property.name.replace('.)', ')')
                    data.update({prop_label: value.name})
                elif g.lang == "en":
                    prop_label = property.name_en if property.name_en and property.name_en != 'null' else property.name
                    data.update(
                        {prop_label: value.name_en if value.name_en and value.name_en != 'null' else value.name})
                elif g.lang == "kg":
                    prop_label = property.name_kg if property.name_kg and property.name_kg != 'null' else property.name
                    data.update(
                        {prop_label: value.name_kg if value.name_kg and value.name_kg != 'null' else value.name})
            for proddict in productdict:
                table = getattr(db, proddict.dirname) if hasattr(db, proddict.dirname) else None
                dirvalue = g.tran.query(table).filter_by(_deleted='infinity').filter(
                    table._id == proddict.dictionary_id).first()
                dir = next(d for d in tables if d['table'] == proddict.dirname)
                displayName = dir['name'] if dir else ''
                if g.lang == "ru":
                    data.update({displayName: dirvalue.name})
                elif g.lang == "en":
                    data.update(
                        {displayName: dirvalue.name_en if dirvalue.name_en and dirvalue.name_en != 'null' else dirvalue.name})
                elif g.lang == "kg":
                    data.update(
                        {displayName: dirvalue.name_kg if dirvalue.name_kg and dirvalue.name_kg != 'null' else dirvalue.name})
            data_products.append(data)
        return {'docs': data_products}
    else:
        raise CbsException(GENERIC_ERROR, u'Выберите категорию')
        return


@table_access('Product')
def save(bag):
    dircategory = g.tran.query(db.DirCategory).filter_by(id=bag['product']['dircategory_id']).first()
    bag['product']['status'] = 0
    bag['product']['type'] = 'Product'

    if '_id' in bag['product']:
        bag['product']['_id'] = bag['product']['_id']
        bag['product']['code'] = bag['product']['code']
    else:
        stt = g.redis.incr(dircategory.code)
        bag['product']['code'] = dircategory.code + '-' + str(stt).zfill(3)

    bag['product']['barcode'] = bag['product']['barcode']
    bag['product']['local'] = bag['product']['local']
    bag['product']['image'] = bag['product']['image']
    bag['product']['images'] = bag['product']['images']

    product = controller.call(controller_name='data.put', bag=bag['product'])
    for prop in bag['props']:
        spec_item = {
            'type': 'ProductSpec',
            'product_id': product['id'],
            'specification_id': prop['specification_id'],
            'specification_property_id': prop['id'],
            'specification_property_value_id': prop['value'],
        }

        if 'prodspec_id' in prop:
            spec_item['_id'] = prop['prodspec_id']
            spec_item['_rev'] = prop['prodspec_rev']

        spec_p = controller.call(controller_name='data.put', bag=spec_item)

    for dict in bag['dictionaries']:
        dict_item = {
            'type': 'ProductDict',
            'product_id': product['id'],
            'dirname': dict['dirname'],
            'dictionary_id': dict['dictionary_id'],
        }

        if 'proddict_id' in dict:
            dict_item['_id'] = dict['proddict_id']
            dict_item['_rev'] = dict['proddict_rev']

        dict_p = controller.call(controller_name='data.put', bag=dict_item)

    return {'resultList': u'Данные успешно сохранены'}


def get(bag):
    if "id" in bag:
        product = g.tran.query(db.Product).filter_by(_deleted='infinity').filter(db.Product._id == bag["id"]).first()
        product.specifications = []
        product.dictionaries = []
        dircategory = g.tran.query(db.DirCategory).filter_by(id=product.dircategory_id).all()
        productspec = g.tran.query(db.ProductSpec).filter_by(_deleted='infinity', product_id=product._id).all()
        productdict = g.tran.query(db.ProductDict).filter_by(_deleted='infinity', product_id=product._id).all()
        product.dircategory = dircategory
        for prodspec in productspec:
            specs = {}
            property = g.tran.query(db.SpecificationProperty) \
                .filter_by(id=prodspec.specification_property_id).first()
            value = g.tran.query(db.SpecificationPropertyValue) \
                .filter_by(id=prodspec.specification_property_value_id).first()
            specs['property'] = property
            specs['value'] = value
            specs['prodspec_id'] = prodspec._id
            specs['prodspec_rev'] = prodspec._rev
            product.specifications.append(specs)
        for proddict in productdict:
            dicts = {}
            table = getattr(db, proddict.dirname) if hasattr(db, proddict.dirname) else None
            dirvalue = g.tran.query(table).filter_by(_deleted='infinity').filter(
                table._id == proddict.dictionary_id).first()
            spec_dict = g.tran.query(db.SpecificationDictionary).filter_by(dirname=proddict.dirname).first()
            dicts['dirname'] = proddict.dirname
            dicts['dir_title'] = spec_dict.name if spec_dict else ''
            dicts['value'] = dirvalue
            dicts['proddict_id'] = proddict._id
            dicts['proddict_rev'] = proddict._rev
            product.dictionaries.append(dicts)
        return {'doc': product}
    else:
        raise CbsException(GENERIC_ERROR, u'Выберите продукт')


def get_local(bag):
    data_products = []
    products = g.tran.query(db.Product).filter_by(_deleted='infinity').filter(db.Product.local == True) \
        .order_by(db.Product._created.desc()).all()
    for product in products:
        data = {
            "barcode": product.barcode,
            "image": product.image,
            "images": product.images,
            "code": product.code,
            "local": product.local,
            "_id": product._id
        }
        product.dictionaries = []
        productdict = g.tran.query(db.ProductDict).filter_by(_deleted='infinity', product_id=product._id).all()
        for proddict in productdict:
            table = getattr(db, proddict.dirname) if hasattr(db, proddict.dirname) else None
            dirvalue = g.tran.query(table).filter_by(_deleted='infinity').filter(
                table._id == proddict.dictionary_id).first()
            dir = next(d for d in tables if d['table'] == proddict.dirname)
            displayName = dir['name'] if dir else ''
            if g.lang == "ru":
                data.update({displayName: dirvalue.name})
            elif g.lang == "en":
                data.update(
                    {
                        displayName: dirvalue.name_en if dirvalue.name_en and dirvalue.name_en != 'null' else dirvalue.name})
            elif g.lang == "kg":
                data.update(
                    {
                        displayName: dirvalue.name_kg if dirvalue.name_kg and dirvalue.name_kg != 'null' else dirvalue.name})
        data_products.append(data)
    return {'docs': data_products}
