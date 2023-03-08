# coding=utf-8
import datetime
from sets import Set

from flask import g
from sqlalchemy import and_, func, type_coerce
from sqlalchemy.orm.attributes import InstrumentedAttribute

from app import controller, service
from app.helper.utils import get_code, get_code_application
from app.model import db
from app.model.db import ABSTIME
from app.service import table_access, chain, is_company
from app.service.dictionary import tables
from app.utils import CbsException
from apputils import orm_to_json
from messages import GENERIC_ERROR


@table_access(name=db.Application.__name__)
def listing(bag):
    if 'filter' in bag and 'status' in bag['filter']:
        data = g.tran.query(db.Application, db.Advert_lot).filter_by(_deleted='infinity') \
            .outerjoin(db.Advert_lot, db.Application.advert_lot_id == db.Advert_lot._id) \
            .join(db.Companies, and_(db.Application.company_id == db.Companies._id,
                                     db.Companies._deleted == 'infinity')) \
            .filter(db.Application.company_id == g.company._id, db.Application.status == bag['filter']['status']) \
            .order_by(db.Application._created.desc()).all()
    else:
        data = g.tran.query(db.Application, db.Advert_lot).filter_by(_deleted='infinity') \
            .outerjoin(db.Advert_lot, db.Application.advert_lot_id == db.Advert_lot._id) \
            .join(db.Companies, and_(db.Application.company_id == db.Companies._id,
                                     db.Companies._deleted == 'infinity')) \
            .filter(db.Application.company_id == g.company._id) \
            .order_by(db.Application._created.desc()).all()

    appls = []
    for appl, lot in data:
        sql = g.tran.query(db.Advert, db.DirSection, db.Companies) \
            .outerjoin(db.DirSection, db.Advert.dirsection_id == db.DirSection._id) \
            .outerjoin(db.Companies, and_(db.Companies._id == db.Advert.company_id,
                                          db.Companies._deleted == 'infinity')) \
            .filter(and_(db.Advert._deleted == 'infinity',
                         db.Advert._id == lot.advert_id))

        data = sql.first()

        if data:
            advert, dirsection, company = sql.first()
            ap = orm_to_json(appl)
            if g.lang == "ru":
                dirsection_label = dirsection.name
            elif g.lang == "en":
                dirsection_label = dirsection.name_en if dirsection.name_en and \
                                                         dirsection.name_en != 'null' else dirsection.name
            elif g.lang == 'kg':
                dirsection_label = dirsection.name_kg if dirsection.name_kg and \
                                                         dirsection.name_kg != 'null' else dirsection.name
            ap['dirsection'] = dirsection_label
            ap['org_name'] = company.short_name
            ap['created_date'] = ap['_created']
            ap['announce'] = advert
            appls.append(ap)

    return {'docs': appls}


@table_access('Application')
@chain(controller_name='data.put', output=['id', 'rev'])
def save(bag):
    pass


def appsave(bag):
    if not (bag.get('unit_price') and float(bag.get('unit_price')) > 0):
        raise CbsException(GENERIC_ERROR, u'Цена не может быть равной нулю или меньше нуля!')
    bag['unit_price'] = format(bag['unit_price'], '.2f')
    bag['total'] = format(bag['total'], '.2f')

    advert_lot = g.tran.query(db.Advert_lot).filter_by(_deleted='infinity', _id=bag['advert_lot_id']).first()
    if advert_lot:
        advert = g.tran.query(db.Advert).filter_by(_deleted='infinity', _id=advert_lot.advert_id).first()
        company_product = g.tran.query(db.Company_product) \
            .filter_by(_deleted='infinity', product_id=bag['company_product_id'], company_id=g.company._id).first()
        bag['type'] = 'Application'
        bag["code"] = get_code_application(advert.code)
        if company_product.date_end.strftime('%Y-%m-%d %H:%M:%S') <= advert.deadline.strftime('%Y-%m-%d %H:%M:%S'):
            raise CbsException(GENERIC_ERROR,
                               u'Срок действия цены на Ваш продукт к моменту вскрытия станет недействителен. '
                               u'Просим Вас обновить срок действия цены, а после подать заявку.')
        # if advert.status == 'Published':
        #     if advert.start_date:
        #         if advert.start_date < datetime.datetime.now():
        #             bag['type'] = 'Application'
        #             bag["code"] = get_code_application(advert.code)
        #             dirdocs = g.tran.query(db.DirDocument).filter_by(_deleted='infinity').all()
        #             for doc in dirdocs:
        #                 document = g.tran.query(db.Companydocument) \
        #                     .filter_by(_deleted='infinity', company_id=g.company._id, dirdocument_id=doc._id) \
        #                     .order_by(db.Companydocument._created.desc()).first()
        #                 label = ""
        #                 if document.date_end <= datetime.datetime.now():
        #                     if g.lang == "ru":
        #                         label = doc.name
        #                     elif g.lang == "en":
        #                         label = doc.name_en if doc.name_en and doc.name_en != 'null' else doc.name
        #                     elif g.lang == 'kg':
        #                         label = doc.name_kg if doc.name_kg and doc.name_kg != 'null' else doc.name
        #                     raise CbsException(GENERIC_ERROR, u'Вам необходимо обновить' + label)
        #         else:
        #             raise CbsException(GENERIC_ERROR,
        #                                u'Вы не можете подать заявку, так как срок подачи заявок еще не началось')
        #     else:
        #         bag['type'] = 'Application'
        #         bag["code"] = get_code_application(advert.code)
        #         dirdocs = g.tran.query(db.DirDocument).filter_by(_deleted='infinity').all()
        #         for doc in dirdocs:
        #             document = g.tran.query(db.Companydocument) \
        #                 .filter_by(_deleted='infinity', company_id=g.company._id, dirdocument_id=doc._id) \
        #                 .order_by(db.Companydocument._created.desc()).first()
        #             label = ""
        #             if document.date_end <= datetime.datetime.now():
        #                 if g.lang == "ru":
        #                     label = doc.name
        #                 elif g.lang == "en":
        #                     label = doc.name_en if doc.name_en and doc.name_en != 'null' else doc.name
        #                 elif g.lang == 'kg':
        #                     label = doc.name_kg if doc.name_kg and doc.name_kg != 'null' else doc.name
        #                 raise CbsException(GENERIC_ERROR, u'Вам необходимо обновить' + label)
        # else:
        #     raise CbsException(GENERIC_ERROR, u'Вы не можете подать заявку, так как срок подачи заявок истек')

        return controller.call(controller_name='data.put', bag=bag)


def adlist(bag):
    adverts = g.tran.query(db.Advert).filter_by(_deleted='infinity', status='Published').all()
    countr = 0
    announce = []

    if len(adverts) == 0:
        raise CbsException(GENERIC_ERROR, u'Запросы пока отсутствуют')

    ids = []

    for advert in adverts:
        advert.advert_lots = []
        advert_lots = g.tran.query(db.Advert_lot).filter_by(_deleted='infinity').filter(
            db.Advert_lot.advert_id == advert._id).all()
        data = {}
        lot_budget = 0
        for advert_lot in advert_lots:
            lot_budget += advert_lot.budget
            advert_lot.specifications = []
            advert_lot.dictionaries = []
            advert_lot.products = []
            advert_lot.applications = []
            applications = g.tran.query(db.Application).filter_by(_deleted='infinity').filter(
                db.Application.advert_lot_id == advert_lot._id, db.Application.company_id == g.company._id).all()
            if applications:
                break
            advert_lot_specs = g.tran.query(db.Advert_lot_specification).filter_by(advert_lot_id=advert_lot._id).all()
            items = []
            prodcs = []
            prodds = []
            sp = ""
            dp = ""
            pds = ""
            a_lot_category_id = ' and p.dircategory_id = ' + u'{}'.format(advert_lot.dircategory_id)
            for s in advert_lot_specs:
                sp1 = 'specification_property_id = ' + u'{}'.format(s.specification_property_id)
                sp2 = ' and ' + 'specification_property_value_id = ' + u'{}'.format(s.specification_property_value_id)
                items.append(str('(' + sp1) + str(sp2 + ')'))
                if len(advert_lot_specs) > 1:
                    pss = " or ".join(items)
                    sp = 'and (' + u'{}'.format(str(pss)) + ')'
                elif len(advert_lot_specs) == 1:
                    sp = "and " + sp1 + sp2
            count_ps = len(advert_lot_specs)
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
                        where p._deleted='infinity' and p._id = s.product_id """ + a_lot_category_id
            if count_ps > 1:
                count = ' and s.count = ' + u'{}'.format(count_ps)
                ps_sql += ''.join(count)

            rows_spec = g.tran.execute(ps_sql)
            list_of_dicts = [{key: value for (key, value) in row.items()} for row in rows_spec]
            for ps in list_of_dicts:
                prod_id = ps["_id"]
                prodcs.append(prod_id)

            advert_lot_dicts = g.tran.query(db.Advert_lot_dictionaries).filter_by(advert_lot_id=advert_lot._id).all()
            dict_items = []
            for d in advert_lot_dicts:
                dp1 = " dirname = " + "'" + d.dirname + "'"
                dp2 = " and dictionary_id = " + "'" + d.dictionary_id + "'"
                dict_items.append(str('(' + dp1) + str(dp2 + ')'))
                if len(advert_lot_dicts) > 1:
                    pds = " or ".join(dict_items)
                    dp = 'and (' + u'{}'.format(str(pds)) + ')'
                elif len(advert_lot_dicts) == 1:
                    dp = "and " + dp1 + dp2
            count_pd = len(advert_lot_dicts)
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
                        where p._deleted='infinity' and p._id = d.product_id """ + a_lot_category_id
            if count_pd > 1:
                count = ' and d.count = ' + u'{}'.format(count_ps)
                pd_sql += ''.join(count)

            rows_dicts = g.tran.execute(pd_sql)
            list_of_dicts = [{key: value for (key, value) in row.items()} for row in rows_dicts]
            for pd in list_of_dicts:
                prod_id = pd["_id"]
                prodds.append(prod_id)

            ps = Set(prodcs)
            pd = Set(prodds)
            set_products = list(ps.intersection(pd))

            if len(set_products) > 0:
                company_products = g.tran.query(db.Company_product).filter_by(_deleted='infinity',
                                                                              company_id=g.company._id) \
                    .filter(db.Company_product.product_id.in_(set_products)).count()

                if company_products > 0:
                    ids.append(advert._id)

        if advert._id in ids:
            dirsection = g.tran.query(db.DirSection) \
                .filter_by(_deleted='infinity').filter(db.DirSection._id == advert.dirsection_id).first()
            if g.lang == 'ru':
                dirsection_name = dirsection.name
            if g.lang == 'en':
                dirsection_name = dirsection.name_en if dirsection.name_en and dirsection.name_en != 'null' else dirsection.name
            if g.lang == 'kg':
                dirsection_name = dirsection.name_kg if dirsection.name_kg and dirsection.name_kg != 'null' else dirsection.name
            organization = g.tran.query(db.Companies) \
                .filter_by(_deleted='infinity') \
                .filter(db.Companies._id == advert.company_id).first()
            dirprocurement = g.tran.query(db.DirProcurement) \
                .filter_by(_deleted='infinity') \
                .filter(db.DirProcurement._id == advert.dirprocurement_id).first()
            if g.lang == 'ru':
                dirprocurement_name = dirprocurement.name
            if g.lang == 'en':
                dirprocurement_name = dirprocurement.name_en if dirprocurement.name_en and dirprocurement.name_en != 'null' else dirprocurement.name
            if g.lang == 'kg':
                dirprocurement_name = dirprocurement.name_kg if dirprocurement.name_kg and dirprocurement.name_kg != 'null' else dirprocurement.name
            data = {
                "_id": advert._id,
                "code": advert.code,
                "status": advert.status,
                "published_date": advert.published_date,
                "create_date": advert.created_date,
                "update_date": advert.update_date,
                "dirsection": dirsection_name,
                "start_date": advert.start_date,
                "step": advert.step,
                "deadline": advert.deadline,
                "organization": organization.name,
                "dirprocurement": dirprocurement_name,
                "count_lot": len(advert_lots),
                "budget": lot_budget
            }
            announce.append(data)
            ids.append(advert._id)
    countr = len(announce)
    return {'docs': announce, 'count': countr}


def getApp(bag):
    advert = g.tran.query(db.Advert).filter_by(_deleted='infinity').filter(
        db.Advert._id == bag["advert_id"]).first()
    advert_lots = g.tran.query(db.Advert_lot).filter_by(_deleted='infinity').filter(
        db.Advert_lot.advert_id == advert._id).all()
    lot_budget = 0
    advert_lots_data = []
    advert_data = {}
    for advert_lot in advert_lots:
        lot_budget += advert_lot.budget
        advert_lot.specifications = []
        advert_lot.dictionaries = []
        advert_lot.products = []
        advert_lot.applications = []

        dircategory_lot = g.tran.query(db.DirCategory).filter(db.DirCategory.id == advert_lot.dircategory_id).first()
        if g.lang == "ru":
            dircategory_lot_name = dircategory_lot.name
        elif g.lang == "en":
            dircategory_lot_name = dircategory_lot.name_en if dircategory_lot.name_en else dircategory_lot.name
        elif g.lang == "kg":
            dircategory_lot_name = dircategory_lot.name_kg if dircategory_lot.name_kg else dircategory_lot.name
        else:
            dircategory_lot_name = dircategory_lot.name
        advert_lot.dircategory = dircategory_lot_name

        if advert.status == 'Published':
            applications = g.tran.query(db.Application).filter_by(_deleted='infinity').filter(
                db.Application.advert_lot_id == advert_lot._id, db.Application.company_id == g.company._id).all()
        elif advert.status == 'Results':
            applications = g.tran.query(db.Application).filter_by(_deleted='infinity').filter(
                db.Application.advert_lot_id == advert_lot._id, db.Application.company_id == g.company._id).all()
        else:
            return {'doc': advert_data}
        for application in applications:
            product = g.tran.query(db.Product).filter_by(_deleted='infinity').filter(
                db.Product._id == application.company_product_id)

            product = product.first()
            dircategory = g.tran.query(db.DirCategory).filter_by(id=product.dircategory_id).first()
            if g.lang == "ru":
                dircategory_name = dircategory.name
            elif g.lang == "en":
                dircategory_name = dircategory.name_en if dircategory.name_en else dircategory.name
            elif g.lang == "kg":
                dircategory_name = dircategory.name_kg if dircategory.name_kg else dircategory.name
            else:
                dircategory_name = dircategory.name
            application.company_products = {
                "dircategory": dircategory_name,
                "barcode": product.barcode,
                "image": product.image,
                "code": product.code,
                "_id": product._id
            }
            product.specifications = []
            product.dictionaries = []

            productspec = g.tran.query(db.ProductSpec).filter_by(_deleted='infinity', product_id=product._id).all()
            productdict = g.tran.query(db.ProductDict).filter_by(_deleted='infinity', product_id=product._id).all()
            product.dircategory = dircategory
            for prodspec in productspec:
                property = g.tran.query(db.SpecificationProperty) \
                    .filter_by(id=prodspec.specification_property_id).first()
                value = g.tran.query(db.SpecificationPropertyValue) \
                    .filter_by(id=prodspec.specification_property_value_id).first()
                if g.lang == "ru":
                    application.company_products.update({property.name: value.name})
                elif g.lang == "en":
                    application.company_products.update({
                        property.name_en: value.name_en if value.name_en and value.name_en != 'null' else value.name})
                elif g.lang == "kg":
                    application.company_products.update({
                        property.name_kg: value.name_kg if value.name_kg and value.name_kg != 'null' else value.name})
            for proddict in productdict:
                table = getattr(db, proddict.dirname) if hasattr(db, proddict.dirname) else None
                dirvalue = g.tran.query(table).filter_by(_deleted='infinity').filter(
                    table._id == proddict.dictionary_id).first()
                dir = next(d for d in tables if d['table'] == proddict.dirname)
                displayName = dir['name'] if dir else ''
                if g.lang == "ru":
                    application.company_products.update({displayName: dirvalue.name})
                elif g.lang == "en":
                    application.company_products.update({
                        displayName: dirvalue.name_en if dirvalue.name_en and
                                                         dirvalue.name_en != 'null' else dirvalue.name})
                elif g.lang == "kg":
                    application.company_products.update({
                        displayName: dirvalue.name_kg if dirvalue.name_kg and
                                                         dirvalue.name_kg != 'null' else dirvalue.name})
            advert_lot.applications.append(application)
        advert_lot_specs = g.tran.query(db.Advert_lot_specification).filter_by(advert_lot_id=advert_lot._id).all()
        for spec in advert_lot_specs:
            specs = {}
            specs['specification_id'] = spec.specification_id
            specs['property_id'] = spec.specification_property_id
            specs['value_id'] = spec.specification_property_value_id
            advert_lot.specifications.append(specs)
        advert_lot_dicts = g.tran.query(db.Advert_lot_dictionaries).filter_by(advert_lot_id=advert_lot._id).all()
        for dict in advert_lot_dicts:
            dicts = {}
            dicts['dirname'] = dict.dirname
            dicts['dictionary_id'] = dict.dictionary_id
            advert_lot.dictionaries.append(dicts)
        items = []
        prodcs = []
        prodds = []
        sp = ""
        dp = ""
        pds = ""
        for s in advert_lot_specs:
            sp1 = 'specification_property_id = ' + u'{}'.format(s.specification_property_id)
            sp2 = ' and ' + 'specification_property_value_id = ' + u'{}'.format(s.specification_property_value_id)
            items.append(str('(' + sp1) + str(sp2 + ')'))
            if len(advert_lot_specs) > 1:
                pss = " or ".join(items)
                sp = 'and (' + u'{}'.format(str(pss)) + ')'
            elif len(advert_lot_specs) == 1:
                sp = "and " + sp1 + sp2
        count_ps = len(advert_lot_specs)
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

        rows_spec = g.tran.execute(ps_sql)
        list_of_dicts = [{key: value for (key, value) in row.items()} for row in rows_spec]
        for ps in list_of_dicts:
            prod_id = ps["_id"]
            prodcs.append(prod_id)

        advert_lot_dicts = g.tran.query(db.Advert_lot_dictionaries).filter_by(advert_lot_id=advert_lot._id).all()
        dict_items = []
        for d in advert_lot_dicts:
            dp1 = " dirname = " + "'" + d.dirname + "'"
            dp2 = " and dictionary_id = " + "'" + d.dictionary_id + "'"
            dict_items.append(str('(' + dp1) + str(dp2 + ')'))
            if len(advert_lot_dicts) > 1:
                pds = " or ".join(dict_items)
                dp = 'and (' + u'{}'.format(str(pds)) + ')'
            elif len(advert_lot_dicts) == 1:
                dp = "and " + dp1 + dp2
        count_pd = len(advert_lot_dicts)
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
            count = ' and d.count = ' + u'{}'.format(count_ps)
            pd_sql += ''.join(count)

        rows_dicts = g.tran.execute(pd_sql)
        list_of_dicts = [{key: value for (key, value) in row.items()} for row in rows_dicts]
        for pd in list_of_dicts:
            prod_id = pd["_id"]
            prodds.append(prod_id)

        ps = Set(prodcs)
        pd = Set(prodds)
        set_products = list(ps.intersection(pd))
        company_products = g.tran.query(db.Company_product).filter_by(_deleted='infinity',
                                                                      company_id=g.company._id) \
            .filter(db.Company_product.product_id.in_(set_products)).all()
        data = {}
        if len(company_products) > 0:
            dirsection = g.tran.query(db.DirSection) \
                .filter_by(_deleted='infinity').filter(db.DirSection._id == advert.dirsection_id).first()
            organization = g.tran.query(db.Companies) \
                .filter_by(_deleted='infinity') \
                .filter(db.Companies._id == advert.company_id).first()
            dirprocurement = g.tran.query(db.DirProcurement) \
                .filter_by(_deleted='infinity') \
                .filter(db.DirProcurement._id == advert.dirprocurement_id).first()
            for prod in company_products:
                product = g.tran.query(db.Product).filter_by(_deleted='infinity').filter(
                    db.Product._id == prod.product_id, db.Product.dircategory_id == advert_lot.dircategory_id)
                if bag.get('barcode'):
                    product = product.filter(db.Product.barcode == bag["barcode"])

                product = product.first()
                if product:
                    dircategory = g.tran.query(db.DirCategory).filter_by(id=product.dircategory_id).first()
                    if g.lang == "ru":
                        dircategory_name = dircategory.name
                    elif g.lang == "en":
                        dircategory_name = dircategory.name_en if dircategory.name_en else dircategory.name
                    elif g.lang == "kg":
                        dircategory_name = dircategory.name_kg if dircategory.name_kg else dircategory.name
                    else:
                        dircategory_name = dircategory.name
                    data = {
                        "unit_price": prod.unit_price,
                        "dircategory": dircategory_name,
                        "date_add": prod.date_add,
                        "date_update": prod.date_update,
                        "status": prod.status,
                        "quantity": advert_lot.quantity,
                        "total": advert_lot.quantity * prod.unit_price,
                        "barcode": product.barcode,
                        "image": product.image,
                        "code": product.code,
                        "_id": product._id,
                        "company_id": prod.company_id
                    }
                    product.specifications = []
                    product.dictionaries = []

                    dircategory = g.tran.query(db.DirCategory).filter_by(id=product.dircategory_id).all()
                    productspec = g.tran.query(db.ProductSpec).filter_by(_deleted='infinity',
                                                                         product_id=product._id).all()
                    productdict = g.tran.query(db.ProductDict).filter_by(_deleted='infinity',
                                                                         product_id=product._id).all()
                    product.dircategory = dircategory
                    for prodspec in productspec:
                        property = g.tran.query(db.SpecificationProperty) \
                            .filter_by(id=prodspec.specification_property_id).first()
                        value = g.tran.query(db.SpecificationPropertyValue) \
                            .filter_by(id=prodspec.specification_property_value_id).first()
                        if g.lang == "ru":
                            data.update({property.name: value.name})
                        elif g.lang == "en":
                            data.update({
                                property.name_en: value.name_en if value.name_en and value.name_en != 'null' else value.name})
                        elif g.lang == "kg":
                            data.update({
                                property.name_kg: value.name_kg if value.name_kg and value.name_kg != 'null' else value.name})

                    for proddict in productdict:
                        table = getattr(db, proddict.dirname) if hasattr(db, proddict.dirname) else None
                        dirvalue = g.tran.query(table).filter_by(_deleted='infinity').filter(
                            table._id == proddict.dictionary_id).first()
                        dir = next(d for d in tables if d['table'] == proddict.dirname)
                        displayName = dir['name'] if dir else ''
                        if g.lang == "ru":
                            data.update({displayName: dirvalue.name})
                        elif g.lang == "en":
                            data.update({
                                displayName: dirvalue.name_en if dirvalue.name_en and
                                                                 dirvalue.name_en != 'null' else dirvalue.name})
                        elif g.lang == "kg":
                            data.update({
                                displayName: dirvalue.name_kg if dirvalue.name_kg and
                                                                 dirvalue.name_kg != 'null' else dirvalue.name})
                    advert_lot.products.append(data)
            advert_lots_data.append(advert_lot)
            if g.lang == "ru":
                dirprocurement_name = dirprocurement.name
                dirsection_name = dirsection.name
            elif g.lang == "en":
                dirprocurement_name = dirprocurement.name_en if dirprocurement.name_en else dirprocurement.name
                dirsection_name = dirsection.name_en if dirsection.name_en else dirsection.name
            elif g.lang == "kg":
                dirprocurement_name = dirprocurement.name_kg if dirprocurement.name_kg else dirprocurement.name
                dirsection_name = dirsection.name_kg if dirsection.name_kg else dirsection.name
            else:
                dirprocurement_name = dirprocurement.name
                dirsection_name = dirsection.name
            advert_data = {
                "_id": advert._id,
                "code": advert.code,
                "status": advert.status,
                "published_date": advert.published_date,
                "create_date": advert.created_date,
                "update_date": advert.update_date,
                "dirsection": dirsection_name,
                "deadline": advert.deadline,
                "organization": organization.name,
                "dirprocurement": dirprocurement_name,
                "dirprocurement_code": dirprocurement.data[
                    'code'] if dirprocurement.data is not None and 'code' in dirprocurement.data else None,
                "count_lot": len(advert_lots),
                "budget": lot_budget,
                "advert_lots": advert_lots_data
            }
    return {'doc': advert_data}


def MyApp(bag):
    advert = g.tran.query(db.Advert).filter_by(_deleted='infinity').filter(
        db.Advert._id == bag["advert_id"]).first()
    advert_lots = g.tran.query(db.Advert_lot).filter_by(_deleted='infinity').filter(
        db.Advert_lot.advert_id == advert._id).all()
    lot_budget = 0
    advert_lots_data = []
    advert_data = {}
    for advert_lot in advert_lots:
        lot_budget += advert_lot.budget
        advert_lot.specifications = []
        advert_lot.dictionaries = []
        advert_lot.products = []
        advert_lot.applications = []

        dircategory_lot = g.tran.query(db.DirCategory).filter(db.DirCategory.id == advert_lot.dircategory_id).first()
        advert_lot.dircategory = dircategory_lot.name

        if advert.status == 'Published':
            applications = g.tran.query(db.Application).filter_by(_deleted='infinity').filter(
                db.Application.advert_lot_id == advert_lot._id, db.Application.company_id == g.company._id).all()
        elif advert.status == 'Results':
            applications = g.tran.query(db.Application).filter_by(_deleted='infinity').filter(
                db.Application.advert_lot_id == advert_lot._id).all()
        else:
            return {'doc': advert_data}
        for application in applications:
            product = g.tran.query(db.Product).filter_by(_deleted='infinity').filter(
                db.Product._id == application.company_product_id)

            product = product.first()
            dircategory = g.tran.query(db.DirCategory).filter_by(id=product.dircategory_id).first()
            application.company_products = {
                "dircategory": dircategory.name,
                "barcode": product.barcode,
                "image": product.image,
                "code": product.code,
                "_id": product._id
            }
            product.specifications = []
            product.dictionaries = []

            productspec = g.tran.query(db.ProductSpec).filter_by(_deleted='infinity', product_id=product._id).all()
            productdict = g.tran.query(db.ProductDict).filter_by(_deleted='infinity', product_id=product._id).all()
            product.dircategory = dircategory
            for prodspec in productspec:
                property = g.tran.query(db.SpecificationProperty) \
                    .filter_by(id=prodspec.specification_property_id).first()
                value = g.tran.query(db.SpecificationPropertyValue) \
                    .filter_by(id=prodspec.specification_property_value_id).first()
                application.company_products.update({property.name: value.name})
            for proddict in productdict:
                table = getattr(db, proddict.dirname) if hasattr(db, proddict.dirname) else None
                dirvalue = g.tran.query(table).filter_by(_deleted='infinity').filter(
                    table._id == proddict.dictionary_id).first()
                dir = next(d for d in tables if d['table'] == proddict.dirname)
                displayName = dir['name'] if dir else ''
                application.company_products.update({displayName: dirvalue.name})
            advert_lot.applications.append(application)
        advert_lot_specs = g.tran.query(db.Advert_lot_specification).filter_by(advert_lot_id=advert_lot._id).all()
        for spec in advert_lot_specs:
            specs = {}
            specs['specification_id'] = spec.specification_id
            specs['property_id'] = spec.specification_property_id
            specs['value_id'] = spec.specification_property_value_id
            advert_lot.specifications.append(specs)
        advert_lot_dicts = g.tran.query(db.Advert_lot_dictionaries).filter_by(advert_lot_id=advert_lot._id).all()
        for dict in advert_lot_dicts:
            dicts = {}
            dicts['dirname'] = dict.dirname
            dicts['dictionary_id'] = dict.dictionary_id
            advert_lot.dictionaries.append(dicts)

        prodcs = []
        prodds = []
        products = g.tran.query(db.Product).filter_by(_deleted='infinity').all()
        for product in products:
            productspecs = g.tran.query(db.ProductSpec).filter_by(_deleted='infinity').filter_by(
                product_id=product._id).all()
            check_count = 0
            for prod_spec in productspecs:
                for spec in advert_lot.specifications:
                    if spec['property_id'] == prod_spec.specification_property_id and \
                            spec['value_id'] == prod_spec.specification_property_value_id:
                        check_count += 1
                if len(advert_lot.specifications) == check_count:
                    prodcs.append(product._id)
        for product in products:
            productdicts = g.tran.query(db.ProductDict).filter_by(_deleted='infinity').filter_by(
                product_id=product._id).all()
            check_count = 0
            for prod_dict in productdicts:
                for dict in advert_lot.dictionaries:
                    if dict['dirname'] == prod_dict.dirname and dict['dictionary_id'] == prod_dict.dictionary_id:
                        check_count += 1
                if len(advert_lot.dictionaries) == check_count:
                    prodds.append(product._id)
        ps = Set(prodcs)
        pd = Set(prodds)
        set_products = list(ps.intersection(pd))
        company_products = g.tran.query(db.Company_product).filter_by(_deleted='infinity',
                                                                      company_id=g.company._id) \
            .filter(db.Company_product.product_id.in_(set_products)).all()
        data_products = []
        data = {}

        if len(company_products) > 0:
            dirsection = g.tran.query(db.DirSection) \
                .filter_by(_deleted='infinity').filter(db.DirSection._id == advert.dirsection_id).first()
            organization = g.tran.query(db.Companies) \
                .filter_by(_deleted='infinity') \
                .filter(db.Companies._id == advert.company_id).first()
            dirprocurement = g.tran.query(db.DirProcurement) \
                .filter_by(_deleted='infinity') \
                .filter(db.DirProcurement._id == advert.dirprocurement_id).first()
            for prod in company_products:
                product = g.tran.query(db.Product).filter_by(_deleted='infinity').filter(
                    db.Product._id == prod.product_id)
                if bag.get('barcode'):
                    product = product.filter(db.Product.barcode == bag["barcode"])

                product = product.first()
                dircategory = g.tran.query(db.DirCategory).filter_by(id=product.dircategory_id).first()
                data = {
                    "unit_price": prod.unit_price,
                    "dircategory": dircategory.name,
                    "date_add": prod.date_add,
                    "date_update": prod.date_update,
                    "status": prod.status,
                    "barcode": product.barcode,
                    "image": product.image,
                    "code": product.code,
                    "_id": product._id
                }
                product.specifications = []
                product.dictionaries = []

                productspec = g.tran.query(db.ProductSpec).filter_by(_deleted='infinity',
                                                                     product_id=product._id).all()
                productdict = g.tran.query(db.ProductDict).filter_by(_deleted='infinity',
                                                                     product_id=product._id).all()
                prod_specs = {}
                for prodspec in productspec:
                    property = g.tran.query(db.SpecificationProperty) \
                        .filter_by(id=prodspec.specification_property_id).first()
                    value = g.tran.query(db.SpecificationPropertyValue) \
                        .filter_by(id=prodspec.specification_property_value_id).first()
                    prod_specs.update({property.name: value.name})

                prod_dicts = {}
                for proddict in productdict:
                    table = getattr(db, proddict.dirname) if hasattr(db, proddict.dirname) else None
                    dirvalue = g.tran.query(table).filter_by(_deleted='infinity').filter(
                        table._id == proddict.dictionary_id).first()
                    dir = next(d for d in tables if d['table'] == proddict.dirname)
                    displayName = dir['name'] if dir else ''
                    prod_dicts.update({displayName: dirvalue.name})

                data['specs'] = prod_specs
                data['dicts'] = prod_dicts
            advert_lot.products.append(data)
            advert_lots_data.append(advert_lot)
            advert_data = {
                "_id": advert._id,
                "code": advert.code,
                "status": advert.status,
                "published_date": advert.published_date,
                "create_date": advert.created_date,
                "update_date": advert.update_date,
                "dirsection": dirsection.name,
                "deadline": advert.deadline,
                "organization": organization.name,
                "dirprocurement": dirprocurement.name,
                "count_lot": len(advert_lots),
                "budget": lot_budget,
                "advert_lots": advert_lots_data
            }
    return {'doc': advert_data}


@table_access('Application')
def announce_list(bag):
    data = g.tran.query(db.Application, db.Advert_lot).filter_by(_deleted='infinity') \
        .outerjoin(db.Advert_lot, db.Application.advert_lot_id == db.Advert_lot._id) \
        .filter(db.Application.company_id == g.company._id) \
        .order_by(db.Application._created.desc()).all()

    announcies_ids = []
    for appl, lot in data:
        if lot.advert_id not in announcies_ids:
            announcies_ids.append(lot.advert_id)
    advert = g.tran.query(db.Advert) \
        .filter_by(_deleted='infinity').filter(db.Advert._id.in_(announcies_ids)) \
        .order_by(db.Advert.published_date.desc())

    count = advert.count()
    if "limit" in bag:
        advert = advert.limit(bag.get('limit', 10))
    if "offset" in bag:
        advert = advert.offset(bag["offset"])
    adverts = orm_to_json(advert.all())
    for adv in adverts:
        dirsection = g.tran.query(db.DirSection) \
            .filter_by(_deleted='infinity').filter(db.DirSection._id == adv['dirsection_id']).first()
        if g.lang == 'ru':
            dirsection_name = dirsection.name
        if g.lang == 'en':
            dirsection_name = dirsection.name_en if dirsection.name_en and dirsection.name_en != 'null' else dirsection.name
        if g.lang == 'kg':
            dirsection_name = dirsection.name_kg if dirsection.name_kg and dirsection.name_kg != 'null' else dirsection.name

        pur_company = g.tran.query(db.Companies).filter_by(_deleted='infinity') \
            .filter(db.Companies._id == adv['company_id']).first()
        adv['dirsection'] = dirsection_name or ''
        adv['pur_company'] = pur_company.name or ''
    return {'docs': adverts, 'count': count}


@is_company()
def app_check(bag):
    if bag.get('_id'):
        advert = g.tran.query(db.Advert).filter_by(_deleted='infinity', _id=bag['_id'], status='Published').first()
        advert_lots = g.tran.query(db.Advert_lot).filter_by(_deleted='infinity', advert_id=advert._id).all()
        for lot in advert_lots:
            applications = g.tran.query(db.Application).filter_by(_deleted='infinity', advert_lot_id=lot._id).all()
            for app in applications:
                if app.company_id != g.company._id:
                    c_emp_user_ids = []
                    my_c_emp_user_ids = []
                    company_employes = g.tran.query(db.Companyemployees) \
                        .filter(db.Companyemployees.company_id == app.company_id).all()
                    for user in company_employes:
                        c_emp_user_ids.append(user.user_id)
                    my_comp_emp = g.tran.query(db.Companyemployees) \
                        .filter(db.Companyemployees.company_id == g.company._id).all()
                    for user in my_comp_emp:
                        my_c_emp_user_ids.append(user.user_id)
                    ce = Set(c_emp_user_ids)
                    mce = Set(my_c_emp_user_ids)
                    set_user = list(ce.intersection(mce))
                    if len(set_user) > 0:
                        raise CbsException(GENERIC_ERROR,
                                           u'Уважаемый поставщик, система не пропустит заявку поставщика, если подается'
                                           u' одними и теми же лицами от двух и более организаций на опубликованный '
                                           u'конкурс либо закупку, в этой связи просим проверить у себя лиц, подавщих '
                                           u'заявку от другой организации, но числящийся в вашей организации.'
                                           u' Основание: "Статья 6 Конфликт интересов" Закона Кыргызской '
                                           u'Республики о государственных закупках')
    return


def draftlisting(bag):
    if hasattr(g, 'company'):
        ad_status = ['Published']
        applications = g.tran.query(db.Application) \
            .filter_by(_deleted='infinity', company_id=g.company._id, status='Draft').all()
        appls = []
        for app in applications:
            sql = g.tran.query(db.Advert_lot, db.Advert, db.DirSection, db.Companies) \
                .outerjoin(db.Advert, and_(db.Advert._id == db.Advert_lot.advert_id,
                                           db.Advert.status.in_(ad_status))) \
                .outerjoin(db.DirSection, and_(db.DirSection._id == db.Advert.dirsection_id,
                                               db.DirSection._deleted == 'infinity')) \
                .outerjoin(db.Companies, and_(db.Companies._id == db.Advert.company_id,
                                              db.Companies._deleted == 'infinity')) \
                .filter(and_(db.Advert_lot._deleted == 'infinity',
                             db.Advert_lot._id == app.advert_lot_id))
            dirsection_label = ''
            data_an = sql.first()
            if data_an:
                advert_lot, advert, dirsection, company = sql.first()
                ap = orm_to_json(app)
                if g.lang == "ru":
                    dirsection_label = dirsection.name
                elif g.lang == "en":
                    dirsection_label = dirsection.name_en if dirsection.name_en and \
                                                             dirsection.name_en != 'null' else dirsection.name
                elif g.lang == 'kg':
                    dirsection_label = dirsection.name_kg if dirsection.name_kg and \
                                                             dirsection.name_kg != 'null' else dirsection.name
                ap['dirsection'] = dirsection_label
                ap['org_name'] = company.short_name
                ap['created_date'] = ap['_created']
                ap['announce'] = advert
                appls.append(ap)
        return {'docs': appls}


def getDraftapp(bag):
    application = g.tran.query(db.Application) \
        .filter_by(_deleted='infinity', company_id=g.company._id, status='Draft', _id=bag['_id']).first()
    advert_lot = g.tran.query(db.Advert_lot).filter_by(_deleted='infinity', _id=application.advert_lot_id).first()
    advert = g.tran.query(db.Advert).filter_by(_deleted='infinity', _id=advert_lot.advert_id).first()
    return {'application': orm_to_json(application), 'advert_lot': orm_to_json(advert_lot),
            'advert': orm_to_json(advert)}
