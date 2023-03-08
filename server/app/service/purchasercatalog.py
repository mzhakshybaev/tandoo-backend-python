# coding=utf-8
from copy import deepcopy
from sets import Set

from flask import g, json
from sqlalchemy import func, case
from sqlalchemy import or_
from sqlalchemy.sql import label
from sqlalchemy.sql.elements import and_

from app.helper import sql_utils
from app.messages import GENERIC_ERROR
from app.model import db
from app.service.dictionary import tables
from app.utils import CbsException
from apputils import orm_to_json


def get_filters(bag):
    filters = {}
    products = g.tran.query(db.Product).filter_by(_deleted='infinity').filter(db.Product._id.in_(bag["products_id"])).all()
    specification = g.tran.query(db.Specification).filter(db.Specification.dircategory_id == bag["dircategory_id"]).first()
    public_role = g.tran.query(db.Roles._id).filter_by(_deleted='infinity', code='public').first()
    pub_r = Set(public_role)
    filters['specifications'] = []
    filters['dictionaries'] = []

    specdictdicts = g.tran.query(db.SpecificationDictionary).filter_by(specification_id=specification.id).all()
    for prod_dict in specdictdicts:
        cr = Set(g.company.roles_id) if hasattr(g, 'company') else Set([])
        pr = Set(prod_dict.roles_id)
        if len(cr) > 0:
            us = cr.intersection(pr)
            if len(us) > 0:
                dicts = {}
                dicts['dirname'] = prod_dict.dirname
                dir = next(d for d in tables if d['table'] == prod_dict.dirname)
                dicts['displayName'] = dir['name'] if dir else ''
                dicts['values'] = []
                filters['dictionaries'].append(dicts)
        else:
            us = pub_r.intersection(pr)
            if len(us) > 0:
                dicts = {}
                dicts['dirname'] = prod_dict.dirname
                dir = next(d for d in tables if d['table'] == prod_dict.dirname)
                dicts['displayName'] = dir['name'] if dir else ''
                dicts['values'] = []
                filters['dictionaries'].append(dicts)

    specproplist = g.tran.query(db.SpecificationProperty).filter_by(specification_id=specification.id)\
        .order_by(db.SpecificationProperty.order.asc()).all()
    for prop in specproplist:
        cr = Set(g.company.roles_id) if hasattr(g, 'company') else Set([])
        pr = Set(prop.roles_id)
        if len(cr) > 0:
            us = cr.intersection(pr)
            if len(us) > 0:
                dicts = {}
                if g.lang == "ru":
                    dicts['property'] = prop.name
                elif g.lang == "en":
                    dicts['property'] = prop.name_en if prop.name_en and prop.name_en !='null' else prop.name
                elif g.lang == "kg":
                    dicts['property'] = prop.name_kg if prop.name_kg and prop.name_kg !='null' else prop.name
                dicts['id'] = prop.id
                dicts['values'] = []
                filters['specifications'].append(dicts)
        else:
            us = pub_r.intersection(pr)
            if len(us) > 0:
                dicts = {}
                if g.lang == "ru":
                    dicts['property'] = prop.name
                elif g.lang == "en":
                    dicts['property'] = prop.name_en if prop.name_en and prop.name_en !='null' else prop.name
                elif g.lang == "kg":
                    dicts['property'] = prop.name_kg if prop.name_kg and prop.name_kg !='null' else prop.name
                
                dicts['id'] = prop.id
                dicts['values'] = []
                filters['specifications'].append(dicts)

    for prod in products:
        productdicts = g.tran.query(db.ProductDict).filter_by(_deleted='infinity').filter_by(product_id=prod._id).all()
        for prod_dict in productdicts:
            for dict_dirname in filters['dictionaries']:
                if dict_dirname['dirname'] == prod_dict.dirname:
                    dict = {}
                    table = getattr(db, dict_dirname['dirname']) if hasattr(db, dict_dirname['dirname']) else None
                    dirvalue = g.tran.query(table).filter_by(_deleted='infinity').filter(
                        table._id == prod_dict.dictionary_id).first()
                    if g.lang == "ru":
                        dict['name'] = dirvalue.name
                    elif g.lang == "en":
                        dict['name'] = dirvalue.name_en if dirvalue.name_en and dirvalue.name_en !='null' else dirvalue.name
                    elif g.lang == "kg":
                        dict['name'] = dirvalue.name_kg if dirvalue.name_kg and dirvalue.name_kg !='null' else dirvalue.name
                    dict['_id'] = dirvalue._id
                    if dict not in dict_dirname['values']:
                        dict_dirname['values'].append(dict)

        productcpecs = g.tran.query(db.ProductSpec).filter_by(_deleted='infinity').filter_by(product_id=prod._id).all()
        for prod_spec in productcpecs:
            for spec_filter in filters['specifications']:
                if spec_filter['id'] == prod_spec.specification_property_id:
                    val = {}
                    value = g.tran.query(db.SpecificationPropertyValue) \
                        .filter_by(id=prod_spec.specification_property_value_id).first()
                    if g.lang == "ru":
                        val['name'] = value.name
                    elif g.lang == "en":
                        val['name'] = value.name_en if value.name_en and value.name_en !='null' else value.name
                    elif g.lang == "kg":
                        val['name'] = value.name_kg if value.name_kg and value.name_kg !='null' else value.name
                    val['id'] = value.id
                    if val not in spec_filter['values']:
                        spec_filter['values'].append(val)
    return filters


def listing(bag):
    if "dircategory_id" in bag:
        items = []
        filters = []
        prodcs = []
        prodds = []
        sp = ""
        dp = ""
        pds = ""
        if len(bag['specifications']) > 0:
            for s in bag['specifications']:
                sp1 = 'specification_property_id = ' + u'{}'.format(s['property'])
                sp2 =' and ' + 'specification_property_value_id = ' + u'{}'.format(s['value'])
                items.append(str('(' + sp1) + str(sp2 + ')'))
                if len(bag['specifications']) > 1:
                    pss = " or ".join(items)
                    sp = 'and (' + u'{}'.format(str(pss)) + ')'
                elif len(bag['specifications']) == 1:
                    sp = "and " + sp1 + sp2
            count_ps = len(bag['specifications'])
            ps_sql = """
                with specs as (
                    SELECT count(product_id), product_id
                    FROM productspec
                    WHERE _deleted = 'infinity'
                      """ + sp + """
                    group by product_id
                )

                select *
                from specs s, product p
                where p._deleted='infinity' and p._id = s.product_id"""
            if count_ps > 1:
                count = ' and s.count = ' + u'{}'.format(count_ps)
                ps_sql += ''.join(count)

            if bag["dircategory_id"]:
                dircat = ' and p.dircategory_id = ' + u'{}'.format(bag["dircategory_id"])
                ps_sql += ''.join(dircat)

            rows_spec = g.tran.execute(ps_sql)
            list_of_dicts = [{key: value for (key, value) in row.items()} for row in rows_spec]
            for ps in list_of_dicts:
                prod_id = ps["_id"]
                prodcs.append(prod_id)
        else:
            ps_sql = "select * from  product p where p._deleted='infinity' and p.dircategory_id = " +u'{0}'.format(bag["dircategory_id"])

            rows_spec = g.tran.execute(ps_sql)
            list_of_dicts = [{key: value for (key, value) in row.items()} for row in rows_spec]
            for ps in list_of_dicts:
                prod_id = ps["_id"]
                prodcs.append(prod_id)

        dict_items = []
        if len(bag['dictionaries']) > 0:
            for d in bag['dictionaries']:
                dp1 = " dirname = " + "'" + d['dirname'] + "'"
                dp2 = " and dictionary_id = " + "'" + d['dictionary_id'] + "'"
                dict_items.append(str('(' + dp1) + str(dp2 + ')'))
                if len(bag['dictionaries']) > 1:
                    pds = " or ".join(dict_items)
                    dp = 'and (' + u'{}'.format(str(pds)) + ')'
                elif len(bag['dictionaries']) == 1:
                    dp = "and " + dp1 + dp2
            count_pd = len(bag['dictionaries'])
            pd_sql = """
                with dicts as (
                    SELECT count(product_id), product_id
                    FROM productdict
                    WHERE _deleted = 'infinity'
                      """ + dp + """
                    group by product_id
                )

                select *
                from dicts d, product p
                where p._deleted='infinity' and p._id = d.product_id"""
            if count_pd > 1:
                count = ' and d.count = ' + u'{}'.format(count_pd)
                pd_sql += ''.join(count)
            if bag["dircategory_id"]:
                dircat = ' and p.dircategory_id = ' + u'{}'.format(bag["dircategory_id"])
                pd_sql += ''.join(dircat)

            rows_dicts = g.tran.execute(pd_sql)
            list_of_dicts = [{key: value for (key, value) in row.items()} for row in rows_dicts]
            for pd in list_of_dicts:
                prod_id = pd["_id"]
                prodds.append(prod_id)

        else:
            pd_sql = "select * from  product p where p._deleted='infinity' and p.dircategory_id = " + u'{0}'.format(
                bag["dircategory_id"])

            rows_dicts = g.tran.execute(pd_sql)
            list_of_dicts = [{key: value for (key, value) in row.items()} for row in rows_dicts]
            for pd in list_of_dicts:
                prod_id = pd["_id"]
                prodds.append(prod_id)

        ps = Set(prodcs)
        pd = Set(prodds)
        set_products = list(ps.intersection(pd))
        data_products = []
        if len(set_products) > 0:
            filter_data = {
                "products_id": [],
                "dircategory_id": bag["dircategory_id"],
                "lang": g.lang
            }
            if "local" in bag and bag["local"] is True:
                products = g.tran.query(db.Product) \
                    .filter_by(_deleted='infinity', local=bag["local"]) \
                    .filter(db.Product._id.in_(set_products)).all()
            else:
                products = g.tran.query(db.Product) \
                    .filter_by(_deleted='infinity') \
                    .filter(db.Product._id.in_(set_products)).all()
            for product in products:

                cp_sql = "select sum(unit_price) as summa, count(_id) as count " \
                         "from company_product where status='active' and _deleted='infinity' " \
                         "and product_id = " + "'" + product._id + "'"

                rows_dicts = g.tran.execute(cp_sql)
                list_of_dicts = [{key: value for (key, value) in row.items()} for row in rows_dicts]

                if list_of_dicts[0]['summa']:
                    filter_data["products_id"].append(product._id)
                    data = {
                        "barcode": product.barcode,
                        "image": product.image,
                        "unit_price": round(list_of_dicts[0]['summa']/list_of_dicts[0]['count'], 2),
                        "code": product.code,
                        "_id": product._id
                    }
                    productspec = g.tran.query(db.ProductSpec)\
                        .filter_by(_deleted='infinity', product_id=product._id).all()
                    productdict = g.tran.query(db.ProductDict)\
                        .filter_by(_deleted='infinity', product_id=product._id).all()
                    for prodspec in productspec:
                        property = g.tran.query(db.SpecificationProperty) \
                            .filter_by(id=prodspec.specification_property_id).first()
                        value = g.tran.query(db.SpecificationPropertyValue) \
                            .filter_by(id=prodspec.specification_property_value_id).first()
                        if property and value:
                            if g.lang == "ru":
                                data.update({property.name: value.name})
                            elif g.lang == "en":
                                data.update({property.name_en: value.name_en if value.name_en and value.name_en !='null' else value.name})
                            elif g.lang == "kg":
                                data.update({property.name_kg: value.name_kg if value.name_kg and value.name_kg !='null' else value.name})
                    for proddict in productdict:
                        table = getattr(db, proddict.dirname) if hasattr(db, proddict.dirname) else None
                        dirvalue = g.tran.query(table).filter_by(_deleted='infinity').filter(
                            table._id == proddict.dictionary_id).first()
                        dir = next(d for d in tables if d['table'] == proddict.dirname)
                        displayName = dir['name'] if dir else ''
                        data.update({displayName: dirvalue.name})
                    data_products.append(data)
            filters = get_filters(filter_data)
        return {'docs': data_products, 'filters': filters}


def get_product(bag):
    if "id" in bag:
        product = g.tran.query(db.Product).filter_by(_deleted='infinity').filter(db.Product._id == bag["id"]).first()
        product.specifications = []
        product.dictionaries = []
        dircategory = g.tran.query(db.DirCategory).filter_by(id=product.dircategory_id).all()
        productspec = g.tran.query(db.ProductSpec).filter_by(_deleted='infinity') \
            .filter_by(product_id=product._id).all()
        productdict = g.tran.query(db.ProductDict).filter_by(_deleted='infinity') \
            .filter_by(product_id=product._id).all()
        product.dircategory = dircategory
        for prodspec in productspec:
            specs = {}
            property = g.tran.query(db.SpecificationProperty) \
                .filter_by(id=prodspec.specification_property_id).first()
            value = g.tran.query(db.SpecificationPropertyValue) \
                .filter_by(id=prodspec.specification_property_value_id).first()
            specs['property'] = property
            specs['value'] = value
            product.specifications.append(specs)
        for proddict in productdict:
            dicts = {}
            table = getattr(db, proddict.dirname) if hasattr(db, proddict.dirname) else None
            dirvalue = g.tran.query(table).filter_by(_deleted='infinity').filter(
                table._id == proddict.dictionary_id).first()
            dicts['dirname'] = proddict.dirname
            dicts['value'] = dirvalue
            product.dictionaries.append(dicts)
        return {'doc': product}
    else:
        raise CbsException(GENERIC_ERROR, u'Выберите продукт')
