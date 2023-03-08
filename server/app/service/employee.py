# coding=utf-8
from flask import g
from sqlalchemy import type_coerce, func, or_, and_
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm.attributes import InstrumentedAttribute

from app.controller import entity
from app.keys import CRUD, BOBJECT, ID
from app.messages import GENERIC_ERROR
from app.model import db
from app.service import table_access, chain
from app.utils import CbsException, orm_to_json


def userlist(bag):
    query = g.tran.query(db.User.id).select_from(db.User)
    if "filter" in bag:
        if bag['filter'].get('search', ''):
            query = query.filter(or_(db.User.fullname.ilike(u"%{}%".format(bag["filter"]["search"])),
                                     db.User.email.ilike(u"%{}%".format(bag["filter"]["search"]))))
            del bag["filter"]["search"]
        query = query.filter_by(**bag["filter"])
    doc_vars = vars(db.User)
    for var in doc_vars:
        if var != 'password' and var != 'secure' and isinstance(doc_vars[var], InstrumentedAttribute):
            query = query.add_column(doc_vars[var])
    if "limit" in bag:
        query = query.limit(bag.get('limit', 10))
    if "offset" in bag:
        query = query.offset(bag["offset"])
    users = []
    for u in query.all():
        usr = orm_to_json(u)
        usr['info'] = u'{} {}'.format(u.fullname, u.email)
        users.append(usr)

    return {'users': users}


def get(bag):
    report = entity.get(bag)
    return {'doc': orm_to_json(report)}


def save(bag):
    employee = g.tran.query(db.Companyemployees) \
        .filter(and_(db.Companyemployees.company_id == g.company._id,
                     db.Companyemployees.user_id == bag['user_id'])).first()
    if employee:
        raise CbsException(GENERIC_ERROR, u'Этот сотрудник уже есть в списке')
    entity.add({CRUD: db.Companyemployees, BOBJECT: bag})
    user = g.tran.query(db.User).filter(db.User.id == bag['user_id']).first()
    if user.default_company == '' or user.default_company is None:
        user.default_company = g.company._id
        g.tran.add(user)
        g.tran.flush()
    return


def delete(bag):
    employee = g.tran.query(db.Companyemployees) \
        .filter(db.Companyemployees.company_id == g.company._id,
                db.Companyemployees.user_id == bag['user_id']).first()
    employee = orm_to_json(employee)
    if employee['head']:
        raise CbsException(GENERIC_ERROR, u'Вы не можете удалить руководителя')
    user = g.tran.query(db.User).filter(db.User.id == employee['user_id']).first()
    if user.default_company == employee['company_id']:
        user.default_company = ''
        g.tran.add(user)
        g.tran.flush()
    entity.remove({CRUD: db.Companyemployees, ID: bag['id']})

    return


def listing(bag):
    query = g.tran.query(db.Companyemployees, db.User).select_from(db.Companyemployees) \
        .outerjoin(db.User, db.User.id == db.Companyemployees.user_id) \
        .filter(db.Companyemployees.company_id == g.company._id)
    # doc_vars = vars(db.Companyemployees)
    # for var in doc_vars:
    #     if isinstance(doc_vars[var], InstrumentedAttribute):
    #         query = query.add_column(doc_vars[var])
    if 'filter' in bag and bag['filter']:
        if 'data' in bag['filter'] and bag['filter']['data']:
            query = query.filter(db.Companyemployees.data.contains(type_coerce(bag['filter']['data'], JSONB)))
            del bag['filter']['data']
            query = query.filter_by(**bag['filter'])
    # count = query.count()
    if 'order' in bag and bag['order']:
        query = query.order_by(*bag['order'])
    if bag.get('page', ''):
        query = query.offset(int(bag.get('limit', 10)) * (int(bag['page']) - 1))
    if bag.get('limit', ''):
        query = query.limit(int(bag.get('limit', 5)))
    employees = []
    for emp, u in query.all():
        e = {
            "id": emp.id,
            "fullname": u.fullname,
            "inn": u.inn,
            'position': emp.data.get('position', '')
        }
        employees.append(e)
        # roles = g.tran.query(db.Roles).filter_by(_deleted='infinity')\
        #     .filter(db.Roles._id == item['roles_id']).first()
        # item['roles'] = {
        #     "_id": roles._id,
        #     "_rev": roles._rev,
        #     "name": roles.name,
        # }
    return {'docs': employees, 'count': len(employees)}


def save_comm_member(bag):
    employee = g.tran.query(db.Companyemployees) \
        .filter(db.Companyemployees.company_id == g.company._id,
                db.Companyemployees.comm_member == True,
                db.Companyemployees.user_id == bag['user_id']).first()
    if not employee:
        employee = entity.add({CRUD: db.Companyemployees, BOBJECT: bag})
    return employee


def all_comm_member(bag):
    sql = g.tran.query(db.Companyemployees, db.User).select_from(db.Companyemployees) \
        .outerjoin(db.User, db.User.id == db.Companyemployees.user_id) \
        .filter(db.Companyemployees.company_id == g.company._id,
                db.Companyemployees.comm_member == True)

    comm_members = []
    for e, u in sql.all():
        u.cm_company = u.data.get('comm_member', {}).get('company', '') if u.data else ''
        comm_members.append(u)

    return {'docs': comm_members}
