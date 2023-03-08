# coding=utf-8
from sets import Set

from flask import g
from sqlalchemy import type_coerce
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm.attributes import InstrumentedAttribute

from app import controller
from app.controller import entity
from app.keys import BOBJECT
from app.keys import CRUD
from app.messages import TABLE_NOT_FOUND
from app.model import db
from app.service import table_access, chain
from app.utils import orm_to_json, CbsException

tables = [
    {
        'table': 'DirCountry',
        'name': u'Страны',
        'role_requires': 0,
        'columns': [
            {'name': 'name', 'displayName': u'Наименование', 'visible': True, 'type': 'text'},
            {'name': 'name_kg', 'displayName': u'Наименование kg', 'visible': True, 'type': 'text'},
            {'name': 'name_en', 'displayName': u'Наименование en', 'visible': True, 'type': 'text'},
            {'name': 'code.iso_two', 'displayName': u'Код ISO(2 буквы)', 'visible': True, 'type': 'text'},
            {'name': 'code.iso_three', 'displayName': u'Код ISO(3 буквы)', 'visible': True, 'type': 'text'},
            {'name': 'code.iso_number', 'displayName': u'ISO номер', 'visible': True, 'type': 'text'},
            {'name': 'code.barcode', 'displayName': u'Штрих код', 'visible': True, 'type': 'text'},
            {'name': 'code.telcode', 'displayName': u'Тел код', 'visible': True, 'type': 'text'},
            {'name': 'data.index', 'displayName': u'Индекс', 'visible': True, 'type': 'number'}
        ]
    },
    {
        'table': 'DirManifacture',
        'name': u'Производители',
        'role_requires': 0,
        'columns': [
            {'name': 'name', 'displayName': u'Наименование', 'visible': True, 'type': 'text'},
            {'name': 'name_kg', 'displayName': u'Наименование kg', 'visible': False, 'type': 'text'},
            {'name': 'name_en', 'displayName': u'Наименование en', 'visible': False, 'type': 'text'}
        ]
    },
    {
        'table': 'DirBrand',
        'name': u'Товарные знаки(марка, бренд)',
        'role_requires': 0,
        'columns': [
            {'name': 'name', 'displayName': u'Наименование', 'visible': True, 'type': 'text'},
            {'name': 'name_kg', 'displayName': u'Наименование kg', 'visible': False, 'type': 'text'},
            {'name': 'name_en', 'displayName': u'Наименование en', 'visible': False, 'type': 'text'}
        ]
    },

    {
        'table': 'DirUnits',
        'name': u'Единицы измерения',
        'role_requires': 0,
        'columns': [
            {'name': 'code', 'displayName': u'Код', 'visible': True, 'type': 'text'},
            {'name': 'name', 'displayName': u'Наименование', 'visible': True, 'type': 'text'},
            {'name': 'name_kg', 'displayName': u'Наименование kg', 'visible': False, 'type': 'text'},
            {'name': 'name_en', 'displayName': u'Наименование en', 'visible': False, 'type': 'text'},
            {'name': 'short_name', 'displayName': u'Короткое наз.', 'visible': True, 'type': 'text'}

        ]
    },
    {
        'table': 'DirBank',
        'name': u'Банки КР',
        'role_requires': 0,
        'columns': [
            {'name': 'name', 'displayName': u'Наименование', 'visible': True, 'type': 'text'},
            {'name': 'name_kg', 'displayName': u'Наименование kg', 'visible': False, 'type': 'text'},
            {'name': 'name_en', 'displayName': u'Наименование en', 'visible': False, 'type': 'text'},
            {'name': 'bik', 'displayName': u'БИК', 'visible': True, 'type': 'text'},
            {'name': 'bik_swift', 'displayName': u'БИК SWIFT', 'visible': True, 'type': 'text'},
            {'name': 'old_bik', 'displayName': u'Старый БИК', 'visible': True, 'type': 'text'}
        ]
    },
    {
        'table': 'Typeofownership',
        'name': u'Форма собственности',
        'role_requires': 0,
        'columns': [
            {'name': 'name', 'displayName': u'Наименование', 'visible': True, 'type': 'text'},
            {'name': 'name_kg', 'displayName': u'Наименование kg', 'visible': False, 'type': 'text'},
            {'name': 'name_en', 'displayName': u'Наименование en', 'visible': False, 'type': 'text'},
            {'name': 'type_owner', 'displayName': u'Тип', 'visible': False, 'type': 'text'},
            {'name': 'data.type', 'displayName': u'ИП/Организация', 'visible': False, 'type': 'text'}
        ]
    },
    {
        'table': 'DirPayment',
        'name': u'Оплата',
        'role_requires': 0,
        'columns': [
            {'name': 'name', 'displayName': u'Наименование', 'visible': True, 'type': 'text'},
            {'name': 'name_kg', 'displayName': u'Наименование kg', 'visible': False, 'type': 'text'},
            {'name': 'name_en', 'displayName': u'Наименование en', 'visible': False, 'type': 'text'},
        ]
    },
    {
        'table': 'DirProcurement',
        'name': u'Методы закупок',
        'role_requires': 0,
        'columns': [
            {'name': 'name', 'displayName': u'Наименование', 'visible': True, 'type': 'text'},
            {'name': 'name_kg', 'displayName': u'Наименование kg', 'visible': False, 'type': 'text'},
            {'name': 'name_en', 'displayName': u'Наименование en', 'visible': False, 'type': 'text'},
            {'name': 'day_count', 'displayName': u'Срок в днях', 'visible': False, 'type': 'number'},
            {'name': 'count', 'displayName': u'Кол-во участников', 'visible': False, 'type': 'number'},
            {'name': 'description', 'displayName': u'Описание', 'visible': False, 'type': 'text'},
            {'name': 'order', 'displayName': u'Порядок', 'visible': False, 'type': 'number'}
        ]
    },
    {
        'table': 'Enums',
        'name': u'Типы/Статусы',
        'role_requires': 10,
        'columns': [
            {'name': 'name', 'displayName': u'Тип', 'visible': True, 'type': 'text'},
            {'name': 'data.name', 'displayName': u'Наименование', 'visible': True, 'type': 'text'},
            {'name': 'data.key', 'displayName': u'Ключ', 'visible': True, 'type': 'text'}
        ]
    },
    {
        'table': 'DirSection',
        'name': u'Разделы',
        'role_requires': 10,
        'columns': [
            {'name': 'name', 'displayName': u'Наименование', 'visible': True, 'type': 'text'},
            {'name': 'name_kg', 'displayName': u'Наименование kg', 'visible': False, 'type': 'text'},
            {'name': 'name_en', 'displayName': u'Наименование en', 'visible': False, 'type': 'text'},
        ]
    },
    {
        'table': 'DirTypesofeconomicactivity',
        'name': u'Виды экономической деятельности',
        'role_requires': 10,
        'columns': [
            {'name': 'code', 'displayName': u'Код', 'visible': True, 'type': 'text'},
            {'name': 'name', 'displayName': u'Наименование', 'visible': True, 'type': 'text'},
            {'name': 'name_kg', 'displayName': u'Наименование kg', 'visible': False, 'type': 'text'},
            {'name': 'name_en', 'displayName': u'Наименование en', 'visible': False, 'type': 'text'}
        ]
    },
    {
        'table': 'DirPosition',
        'name': u'Должности',
        'role_requires': 10,
        'columns': [
            {'name': 'name', 'displayName': u'Наименование', 'visible': True, 'type': 'text'},
            {'name': 'name_kg', 'displayName': u'Наименование kg', 'visible': False, 'type': 'text'},
            {'name': 'name_en', 'displayName': u'Наименование en', 'visible': False, 'type': 'text'},
            {'name': 'order', 'displayName': u'Порядок', 'visible': True, 'type': 'text'}
        ]
    },
    {
        'table': 'DirSubjects',
        'name': u'Тематика обращения',
        'role_requires': 10,
        'columns': [
            {'name': 'name', 'displayName': u'Наименование', 'visible': True, 'type': 'text'},
            {'name': 'name_kg', 'displayName': u'Наименование kg', 'visible': False, 'type': 'text'},
            {'name': 'name_en', 'displayName': u'Наименование en', 'visible': False, 'type': 'text'},
            {'name': 'order', 'displayName': u'Порядок', 'visible': True, 'type': 'text'}
        ]
    },
    {
        'table': 'DirDocument',
        'name': u'Виды документов',
        'role_requires': 10,
        'columns': [
            {'name': 'name', 'displayName': u'Наименование', 'visible': True, 'type': 'text'},
            {'name': 'name_kg', 'displayName': u'Наименование kg', 'visible': False, 'type': 'text'},
            {'name': 'name_en', 'displayName': u'Наименование en', 'visible': False, 'type': 'text'},
            {'name': 'data.type', 'displayName': u'Тип', 'visible': False, 'type': 'text'},
        ]
    },

    {
        'table': 'ESP',
        'name': u'Справочник по приобретению ЭП ЭЦП',
        'role_requires': 10,
        'columns': [
            {'name': 'name', 'displayName': u'Наименование', 'visible': True, 'type': 'text'},
            {'name': 'name_en', 'displayName': u'Наименование en', 'visible': True, 'type': 'text'},
            {'name': 'name_kg', 'displayName': u'Наименование kg', 'visible': True, 'type': 'text'},

        ]
    }
]


def tables_list(bag):
    ret = []
    for table in tables:
        if ('role_requires' not in table or g.user.role >= table['role_requires']) and \
                ('list_only' not in table or table['list_only'] is False):
            ret.append(table)
    return {'tables': tables}


def table_names(option):
    ret = []
    for table in tables:
        if option is not 'put' or 'list_only' not in table or table['list_only'] is False or \
                'role_requires' not in table or g.user.role >= table['role_requires']:
            ret.append(table['table'])
    return ret


@table_access(names=table_names('get'))
@chain(controller_name='data.get', output=['doc'])
def get(bag):
    pass

#
# @table_access(names=table_names('listing'))
# @chain(controller_name='data.listing', output=['docs', 'count'])
# def listing(bag):
#     pass


@table_access(names=table_names('put'))
@chain(controller_name='data.put', output=['id', 'rev'])
def save(bag):
    pass


@table_access(names=table_names('put'))
@chain(controller_name='data.delete', output=["ok", "id", "rev"])
def delete(bag):
    pass


def save_dict(bag):
    for item in bag['data']:
        item["type"] = 'DirBank'
        controller.call(controller_name='data.put', bag=item)
    return


@table_access(names=table_names('listing'))
def listing(bag):
    table_name = bag["type"]
    table = getattr(db, table_name) if hasattr(db, table_name) else None

    if table is None or not issubclass(table, (db.Base, db.CouchSync)):
        raise CbsException(TABLE_NOT_FOUND)
    query = g.tran.query(table._id).filter_by(_deleted='infinity')

    doc_vars = vars(table)
    for var in doc_vars:
        if isinstance(doc_vars[var], InstrumentedAttribute):
            query = query.add_column(doc_vars[var])

    if table == db.DirSection:
        if "local" in bag and bag["local"] is True:
            products = g.tran.query(db.Product).filter_by(_deleted='infinity')\
                .filter(db.Product.local == bag["local"]).all()
            spec_ids = []
            spec_in_ids = []
            for product in products:
                specification_ids = []
                prodspecs = g.tran.query(db.ProductSpec).filter_by(_deleted='infinity', product_id=product._id).all()
                for prodspec in prodspecs:
                    if prodspec.specification_id not in specification_ids:
                        specification_ids.append(prodspec.specification_id)
                sii = Set(spec_in_ids)
                si = Set(specification_ids)
                ds = sii.symmetric_difference(si)
                if len(ds) > 0:
                    spec_ids.extend(specification_ids)
            dirsections = g.tran.query(db.DirSection)\
                .filter_by(_deleted='infinity').all()
            dir_id = []
            for dirsection in dirsections:
                ds = Set(dirsection.dircategories_id)
                sids = Set(spec_ids)
                drs = ds.intersection(sids)
                if len(drs) > 0:
                    dir_id.append(dirsection._id)
            query = query.filter(db.DirSection._id.in_(dir_id))
        elif "local" in bag and bag["local"] is False:
            company_products = g.tran.query(db.Company_product).filter_by(_deleted='infinity', status='active').all()
            spec_ids = []
            spec_in_ids = []
            for product in company_products:
                specification_ids = []
                prodspecs = g.tran.query(db.ProductSpec)\
                    .filter_by(_deleted='infinity', product_id=product.product_id).all()
                for prodspec in prodspecs:
                    if prodspec.specification_id not in specification_ids:
                        specification_ids.append(prodspec.specification_id)
                sii = Set(spec_in_ids)
                si = Set(specification_ids)
                ds = sii.symmetric_difference(si)
                if len(ds) > 0:
                    spec_ids.extend(specification_ids)
            dirsections = g.tran.query(db.DirSection) \
                .filter_by(_deleted='infinity').all()
            dir_id = []
            for dirsection in dirsections:
                ds = Set(dirsection.dircategories_id)
                sids = Set(spec_ids)
                drs = ds.intersection(sids)
                if len(drs) > 0:
                    dir_id.append(dirsection._id)
            query = query.filter(db.DirSection._id.in_(dir_id))
    if table == db.Typeofownership:
        if 'filter' in bag and 'type_owner' in bag['filter']:
            query = query.filter(db.Typeofownership.type_owner == bag["filter"]["type_owner"])
            del bag["filter"]["type_owner"]

    if table == db.DirCountry:
        query = query.order_by(db.DirCountry.data['index'].asc())
    if "filter" in bag:
        if "data" in bag["filter"] and isinstance(bag["filter"]["data"], dict):
            query = query.filter(table.data.contains(type_coerce(bag["filter"]["data"], JSONB)))
            del bag["filter"]["data"]
        query = query.filter_by(**bag["filter"])

    if "order_by" in bag:
        query = query.order_by(*bag["order_by"])

    count = query.count()
    if "limit" in bag:
        query = query.limit(bag["limit"])
    if "offset" in bag:
        query = query.offset(bag["offset"])

    result = orm_to_json(query.all())

    return {"docs": result, "count": count}