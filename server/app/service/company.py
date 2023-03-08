# coding=utf-8
import datetime

from flask import g
from sqlalchemy import TEXT, and_

from app import controller
from app.controller import entity
from app.keys import CRUD, BOBJECT, INFINITY
from app.messages import GENERIC_ERROR
from app.model import db
from app.service import table_access, chain
from app.utils import orm_to_json, CbsException, portal_post


@table_access(name='Companies')
@chain(controller_name='data.put', output=['id', 'rev'])
def put(bag):
    pass


@table_access(name='Companies')
@chain(controller_name='data.listing', output=['docs'])
def listing(bag):
    pass


@table_access(name='Companies')
def save(bag):
    if bag.get('company_type'):
        role_supplier = g.tran.query(db.Roles).filter_by(_deleted='infinity') \
            .filter(db.Roles.data['code'].astext.cast(TEXT) == bag['company_type']).first()
        role_supplier = orm_to_json(role_supplier)
    else:
        role_supplier = g.tran.query(db.Roles).filter_by(_deleted='infinity') \
            .filter(db.Roles.data['code'].astext.cast(TEXT) == 'supplier').first()
        role_supplier = orm_to_json(role_supplier)
    bag_company = bag['main_info']

    bag_company['type'] = 'Companies'
    bag_company['user_id'] = g.user.id
    if 'roles_id' not in bag_company:
        bag_company['roles_id'] = []
    bag_company['roles_id'].append(role_supplier['_id'])
    bag_company['role'] = 0
    bag_company["company_status"] = bag_company["company_status"] if "company_status" in bag_company else 'waiting'
    bag_company["company_type"] = role_supplier['data']['code']
    company = controller.call(controller_name='data.put', bag=bag_company)

    bag_bank = bag['bank_info']
    bag_bank['company_id'] = company['id']
    bag_bank['type'] = 'Companybank'
    bank = controller.call(controller_name='data.put', bag=bag_bank)

    bag_employee = {}
    if 'roles_id' not in bag_employee:
        bag_employee['roles_id'] = []
    if bag.get('company_type') and bag['company_type'] == 'purchaser':
        role = g.tran.query(db.Roles._id).filter_by(_deleted='infinity') \
            .filter(db.Roles.data['code'].astext.cast(TEXT) == 'purhead').first()
    else:
        role = g.tran.query(db.Roles._id).filter_by(_deleted='infinity') \
            .filter(db.Roles.data['code'].astext.cast(TEXT) == 'head').first()
    bag_employee['user_id'] = g.user.id
    bag_employee['roles_id'] = role
    bag_employee['company_id'] = company['id']
    bag_employee['head'] = True
    entity.add({CRUD: db.Companyemployees, BOBJECT: bag_employee})

    bag_prequal = bag['prequal_info']
    bag_prequal['company_id'] = company['id']
    bag_prequal['type'] = 'Companyqualification'

    # bag_prequal['data'] = {}

    if 'certificates' in bag_prequal:
        bag_prequal['data']['certificates'] = bag_prequal['certificates']
    if 'supplies' in bag_prequal:
        bag_prequal['data']['supplies'] = bag_prequal['supplies']
    if 'experiences' in bag_prequal:
        bag_prequal['data']['experiences'] = bag_prequal['experiences']
    if 'finances' in bag_prequal:
        bag_prequal['data']['finances'] = bag_prequal['finances']
    prequal = controller.call(controller_name='data.put', bag=bag_prequal)
    return


def check(bag):
    company = g.tran.query(db.Companies).filter_by(_deleted='infinity', _id=bag['id']).first()
    if company:
        company = orm_to_json(company)
        role = g.tran.query(db.Roles).filter_by(_deleted='infinity').filter(db.Roles._id.in_(bag['roles_id'])).first()
        if role and role.code == 'purchaser':
            item = {}
            emprole = g.tran.query(db.Roles._id).filter_by(_deleted='infinity') \
                .filter(db.Roles.data['code'].astext.cast(TEXT) == 'purhead').first()
            employee = g.tran.query(db.Companyemployees).filter(db.Companyemployees.company_id == bag['id']).first()
            item['company_id'] = company['_id']
            item['user_id'] = company['user_id']
            item['roles_id'] = emprole
            item['head'] = True
            item['data'] = employee.data
            item['id'] = employee.id
            entity.add({CRUD: db.Companyemployees, BOBJECT: item})

        company['type'] = 'Companies'
        company['company_status'] = bag['company_status']
        company['roles_id'] = bag['roles_id']
        company['end_date'] = (datetime.date.today() + datetime.timedelta(6 * 365 / 12)).isoformat()
        controller.call(controller_name='data.put', bag=company)


@table_access(name='Companies')
@chain(controller_name='data.delete', output=["ok", "id", "rev"])
def delete(bag):
    pass


@table_access(name='Companies')
@chain(controller_name='data.get', output=['doc'])
def get(bag):
    pass


def get_info(bag):
    company = g.tran.query(db.Companies).filter_by(_deleted='infinity', _id=bag['id']).first()
    if not company:
        raise CbsException(GENERIC_ERROR, u'Организация не найдена')

    company = orm_to_json(company)

    company['qualification'] = g.tran.query(db.Companyqualification) \
        .filter_by(_deleted='infinity', company_id=company['_id']) \
        .first()

    return {'doc': company}


def status_confirmed(bag):
    update_status(bag, ['waiting', 'rejected', 'blacklist', 'blocked', 'expired'], 'confirmed')


def status_rejected(bag):
    update_status(bag, ['waiting', 'confirmed'], 'rejected')


def status_blacklist(bag):
    update_status(bag, ['confirmed'], 'blacklist')


def status_blocked(bag):
    update_status(bag, ['confirmed'], 'blocked')


def update_status(bag, status_list, new_status):
    company = g.tran.query(db.Companies).filter_by(_deleted='infinity', _id=bag['id']).first()

    if company and company.company_status in status_list:
        company = orm_to_json(company)
        company['type'] = 'Companies'
        company['company_status'] = new_status
        if new_status == 'rejected':
            company['reason'] = bag.get('reason')
        controller.call(controller_name='data.put', bag=company)


@table_access(name='Companies')
def save_draft(bag):
    if bag.get('company_type'):
        role_supplier = g.tran.query(db.Roles).filter_by(_deleted='infinity') \
            .filter(db.Roles.data['code'].astext.cast(TEXT) == bag['company_type']).first()
        role_supplier = orm_to_json(role_supplier)
    else:
        role_supplier = g.tran.query(db.Roles).filter_by(_deleted='infinity') \
            .filter(db.Roles.data['code'].astext.cast(TEXT) == 'supplier').first()
        role_supplier = orm_to_json(role_supplier)
    bag_company = bag['main_info']

    # TODO: check company.id, company owner

    company = g.tran.query(db.Companies) \
        .filter_by(_deleted='infinity', inn=bag_company['inn'])
    if bag_company.get('_id'):
        company = company.filter(db.Companies._id != bag_company['_id'])
    company = company.first()
    if company:
        company.type = bag['Companies']
        company.name = bag['name']
        company.short_name = bag['short_name']
        company.user_id = bag['user_id']
        company.inn = bag['inn']
        company.typeofownership_id = bag['typeofownership_id']
        company.dircountry_id = bag['dircountry_id']
        company.dircoate_id = bag['dircoate_id']
        company.resident_state = bag['resident_state']
        company.typeofownership = bag['typeofownership']
        company.main_doc_img = bag['main_doc_img']
        company.main_doc_regulations = bag['main_doc_regulations']
        company.coate = bag['coate']
        company.reason = bag['reason']
        company.coate_name = bag['coate_name']
        company.owner_data = bag['owner_data']
        company.data = bag['data']
        company.company_status = 'draft'
        company = controller.call(controller_name='data.put', bag=company)
    else:
        bag_company['type'] = 'Companies'
        bag_company['user_id'] = g.user.id
        if 'roles_id' not in bag_company:
            bag_company['roles_id'] = []
        bag_company['roles_id'].append(role_supplier['_id'])
        bag_company['role'] = 0
        bag_company["company_status"] = 'draft'
        bag_company["company_type"] = role_supplier['data']['code']
        company = controller.call(controller_name='data.put', bag=bag_company)

    bag_bank = bag['bank_info']
    bag_bank['company_id'] = company['id']
    bag_bank['type'] = 'Companybank'
    bank = controller.call(controller_name='data.put', bag=bag_bank)

    bag_employee = {}
    if 'roles_id' not in bag_employee:
        bag_employee['roles_id'] = []
    if bag.get('company_type') and bag['company_type'] == 'purchaser':
        role = g.tran.query(db.Roles._id).filter_by(_deleted='infinity') \
            .filter(db.Roles.data['code'].astext.cast(TEXT) == 'purhead').first()
    else:
        role = g.tran.query(db.Roles._id).filter_by(_deleted='infinity') \
            .filter(db.Roles.data['code'].astext.cast(TEXT) == 'head').first()
    bag_employee['user_id'] = g.user.id
    bag_employee['roles_id'] = role
    bag_employee['company_id'] = company['id']
    bag_employee['head'] = True
    entity.add({CRUD: db.Companyemployees, BOBJECT: bag_employee})

    bag_prequal = bag['prequal_info']
    bag_prequal['company_id'] = company['id']
    bag_prequal['type'] = 'Companyqualification'

    bag_prequal['data'] = {}

    if 'supplies' in bag_prequal:
        bag_prequal['data']['supplies'] = bag_prequal['supplies']
    if 'experiences' in bag_prequal:
        bag_prequal['data']['experiences'] = bag_prequal['experiences']
    prequal = controller.call(controller_name='data.put', bag=bag_prequal)
    return


@table_access('Companies')
@chain(controller_name='data.deletefile', output=['ok'])
def deletefile(bag):
    pass


def get_company(bag):
    company, os, cb, dbank, cq = g.tran.query(db.Companies, db.Typeofownership, db.Companybank, db.DirBank,
                                              db.Companyqualification) \
        .outerjoin(db.Typeofownership, and_(db.Companies.typeofownership_id == db.Typeofownership._id,
                                            db.Typeofownership._deleted == INFINITY)) \
        .outerjoin(db.Companybank, and_(db.Companies._id == db.Companybank.company_id,
                                        db.Companybank._deleted == INFINITY)) \
        .outerjoin(db.DirBank, and_(db.Companybank.dirbank_id == db.DirBank._id,
                                    db.DirBank._deleted == INFINITY)) \
        .outerjoin(db.Companyqualification, and_(db.Companies._id == db.Companyqualification.company_id,
                                                 db.Companyqualification._deleted == INFINITY)) \
        .filter(db.Companies._deleted == INFINITY, db.Companies._id == bag['id']).first()
    if not company:
        raise CbsException(GENERIC_ERROR, u'Организация не найдена')

    company = orm_to_json(company)
    company['ownership'] = os
    company['company_bank'] = cb
    company['prequal'] = cq
    company['bank'] = {'_id': dbank._id, 'name': dbank.name} if dbank else {}

    return {'doc': company}


def update(bag):
    company = g.tran.query(db.Companies).filter_by(_deleted='infinity', _id=bag['id']).first()

    if company:
        company = orm_to_json(company)
        company['type'] = 'Companies'
        company['short_name'] = bag.get('short_name', '')
        controller.call(controller_name='data.put', bag=company)


def get_from_portal(bag):
    params = {'companyInn': g.company.inn, 'userPin': g.user.inn, 'username': g.user.username}
    resp = portal_post('company', data=params)
    if resp.get('bank', '') and resp['bank'].get('bik', ''):
        bank = g.tran.query(db.DirBank).filter(db.DirBank._deleted == INFINITY,
                                               db.DirBank.bik == resp['bank']['bik']).first()
        if bank:
            resp['bank']['dir_bank'] = bank
    return {'doc': resp}
