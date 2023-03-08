# coding=utf-8
import datetime
from datetime import datetime
from flask import g
from sqlalchemy import or_, func

from app import controller
from app.messages import GENERIC_ERROR
from app.model import db
from app.service import table_access, chain
from app.service.dictionary import tables
from app.utils import CbsException, orm_to_json


@table_access('Company_coate_product')
def save(bag):
    date = datetime.now()
    if not (bag.get('unit_price') and float(bag.get('unit_price')) > 0):
        raise CbsException(GENERIC_ERROR, u'Цена не может быть равной нулю или меньше нуля!')

    if bag.get('date_end') and datetime.strptime(bag['date_end'][:10], '%Y-%m-%d') < date:
        raise CbsException(GENERIC_ERROR, u'Пожалуйста, исправьте срок истечения даты стоимости продукта!')
    bag['unit_price'] = float(bag['unit_price'])
    bag["company_id"] = g.company._id
    if not bag.get('date_end'):
        bag["date_end"] = datetime.now() + datetime.timedelta(days=10)
    if bag.get('_id'):
        cp = g.tran.query(db.Company_coate_product)\
            .filter_by(_deleted='infinity', _id=bag['_id'], company_id=g.company._id).first()
        if cp:
            data = {
                "type": 'Company_coate_product',
                "date_update": datetime.now(),
                "date_add": cp.date_add,
                "unit_price": bag['unit_price'],
                "data": bag['data'] if bag.get('data') else cp.data,
                "product_id": cp.product_id,
                "company_id": cp.company_id,
                "status": 'active',
                "date_end": bag['date_end'],
                "coate": bag['coate'],
                "_id": cp._id,
                "_rev": cp._rev
            }
        else:
            raise CbsException(GENERIC_ERROR, u'Не найден продукт с таким id')
        return controller.call(controller_name='data.put', bag=data)
    else:
        bag["date_add"] = datetime.now()
        bag["date_update"] = datetime.now()
        Company_coate_product = g.tran.query(db.Company_coate_product)\
            .filter_by(_deleted='infinity', product_id=bag['product_id'], company_id=g.company._id).all()
        if Company_coate_product:
            raise CbsException(GENERIC_ERROR, u'У вас уже есть этот продукт в каталоге!')

        return controller.call(controller_name='data.put', bag=bag)


@table_access('Company_coate_product')
@chain(controller_name='data.delete', output=["ok", "id", "rev"])
def delete(bag):
    pass


@table_access('Company_coate_product')
def status(bag):
    date = bag['date']
    date['type'] = bag['type']
    if date['status'] == 'active':
        date['status'] = 'inactive'
        controller.call(controller_name='data.put', bag=date)


def get_by_id(parent_id):
    try:
        parent = g.tran.query(db.DirCoate).filter(db.DirCoate.id == parent_id).first()
        return parent
    except StopIteration:
        return None


def coate(id):
    query = g.tran.query(db.DirCoate).filter(db.DirCoate.id == id)
    query = query.filter(or_(db.DirCoate.center == None, db.DirCoate.center == ''))\
        .filter(db.DirCoate.parent_id != None)

    query = query.all()
    for item in query:
        item.list_parent = []
        parent_id = item.parent_id
        item.list_parent.append(item.name)
        while parent_id > 1:
            par = get_by_id(parent_id)
            item.list_parent.append(par.name or '')
            parent_id = par.parent_id or 0
    return query


@table_access('Company_coate_product')
def listing(bag):
    Company_coate_products = g.tran.query(db.Company_coate_product).filter_by(_deleted='infinity', company_id=g.company._id)
    if bag.get('unit_price'):
        Company_coate_products = Company_coate_products.filter(db.Company_coate_product.unit_price == bag['unit_price'])
    if bag.get('coate'):
        Company_coate_products = Company_coate_products.filter(db.Company_coate_product.coate == bag['coate'])
    if bag.get('date_end'):
        Company_coate_products = Company_coate_products.filter(db.Company_coate_product.date_end >= bag['date_end'].strftime('%Y-%m-%d'))
    if bag.get('date_add'):
        Company_coate_products = Company_coate_products.filter(db.Company_coate_product.date_add >= bag['date_add'].strftime('%Y-%m-%d'))
    if bag.get('date_update'):
        Company_coate_products = Company_coate_products.filter(db.Company_coate_product.date_update >= bag['date_update'].strftime('%Y-%m-%d'))
    count = Company_coate_products.count()
    if "limit" in bag:
        Company_coate_products = Company_coate_products.limit(bag["limit"])
    if "offset" in bag:
        Company_coate_products = Company_coate_products.offset(bag["offset"])
    Company_coate_products = Company_coate_products.all()
    data_products = []
    for prod in Company_coate_products:
        product = g.tran.query(db.Product).filter_by(_deleted='infinity').filter(
            db.Product._id == prod.product_id)

        if bag.get('barcode'):
            product = product.filter(db.Product.barcode == bag["barcode"])
            del bag["barcode"]

        product = product.first()
        dircategory = g.tran.query(db.DirCategory).filter_by(id=product.dircategory_id).first()
        if g.lang == "ru":
            dircategorylabel = dircategory.name
        elif g.lang == "en":
            dircategorylabel = dircategory.name_en if dircategory.name_en and dircategory.name_en !='null' else dircategory.name
        elif g.lang == "kg":
            dircategorylabel = dircategory.name_kg if dircategory.name_kg and dircategory.name_kg !='null' else dircategory.name
        else:
            dircategorylabel = dircategory.name

        coate_result = coate(prod.coate)

        data = {
            "unit_price": prod.unit_price,
            "date_add": prod.date_add,
            "date_update": prod.date_update,
            "status": prod.status,
            "date_end": prod.date_end,
            "barcode": product.barcode or "",
            "dircategory": dircategorylabel,
            "image": product.image,
            "dircoate": coate_result,
            "coate": prod.coate,
            "code": product.code,
            "_id": prod._id,
            "product_id": prod.product_id
        }
        product.specifications = []
        product.dictionaries = []

        productspec = g.tran.query(db.ProductSpec).filter_by(_deleted='infinity', product_id=product._id).all()
        productdict = g.tran.query(db.ProductDict).filter_by(_deleted='infinity', product_id=product._id).all()
        for prodspec in productspec:
            property = g.tran.query(db.SpecificationProperty) \
                .filter_by(id=prodspec.specification_property_id).first()
            value = g.tran.query(db.SpecificationPropertyValue) \
                .filter_by(id=prodspec.specification_property_value_id).first()
            if property and value:
                if g.lang == "ru":
                    data.update({property.name: value.name})
                elif g.lang == "en":
                    data.update(
                        {property.name_en: value.name_en if value.name_en and value.name_en != 'null' else value.name})
                elif g.lang == "kg":
                    data.update(
                        {property.name_kg: value.name_kg if value.name_kg and value.name_kg != 'null' else value.name})
        for proddict in productdict:
            table = getattr(db, proddict.dirname) if hasattr(db, proddict.dirname) else None
            dirvalue = g.tran.query(table).filter_by(_deleted='infinity').filter(
                table._id == proddict.dictionary_id).first()
            dir = next(d for d in tables if d['table'] == proddict.dirname)
            displayName = dir['name'] if dir else ''
            if dirvalue:
                if g.lang == "ru":
                    data.update({displayName: dirvalue.name})
                elif g.lang == "en":
                    data.update(
                        {displayName: dirvalue.name_en if dirvalue.name_en and dirvalue.name_en != 'null' else dirvalue.name})
                elif g.lang == "kg":
                    data.update(
                        {displayName: dirvalue.name_kg if dirvalue.name_kg and dirvalue.name_kg != 'null' else dirvalue.name})
        data_products.append(data)
    return {'docs': data_products, 'count':count}


@table_access('Company_coate_product')
def get(bag):
    Company_coate_products = g.tran.query(db.Company_coate_product)\
        .filter_by(_deleted='infinity', company_id=g.company._id, _id=bag['_id'])
    if bag.get('unit_price'):
        Company_coate_products = Company_coate_products.filter(db.Company_coate_product.unit_price == bag['unit_price'])
    if bag.get('date_end'):
        Company_coate_products = Company_coate_products.filter(db.Company_coate_product.date_end >= bag['date_end'].strftime('%Y-%m-%d'))
    if bag.get('date_add'):
        Company_coate_products = Company_coate_products.filter(db.Company_coate_product.date_add >= bag['date_add'].strftime('%Y-%m-%d'))
    if bag.get('date_update'):
        Company_coate_products = Company_coate_products.filter(db.Company_coate_product.date_update >= bag['date_update'].strftime('%Y-%m-%d'))
    Company_coate_product = Company_coate_products.first()
    data_products = []
    product = g.tran.query(db.Product).filter_by(_deleted='infinity').filter(
        db.Product._id == Company_coate_product.product_id)

    if bag.get('barcode'):
        product = product.filter(db.Product.barcode == bag["barcode"])
        del bag["barcode"]

    product = product.first()
    dircategory = g.tran.query(db.DirCategory).filter_by(id=product.dircategory_id).first()
    coate_result = coate(Company_coate_product.coate)
    data = {
        "unit_price": Company_coate_product.unit_price,
        "date_add": Company_coate_product.date_add,
        "date_update": Company_coate_product.date_update,
        "status": Company_coate_product.status,
        "dircoate": coate_result,
        "coate": Company_coate_product.coate,
        "date_end": Company_coate_product.date_end,
        "barcode": product.barcode or "",
        "dircategory": dircategory.name or "",
        "image": product.image,
        "code": product.code,
        "_id": Company_coate_product._id,
        "product_id": Company_coate_product.product_id
    }
    product.specifications = []
    product.dictionaries = []

    productspec = g.tran.query(db.ProductSpec).filter_by(_deleted='infinity', product_id=product._id).all()
    productdict = g.tran.query(db.ProductDict).filter_by(_deleted='infinity', product_id=product._id).all()
    for prodspec in productspec:
        property = g.tran.query(db.SpecificationProperty) \
            .filter_by(id=prodspec.specification_property_id).first()
        value = g.tran.query(db.SpecificationPropertyValue) \
            .filter_by(id=prodspec.specification_property_value_id).first()
        if property and value:
            data.update({property.name: value.name})
    for proddict in productdict:
        table = getattr(db, proddict.dirname) if hasattr(db, proddict.dirname) else None
        dirvalue = g.tran.query(table).filter_by(_deleted='infinity').filter(
            table._id == proddict.dictionary_id).first()
        dir = next(d for d in tables if d['table'] == proddict.dirname)
        displayName = dir['name'] if dir else ''
        if dirvalue:
            data.update({displayName: dirvalue.name})
    data_products.append(data)
    return {'doc': data_products}