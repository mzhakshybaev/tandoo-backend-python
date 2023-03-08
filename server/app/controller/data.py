# coding=utf-8
import datetime
import os
import re
from sets import Set

from flask import g
from sqlalchemy import func
from sqlalchemy import or_, and_, type_coerce
from sqlalchemy import text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm.attributes import InstrumentedAttribute
from run import app
from app.controller import entity
from app.keys import ID, CRUD, BOBJECT
from app.messages import TABLE_NOT_FOUND, USER_NO_ACCESS, COMPANY_NOT_FOUND, KEY_ERROR, MESSAGE, GENERIC_ERROR
from app.model import db
# from app.service import is_admin, doc
from app.service import is_admin
from app.storage import PostgresDatabase
from app.utils import orm_to_json, CbsException
from messages import GENERIC_ERROR


def put(bag):
    data = {
        "type": bag["type"]
    }
    del bag["type"]
    if '_created' in bag:
        del bag["_created"]
    if '_deleted' in bag:
        del bag["_deleted"]

    table_name = data["type"]
    table = getattr(db, table_name)

    if table is None or not issubclass(table, (db.Base, db.CouchSync)):
        raise CbsException(TABLE_NOT_FOUND)

    for key in bag:
        data[key] = bag[key]
    # del_columns(data)

    for column in table.metadata.tables.get(table_name.lower()).columns._data:
        nullable = table.metadata.tables.get(table_name.lower()).columns._data[column].nullable
        if not nullable and not column.startswith("_") and not column == "entry_user_id" and column not in data:
            raise CbsException(KEY_ERROR, MESSAGE.get(KEY_ERROR).format(column))
        elif not column.startswith("_") and not column == "entry_user_id" and column not in data:
            data[column] = None

    pg_db = PostgresDatabase()
    _id, _rev = pg_db.store(data, new_edits=True)
    return {"ok": True, "id": _id, "rev": _rev}


def delete(bag):
    if 'company_id' in g.session and not is_admin():
        bag['company_id'] = g.session['company_id']

    # if not is_admin() and "company_id" not in bag:
    #     raise CbsException(USER_NO_ACCESS)

    table_name = bag["type"]
    table = getattr(db, table_name)

    if table is None or not issubclass(table, (db.Base, db.CouchSync)):
        raise CbsException(TABLE_NOT_FOUND)

    if not is_admin():
        item_query = g.tran.query(table).filter_by(_deleted="infinity", _id=bag["_id"])
        if table == db.Companies:
            item_query = item_query.filter(table._id == bag["company_id"], table.user_id == g.user.id)
            if issubclass(table, db.CompanySync):
                item_query = item_query.filter(table.company_id == bag["company_id"])
        elif table == db.Companyemployees:
            item_query = item_query.filter(table.user_id == bag["user_id"])
            if issubclass(table, db.CompanySync):
                item_query = item_query.filter(table.company_id == bag["company_id"])
        else:
            item_query = item_query.first()
            if item_query is None:
                raise CbsException(USER_NO_ACCESS)

    pg_db = PostgresDatabase()
    _id, _rev = pg_db.remove(bag["_id"], bag["_rev"])
    return {"ok": True, "id": _id, "rev": _rev}


def deletefile(bag):
    table_name = bag['type']
    table = getattr(db, table_name) if hasattr(db, table_name) else None
    query = g.tran.query(table).filter_by(_id=u"{}".format(bag['id']))
    query.update({"_deleted": str(datetime.datetime.now())})
    doc = query.one()
    files = doc.data["files"]
    for f in files:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], f["filename"])
        os.remove(file_path)
    return {'ok': True}


def get(bag):
    table_name = bag['type']
    table = getattr(db, table_name) if hasattr(db, table_name) else None
    if table is None or not issubclass(table, (db.Base, db.CouchSync)):
        raise CbsException(TABLE_NOT_FOUND)
    query = g.tran.query(table).filter_by(_deleted='infinity')
    if '_id' in bag:
        query = query.filter_by(_id=bag['_id'])
    if table == db.Companyqualification:
        if 'company_id' in bag:
            query = query.filter(db.Companyqualification.company_id == bag['company_id'])
    ent = query.first()
    if not ent:
        return {'doc': {}}
    entity = orm_to_json(ent)
    if "with_related" in bag and bag["with_related"] is True:
        entity = find_relations(entity, table_name)
    return {'doc': entity}


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

    if table == db.Menus:
        menus = []
        if hasattr(g, 'user'):
            if g.user.role == 10:
                if 'all' in bag:
                    menus = g.tran.query(db.Menus).filter_by(_deleted='infinity').all()
                else:
                    menus = g.tran.query(db.Menus).filter_by(_deleted='infinity') \
                        .filter(and_(db.Menus.role == 10, db.Menus.active)).all()
                return {"docs": menus, "count": len(menus)}
            if g.user.role < 10 and g.user.role != 1:
                menus_id = []
                roles = g.tran.query(db.Roles).filter_by(_deleted='infinity') \
                    .filter(db.Roles.roletype == g.user.roleType['roleType']).all()
                if roles:
                    for role in roles:
                        menus_id.extend(role.menus_id)
                    menus = g.tran.query(db.Menus).filter_by(_deleted='infinity') \
                        .filter(and_(db.Menus._id.in_(menus_id), db.Menus.active)).all()
                    return {"docs": menus, "count": len(menus)}
            elif g.user.role == 1:
                menus_id = []
                roles = g.tran.query(db.Roles).filter_by(_deleted='infinity') \
                    .filter(db.Roles._id.in_(g.user.roles_id if g.user.roles_id is not None else [])).all()
                if roles:
                    for role in roles:
                        menus_id.extend(role.menus_id)
                    menus = g.tran.query(db.Menus).filter_by(_deleted='infinity') \
                        .filter(and_(db.Menus._id.in_(menus_id), db.Menus.active)).all()
                    return {"docs": menus, "count": len(menus)}
        else:
            menus = g.tran.query(db.Menus).filter_by(_deleted='infinity') \
                .filter(and_(db.Menus.role == 0, db.Menus.active)).all()
        return {"docs": menus, "count": len(menus)}
    if table == db.Companies:
        if hasattr(g, 'user') and g.user.role != 1 and g.user.role != 10:
            comps_id = []
            user_empl = g.tran.query(db.Companyemployees).filter(db.Companyemployees.user_id == g.user.id).all()
            if user_empl:
                for uc in user_empl:
                    comps_id.append(uc.company_id)
            user_company = g.tran.query(db.Companies).filter_by(_deleted='infinity', user_id=g.user.id).all()
            if user_company:
                for co in user_company:
                    comps_id.append(co._id)
            query = query.filter(db.Companies._id.in_(comps_id))
        if 'current' in bag and bag['current'] is True and hasattr(g, 'company'):
            query = query.filter(db.Companies._id == g.company._id)
        if g.client != '1':
            query = query.filter(db.Companies.company_type == 'supplier')
    if table == db.Company_product:
        if hasattr(g, 'company'):
            query = query.filter(db.Company_product.company_id == g.company._id)

    if table == db.Companybank:
        if hasattr(g, 'company'):
            query = query.filter(db.Companybank.company_id == g.company._id)
    if table == db.Companyqualification:
        if hasattr(g, 'company'):
            query = query.filter(db.Companyqualification.company_id == g.company._id)
    if table == db.Companydocument:
        if hasattr(g, 'company'):
            query = query.filter(db.Companydocument.company_id == g.company._id)
    if table == db.DirSection:
        if "local" in bag and bag["local"] is True:
            products = g.tran.query(db.Product).filter_by(_deleted='infinity') \
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
        elif "local" in bag and bag["local"] is False:
            company_products = g.tran.query(db.Company_product).filter_by(_deleted='infinity', status='active').all()
            spec_ids = []
            spec_in_ids = []
            for product in company_products:
                specification_ids = []
                prodspecs = g.tran.query(db.ProductSpec) \
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

    if "with_roles" in bag and bag["with_roles"] is True:
        if table == db.Companies:
            roles = g.tran.query(func.json_build_object(
                "id", db.Roles._id, "name", db.Roles.name, "data", db.Roles.data)).select_from(db.Roles) \
                .filter_by(_deleted='infinity') \
                .filter(type_coerce(db.Companies.roles_id, JSONB)
                        .contains(type_coerce(func.jsonb_build_array(db.Roles._id), JSONB))).as_scalar().label(
                'roles')

            query = query.add_columns(roles)
    if "with_related" in bag and bag["with_related"] is True:
        if table == db.Companies:
            companybank = g.tran.query(func.jsonb_agg(func.row_to_json(text('companybank.*')))) \
                .select_from(db.Companybank) \
                .filter_by(_deleted='infinity').filter(db.Companybank.company_id == db.Companies._id).as_scalar() \
                .label('companybank')

            companuqualifications = g.tran.query(func.jsonb_agg(func.row_to_json(text('companyqualification.*')))) \
                .select_from(db.Companyqualification) \
                .filter_by(_deleted='infinity').filter(
                db.Companyqualification.company_id == db.Companies._id).as_scalar() \
                .label('companuqualifications')

            roles = g.tran.query(func.json_build_object(
                "id", db.Roles._id, "name", db.Roles.name)).select_from(db.Roles) \
                .filter_by(_deleted='infinity') \
                .filter(type_coerce(db.Companies.roles_id, JSONB)
                        .contains(type_coerce(func.jsonb_build_array(db.Roles._id), JSONB))).as_scalar().label(
                'roles')

            query = query.add_columns(companybank, companuqualifications, roles)
        elif table == db.Message:

            comment = g.tran.query(func.jsonb_agg(func.row_to_json(text('comments.*')))) \
                .select_from(db.Comments) \
                .filter_by(_deleted='infinity').filter(db.Comments.message_id == db.Message._id).as_scalar() \
                .label('comment')

            query = query.add_columns(comment)
        elif table == db.Companyemployees:
            user = g.tran.query(func.json_build_object(
                "id", db.User.id, "fullname", db.User.username, "email", db.User.email, "rec_date", db.User.rec_date,
                "data", db.User.data, "role", db.User.role)).select_from(db.User) \
                .filter_by(id=db.Companyemployees.user_id) \
                .as_scalar().label('user')

            company = g.tran.query(func.json_build_object(
                "id", db.Companies._id, "name", db.Companies.name, "inn", db.Companies.inn)).select_from(db.Companies) \
                .filter_by(_deleted='infinity', _id=db.Companyemployees.company_id).as_scalar().label('company')

            roles = g.tran.query(func.json_build_object(
                "id", db.DirPosition._id, "name", db.DirPosition.name)).select_from(db.DirPosition) \
                .filter_by(_deleted='infinity') \
                .filter(type_coerce(db.Companyemployees.roles_id, JSONB)
                        .contains(type_coerce(func.jsonb_build_array(db.DirPosition._id), JSONB))).as_scalar().label(
                'roles')

            query = query.add_columns(user, company, roles)

    result = orm_to_json(query.all())
    if "with_related" in bag and bag["with_related"] is True:
        result = find_relations(result, table_name)

    if table == db.Companies:
        for r in result:
            if 'inn' in r and r['inn'] in ['00609201310130', '01209201710029']:
                r['_created'] = '2020-07-13 00:00:00'
                r['end_date'] = '2021-01-13 00:00:00'
            elif 'inn' in r and r['inn'] in ['02301201710287', '02202201310102', '01207201610238']:
                r['_created'] = '2020-07-22 00:00:00'
                r['end_date'] = '2021-01-22 00:00:00'
    return {"docs": result, "count": count, "current_date": datetime.datetime.today()}


def find_relations(row, related_table_name):
    if not isinstance(row, dict) and not isinstance(row, list):
        return row
    if isinstance(row, list):
        rel_column = []
        for r in row:
            rel_column.append(find_relations(r, related_table_name))
        return rel_column
    rel_column = {}
    if '_deleted' in row:
        del row['_deleted']
    for column in row:
        if re.match("[\w_]+_id", column) and (isinstance(row[column], basestring) or isinstance(row[column], int)):
            rel_table_name = ""
            up = True
            for char in column[:-3]:
                if up:
                    rel_table_name += char.upper()
                    up = False
                elif char != "_":
                    rel_table_name += char
                if char == "_":
                    up = True
            if rel_table_name == "Parent":
                related_table = getattr(db, related_table_name) if hasattr(db, related_table_name) else None
            else:
                related_table = getattr(db, rel_table_name) if hasattr(db, rel_table_name) else None
                if related_table is None:
                    rel_table_name_copy = rel_table_name[:-1] + 'ies' if \
                        rel_table_name.endswith('y') else rel_table_name + 'es'
                    related_table = getattr(db, rel_table_name_copy) if hasattr(db, rel_table_name_copy) else None
                if related_table is None:
                    rel_table_name_copy = rel_table_name + 's'
                    related_table = getattr(db, rel_table_name_copy) if hasattr(db, rel_table_name_copy) else None
            if related_table is not None:
                if issubclass(related_table, db.CouchSync):
                    rel_table_data = g.tran.query(related_table).filter_by(_deleted='infinity', _id=row[column])
                    if issubclass(related_table, db.CompanySync):
                        if not is_admin():
                            if g.company.company_type == 'agent':
                                insurance_company = g.tran.query(db.Companies).filter_by(_deleted='infinity') \
                                    .filter(
                                    db.Companies.agents_id.contains(type_coerce([g.company._id], JSONB))).first()
                                # .filter(db.Companies.agent
                                #         .contains(type_coerce({'agents_id': [g.company._id]}, JSONB))).first()

                                rel_table_data = rel_table_data.filter(or_(
                                    related_table.company_id == insurance_company._id,
                                    related_table.company_id == g.company._id
                                ))
                            else:
                                rel_table_data = rel_table_data.filter_by(company_id=g.company._id)

                    rel_table_data = rel_table_data.first()
                else:
                    rel_table_data = g.tran.query(related_table).filter_by(id=row[column])
                    if related_table == db.User and not is_admin():
                        # TODO implement filter for user of company
                        pass
                    rel_table_data = rel_table_data.first()
                if rel_table_data is not None:
                    rel_table_data = orm_to_json(rel_table_data)
                    if issubclass(related_table, db.CouchSync):
                        del rel_table_data["_deleted"]
                    if 'password' in rel_table_data:
                        del rel_table_data['password']
                    if 'secure' in rel_table_data:
                        del rel_table_data['secure']
                    rel_column[column[:-3]] = rel_table_data
            rel_column[column] = row[column]
        elif isinstance(row[column], dict) or isinstance(row[column], list):
            if isinstance(row[column], list) and re.match("[\w_]+_id", column):
                rel_table_name = ""
                up = True
                for char in column[:-3]:
                    if up:
                        rel_table_name += char.upper()
                        up = False
                    elif char != "_":
                        rel_table_name += char
                    if char == "_":
                        up = True
                related_table = getattr(db, rel_table_name) if hasattr(db, rel_table_name) else None
                if related_table is not None:
                    rel_table_data = g.tran.query(related_table)
                    if issubclass(related_table, db.CouchSync):
                        rel_table_data = rel_table_data.filter_by(_deleted='infinity') \
                            .filter(related_table._id.in_(row[column]))
                        if issubclass(related_table, db.CompanySync):
                            if not is_admin():
                                if g.company.company_type == 'agent':
                                    insurance_company = g.tran.query(db.Companies).filter_by(_deleted='infinity') \
                                        .filter(db.Companies.agent
                                                .contains(type_coerce({'agents_id': [g.company._id]}, JSONB))).first()
                                    rel_table_data = rel_table_data.filter(or_(
                                        related_table.company_id == insurance_company._id,
                                        related_table.company_id == g.company._id
                                    ))
                                else:
                                    rel_table_data = rel_table_data.filter_by(company_id=g.company._id)
                    else:
                        rel_table_data = rel_table_data.filter(related_table.id.in_(row[column]))
                        if related_table == db.User and not is_admin():
                            # TODO implement filter for user of company
                            pass
                    rel_table_data = orm_to_json(rel_table_data.all())
                    for rel_table_data_item in rel_table_data:
                        if issubclass(related_table, db.CouchSync):
                            del rel_table_data_item["_deleted"]
                        if 'password' in rel_table_data_item:
                            del rel_table_data_item['password']
                        if 'secure' in rel_table_data_item:
                            del rel_table_data_item['secure']
                    rel_column[column[:-3]] = rel_table_data
            rel_column[column] = find_relations(row[column], related_table_name)
        else:
            if isinstance(row[column], basestring):
                rel_enum = g.tran.query(db.Enums).filter_by(name=column) \
                    .filter(db.Enums.data.contains(type_coerce({"key": row[column]}, JSONB))).first()
                if rel_enum is not None:
                    rel_column[str.format('{}_value', column)] = rel_enum.data['name']
            rel_column[column] = row[column]
    return rel_column


def del_columns(data):
    cols_to_del = []
    for key in data:
        for key1 in data:
            if key[:-3] == key1 or u'{}_value'.format(key) == key1:
                cols_to_del.append(key1)
    for col_to_del in cols_to_del:
        del data[col_to_del]
    for key in data:
        if isinstance(data[key], dict):
            del_columns(data[key])
