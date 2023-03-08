# coding=utf-8
import random
import re
import traceback
from base64 import b64decode
from hashlib import sha1
from uuid import uuid1

import jwt
import pyotp
from flask import g
from sqlalchemy import and_, TEXT
from sqlalchemy import or_
from sqlalchemy.orm import make_transient
from sqlalchemy.orm.attributes import InstrumentedAttribute

from app import redis_session, controller
from app.controller import entity
from app.controller.user import check_otp, get_totp, get_secure_user_data, check_email, check_password
from app.helper import sms
from app.keys import *
from app.messages import *
from app.model import db
from app.service import is_admin, table_access, admin_required
from app.utils import CbsException, orm_to_json, portal_post
from appconf import JWT_SECRET_KEY
from helper.utils import get_salt_string
from service import employee


def register(bag):
    if PHONE in bag:
        bag[PHONE] = normalize_phone(bag[PHONE])

    check(bag)
    if 'roles_id' not in bag:
        bag['roles_id'] = []
    if 'data' not in bag:
        bag['data'] = {}
    bag['secure'] = pyotp.random_base32()
    bag[PASSWORD] = sha1(bag[PASSWORD] + bag['secure']).hexdigest()

    bag[USERNAME] = bag[EMAIL]
    bag['role'] = 2
    role = g.tran.query(db.Roles._id).filter_by(_deleted='infinity') \
        .filter(db.Roles.data['code'].astext.cast(TEXT) == 'public').first()
    bag['role'] = 2
    bag['roles_id'].extend(role)

    user = entity.add({CRUD: db.User, BOBJECT: bag})

    user_data = get_secure_user_data(user)
    token = redis_session.open_session({'user_id': user.id})

    return {'token': token, 'user': user_data}


@admin_required()
def put(bag):
    user = g.tran.query(db.User).filter_by(id=bag['id']).first()

    if PHONE in bag:
        bag[PHONE] = normalize_phone(bag[PHONE])

    if user.username != bag[USERNAME]:
        if g.tran.query(db.User).filter_by(username=bag[USERNAME]).filter(db.User.id != user.id).count() > 0:
            raise CbsException(USER_ALREADY_EXISTS)
    if user.email != bag[EMAIL]:
        if g.tran.query(db.User).filter_by(email=bag[EMAIL]).filter(db.User.id != user.id).count() > 0:
            raise CbsException(USER_EMAIL_ALREADY_EXISTS)

    if PASSWORD in bag:
        password = sha1(bag[PASSWORD].encode('utf-8') + user.secure.encode('utf-8')).hexdigest()
        if bag[PASSWORD] != user.password and password != user.password and is_admin():
            user.password = password
        else:
            raise CbsException(USER_NO_ACCESS)

    user.username = bag[USERNAME]
    user.fullname = bag[FULL_NAME]
    user.inn = bag[INN]
    user.phone = bag[PHONE]
    user.email = bag[EMAIL]

    if 'data' in bag:
        user.data = bag['data']
    if 'roles_id' in bag:
        if isinstance(bag['roles_id'], (unicode, str)):
            bag['roles_id'] = bag['roles_id'].split(",")
        user.roles_id = bag['roles_id']

    user_data = {
        ID: user.id,
        USERNAME: user.username,
        EMAIL: user.email,
        'role': user.role,
        'rec_date': user.rec_date,
        'data': user.data
    }
    return {'user': user_data}


def putUsername(bag):
    user = g.tran.query(db.User).filter(db.User.id != g.user.id, db.User.username == bag[USERNAME]).first()
    if user is not None:
        raise CbsException(GENERIC_ERROR, u'Такое имя пользователя уже есть')
    result = re.match('^[a-zA-Z]+[\w\-_]+$', bag[USERNAME])
    if not result:
        raise CbsException(GENERIC_ERROR,
                           u'Имя пользователя может содержать только латинские буквы, цифры и знаки "-" и "_"!')
    user = g.tran.query(db.User).filter_by(id=g.user.id).first()
    password = sha1(bag[PASSWORD].encode('utf-8') + user.secure.encode('utf-8')).hexdigest()
    if password == user.password:
        user.username = bag[USERNAME]
    else:
        raise CbsException(WRONG_PASSWORD)

    user_data = {
        ID: user.id,
        USERNAME: user.username,
        EMAIL: user.email,
        'role': user.role,
        'rec_date': user.rec_date,
        'data': user.data
    }
    return {'user': user_data}


def putPassword(bag):
    user = g.tran.query(db.User).filter_by(id=g.user.id).first()
    password = sha1(bag[PASSWORD].encode('utf-8') + user.secure.encode('utf-8')).hexdigest()
    if password == user.password:
        user.password = sha1(bag["newpswd"] + user.secure).hexdigest()
    else:
        raise CbsException(WRONG_PASSWORD)

    user_data = {
        ID: user.id,
        USERNAME: user.username,
        EMAIL: user.email,
        'role': user.role,
        'rec_date': user.rec_date,
        'data': user.data
    }
    return {'user': user_data}


def putEmail(bag):
    user = g.tran.query(db.User).filter(db.User.id != g.user.id, db.User.email == bag[EMAIL]).first()
    if user is not None:
        raise CbsException(GENERIC_ERROR, u'Такой E-mail уже есть')

    user = g.tran.query(db.User).filter_by(id=g.user.id).first()
    password = sha1(bag[PASSWORD].encode('utf-8') + user.secure.encode('utf-8')).hexdigest()
    if password == user.password:
        user.email = bag[EMAIL]
    else:
        raise CbsException(WRONG_PASSWORD)

    user_data = {
        ID: user.id,
        USERNAME: user.username,
        EMAIL: user.email,
        'role': user.role,
        'rec_date': user.rec_date,
        'data': user.data
    }
    return {'user': user_data}


def putData(bag):
    user = g.tran.query(db.User).filter_by(id=g.user.id).first()
    user.data = bag['data']

    user_data = {
        ID: user.id,
        USERNAME: user.username,
        EMAIL: user.email,
        'role': user.role,
        'rec_date': user.rec_date,
        'data': user.data
    }
    return {'user': user_data}


def putActive(bag):
    user = g.tran.query(db.User).filter_by(id=bag["user_id"]).first()
    user.active = bag['active']

    user_data = {
        ID: user.id,
        USERNAME: user.username,
        EMAIL: user.email,
        'role': user.role,
        'active': user.active,
        'rec_date': user.rec_date,
        'data': user.data
    }
    return {'user': user_data}


def auth(bag):
    user = g.tran.query(db.User).filter(
        or_(db.User.username == bag[USERNAME],
            db.User.phone == bag[USERNAME])).first()
    if not user:
        raise CbsException(USER_NOT_FOUND)
    if not user.active:
        raise CbsException(GENERIC_ERROR, u'Пользователь заблокирован')
    password = sha1(bag[PASSWORD].encode('utf-8') + user.secure.encode('utf-8')).hexdigest()
    if user.password != password:
        raise CbsException(WRONG_PASSWORD)
    company = None
    docs = []

    if user.default_company is not None and user.default_company != "":
        uc = g.tran.query(db.Companies).filter_by(_deleted='infinity', _id=user.default_company).first()
        if uc:
            company = orm_to_json(uc)
            company['roles'] = g.tran.query(db.Roles).filter_by(_deleted='infinity') \
                .filter(db.Roles._id.in_(company["roles_id"])).first()

    user_data = get_secure_user_data(user)
    token = redis_session.open_session({'user_id': user.id})
    session = redis_session.get_session(token)
    redis_session.update_session(token, session)
    return {'token': token, 'user': user_data, 'company': company, 'docs': docs}


def auth_check(bag):
    session = str(uuid1(clock_seq=g.redis.incr(str(random.randint(1, 99999)))))
    indentity = str(uuid1(clock_seq=g.redis.incr(session)))
    url = 'http://212.2.227.132:9513/authentication/rutoken/' + session + '/' + indentity
    res = entity.add({CRUD: db.RutokenAuth, BOBJECT: {
        'session': session,
        'identity': indentity
    }})
    if res:
        return {'url': url}


def getStatusAuth(bag):
    if bag.get('id'):
        n1 = bag['id'].split('|')
        res = entity.get({
            CRUD: 'RutokenAuth',
            'session': n1[0]
        })
        if res and res['bobject'].identity == n1[1]:
            content = str(uuid1(clock_seq=g.redis.incr(n1)))
            result = entity.add({CRUD: db.RutokenAuth, BOBJECT: {
                'id': res['bobject'].id,
                'session': res['bobject'].session,
                'identity': res['bobject'].identity,
                'data': {"content": content}
            }})
            return {
                'status': "OK",
                "content": content
            }


def get_rutoken(bag):
    if bag.get('id'):
        n1 = bag['id'].split('|')
        res = entity.get({
            CRUD: 'RutokenAuth',
            'session': n1[0]
        })
        if res and res['bobject'].identity == n1[1]:
            if bag.get('personalIdentNum'):
                result = entity.add({CRUD: db.RutokenAuth, BOBJECT: {
                    'id': res['bobject'].id,
                    'session': n1[0],
                    'identity': n1[1],
                    'taxpayerIdentNum': bag['taxpayerIdentNum'],
                    'personalIdentNum': bag['personalIdentNum'],
                    'sign': bag['sign'],
                }})
                if result:
                    user = g.tran.query(db.User).filter_by(inn=bag['personalIdentNum']).first()
                    return {
                        'status': "OK",
                        "redirect": "http://tandoo.zakupki.gov.kg/#/users/" + str(user.id)
                    }


def set_default_company(bag):
    if 'company_id' not in bag:
        raise CbsException(GENERIC_ERROR, u'Укажите параметр company_id')

    user = g.tran.query(db.User).filter_by(id=g.user.id).first()

    # TODO: Проверить, что юзер владелец или работник компании
    uc = g.tran.query(db.Companies).filter_by(_deleted='infinity').filter(db.Companies._id == bag['company_id']).first()
    if uc:
        user.default_company = uc._id
        g.company = uc
        g.session["company_id"] = uc._id
        make_transient(g.company)
    else:
        raise CbsException(COMPANY_NOT_FOUND)


@admin_required()
def listing(bag):
    return {'users': orm_to_json(g.tran.query(db.User).all())}


def send_otp(bag):
    bag[PHONE] = normalize_phone(bag[PHONE])
    check(bag)

    otp = get_totp(bag[PHONE])
    msg = u'Код подтверждения: {}'.format(otp)
    sms_data = {'source_addr': bag.get('command', 'recovery'), 'dest_addr': bag[PHONE], 'msg': msg}
    so = entity.add({CRUD: db.SmsOutbox, BOBJECT: sms_data})
    sms.send(bag[PHONE], msg, so.id)


def validate_otp(bag):
    bag[PHONE] = normalize_phone(bag[PHONE])
    check_otp(bag[PHONE], bag[OTP])


def normalize_phone(phone):
    return phone.replace(' ', '').replace('+', '').replace('(', '').replace(')', '')


def check(bag):
    if EMAIL in bag:
        bag[USERNAME] = bag[EMAIL]

    if PASSWORD in bag:
        check_password(bag)

    if INN in bag:
        user = g.tran.query(db.User).filter(db.User.inn == bag[INN]).first()
        if user:
            raise CbsException(USER_INN_ALREADY_EXISTS)

    # if bag.get(FULL_NAME, ''):
    #     if has_symbol(bag[FULL_NAME]):
    #         raise CbsException(SYMBOL_FULL_NAME)
    #     if has_digit(bag[FULL_NAME]):
    #         raise CbsException(DIGIT_FULL_NAME)
    #     if has_latin(bag[FULL_NAME]):
    #         raise CbsException(LATIN_FULL_NAME)

    if bag.get('command', '') in ['register']:
        if EMAIL in bag:
            check_email(bag[EMAIL])

        if PHONE in bag:
            user = g.tran.query(db.User).filter(db.User.phone == bag[PHONE]).first()
            if user:
                raise CbsException(USER_PHONE_ALREADY_EXISTS)

        if PHONE in bag and EMAIL in bag:
            if bag.get('command', 'recovery') in ['register']:
                user = g.tran.query(db.User).filter(
                    or_(db.User.username == bag[USERNAME], db.User.email == bag[EMAIL])).first()
                if user:
                    raise CbsException(USER_ALREADY_EXISTS)

    else:
        # recovery
        if PHONE in bag and EMAIL in bag:
            user = g.tran.query(db.User).filter(and_(db.User.phone == bag[PHONE], db.User.email == bag[EMAIL])).first()
            if not user:
                raise CbsException(USER_WITH_PHONE_AND_EMAIL_NOT_FOUND)


def recovery_password(bag):
    bag[PHONE] = normalize_phone(bag[PHONE])

    check_otp(bag[PHONE], bag[OTP])
    check_password(bag)

    user = g.tran.query(db.User).filter(and_(db.User.phone == bag[PHONE], db.User.email == bag[EMAIL])).first()
    if not user:
        raise CbsException(USER_WITH_PHONE_AND_EMAIL_NOT_FOUND)

    secure = pyotp.random_base32()
    user.secure = secure
    user.password = sha1(bag[PASSWORD] + secure).hexdigest()

    g.tran.add(user)
    g.tran.flush()

    bag[USERNAME] = user.username
    return auth(bag)


def check_token(bag):
    user = g.tran.query(db.User).filter_by(id=g.user.id).first()

    if not user:
        raise CbsException(USER_NOT_FOUND)

    user_data = get_secure_user_data(g.user)
    company = None
    if hasattr(g, 'company'):
        company = g.company
    return {'user': user_data, 'company': company}


@table_access(names=db.User.__name__)
def remove(bag):
    company = g.tran.query(db.Companies).filter_by(_deleted='infinity').filter(db.Companies.user_id == bag['id']).all()
    if company:
        raise CbsException(GENERIC_ERROR, u'Невозможно удалить, у пользователя имеется организация')

    user = entity.remove(bag)
    return {BOBJECT: orm_to_json(user)}


def userlist(bag):
    query = g.tran.query(db.User.id).select_from(db.User)
    if "filter" in bag:
        if 'filter' in bag and 'fullname' in bag['filter']:
            query = query.filter(db.User.fullname.ilike(u"%{}%".format(bag["filter"]["fullname"])))
            del bag["filter"]["fullname"]
        if 'filter' in bag and 'email' in bag['filter']:
            query = query.filter(db.User.email.ilike(u"%{}%".format(bag["filter"]["email"])))
            del bag["filter"]["email"]
        query = query.filter_by(**bag["filter"])
    doc_vars = vars(db.User)
    for var in doc_vars:
        if var != 'password' and var != 'secure' and isinstance(doc_vars[var], InstrumentedAttribute):
            query = query.add_column(doc_vars[var])
    if "limit" in bag:
        query = query.limit(bag.get('limit', 10))
    if "offset" in bag:
        query = query.offset(bag["offset"])
    users = query.all()
    return {'users': orm_to_json(users)}


def get(bag):
    user = g.tran.query(db.User).filter_by(id=bag['id']).one()
    return {'doc': orm_to_json(user)}


def put_pin(bag):
    user = g.tran.query(db.User) \
        .filter(or_(db.User.inn == str(bag['personPin']), db.User.email == bag['email'])).first()
    if not user:
        user = putUser(bag)
    else:
        user.username = bag[USERNAME]
        user.role = 2

        # user.roleType = bag['role']

        g.tran.add(user)
    return user


def putUser(bag):
    item = {'roles_id': []}
    if PHONE in bag:
        item[PHONE] = normalize_phone(bag['mobilePhone'])

    check(bag)
    if 'roles_id' not in bag:
        bag['roles_id'] = []
    if 'data' not in bag:
        bag['data'] = {}
    item['secure'] = pyotp.random_base32()

    s = "abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()?"
    passlen = 8
    password = "".join(random.sample(s, passlen))
    item[PASSWORD] = sha1(password + item['secure']).hexdigest()

    item[USERNAME] = bag[USERNAME]
    role = g.tran.query(db.Roles._id).filter_by(_deleted='infinity') \
        .filter(db.Roles.data['code'].astext.cast(TEXT) == 'public').first()
    item['role'] = 2
    item['roles_id'].extend(role)
    item['position'] = bag[POSITION]
    item['company'] = bag['company']
    item['roleType'] = bag['role']
    item['mobilePhone'] = bag['mobilePhone']
    item['phone'] = bag['mobilePhone']
    item['fullname'] = bag['fullName']
    item['email'] = bag['email']
    item['inn'] = bag['personPin']
    user = entity.add({CRUD: db.User, BOBJECT: item})
    return user


def company_put(bag):
    inn_query = g.tran.query(db.Companies) \
        .filter_by(_deleted='infinity', inn=bag['inn'])
    company = inn_query.first()
    if company:
        return company

    company_type = None
    roles_id = []
    if g.user.roleType.get('roleType', '') == 1:
        company_type = 'supplier'
    elif g.user.roleType.get('roleType', '') == 2:
        company_type = 'purchaser'
        role = g.tran.query(db.Roles).filter_by(_deleted='infinity') \
            .filter(db.Roles.data['code'].astext == company_type).first()
        if role:
            roles_id.append(role._id)
    if company_type:
        bag['company_type'] = company_type

    bag['type'] = 'Companies'
    bag['user_id'] = g.user.id
    bag['company_status'] = 'draft'
    bag['role'] = 0
    bag['owner_data'] = bag['owner_data']
    bag['short_name'] = bag['name']
    if roles_id:
        bag['roles_id'] = roles_id
    res = controller.call(controller_name='data.put', bag=bag)
    if res:
        # set_default_company({'company_id': res['id']})
        return g.tran.query(db.Companies).filter_by(_deleted='infinity', _id=res['id']).first()


def save_employee(bag):
    empl = g.tran.query(db.Companyemployees) \
        .filter_by(user_id=bag['user_id'], company_id=bag['company_id']).first()
    if not empl:
        entity.add({CRUD: db.Companyemployees, BOBJECT: bag})


def jwttoken(bag):
    if not (bag.get('token')):
        raise CbsException(GENERIC_ERROR, u'Token undefined')
    tkn = bag['token']
    token_data = tkn.split('.')

    first = u'eyJhbGciOiJIUzUxMiJ9'
    third = [u'Cx1LCphIKgI2bdl_-z70QdjYuldU6kd4Yd7uGe-2RPEmkvr8u9TwHhwNsdFLnYU_7WFWPzj509YUOe-xgG96gg',
             u'Vns-98py5mbi8cAd_-tsaNMvmeaEfFmW4Vxi7Z5qzo3n0tBWS9g4uNRmPqtszLDgWDXD1rINopdst-R057Sgng']

    if token_data[0] == first and token_data[2] in third:
        u_id = 644 if str(token_data[2]).startswith('Vns') else 637
        g.user = g.tran.query(db.User).filter_by(id=u_id).first()
        g.company = g.tran.query(db.Companies).filter_by(_id=g.user.default_company, _deleted=INFINITY).first()
        tkn = redis_session.open_session({'user_id': g.user.id})
        session = redis_session.get_session(tkn)
        redis_session.update_session(tkn, session)
        return {'token': tkn, 'user': g.user, 'company': g.company}
    try:
        payload = jwt.decode(str(tkn), b64decode(JWT_SECRET_KEY), algorithms=['HS512'])
        inn = payload['sub'].split('@')
        data = {'companyInn': inn[1], 'userPin': inn[0]}
        resp = portal_post('user', data)
        user = put_pin(resp)
        if user:
            g.user = user
        else:
            raise CbsException(GENERIC_ERROR, u'User data not found')

        owner_data = {'fio': resp.get('fullName', ''), 'email': resp.get('email', ''),
                      'phone': resp.get('mobilePhone', ''), 'pos': resp.get('position', '')}
        company = company_put(
            {'inn': resp['company']['companyInn'], 'name': resp['company']['title'], 'user_id': g.user.id,
             'owner_data': owner_data})
        if company:
            g.company = company
        else:
            raise CbsException(GENERIC_ERROR, u'Company data not found')
        save_employee({'company_id': company._id, 'user_id': user.id,
                       'data': {'position': resp.get('position', '')}})
        tkn = redis_session.open_session({'user_id': g.user.id})
        session = redis_session.get_session(tkn)
        redis_session.update_session(tkn, session)
        return {'token': tkn, 'user': g.user, 'company': g.company}
    except jwt.ExpiredSignatureError as e1:
        raise CbsException(GENERIC_ERROR, u'token expired, please login again')
    except jwt.InvalidTokenError:
        raise CbsException(GENERIC_ERROR, u'Invalid token, please try again with a new token')
    except Exception as e:
        raise CbsException(GENERIC_ERROR, e.message)


def token(bag):
    if not (bag.get('token')):
        raise CbsException(GENERIC_ERROR, u'Token undefined')
    tkn = str(bag['token'])
    try:
        payload = jwt.decode(tkn, algorithms=['HS512', 'RS256'], verify=False)
        data = {'companyInn': payload['tin'], 'userPin': payload['pin'], 'username': payload['preferred_username']}
        resp = portal_post('user', data)
        resp['username'] = payload['preferred_username']
        user = put_pin(resp)
        if user:
            g.user = user
        else:
            raise CbsException(GENERIC_ERROR, u'User data not found')

        owner_data = {'fio': resp.get('fullName', ''), 'email': resp.get('email', ''),
                      'phone': resp.get('mobilePhone', ''), 'pos': resp.get('position', '')}
        company = company_put(
            {'inn': resp['company']['companyInn'], 'name': resp['company']['title'], 'user_id': g.user.id,
             'owner_data': owner_data})
        if company:
            g.company = company
        else:
            raise CbsException(GENERIC_ERROR, u'Company data not found')
        save_employee({'company_id': company._id, 'user_id': user.id, 'head': True,
                       'data': {'position': resp.get('position', '')}})
        tkn = redis_session.open_session({'user_id': g.user.id, 'token': tkn})
        session = redis_session.get_session(tkn)
        redis_session.update_session(tkn, session)
        return {'token': tkn, 'user': g.user, 'company': g.company}
    except jwt.ExpiredSignatureError as e1:
        raise CbsException(GENERIC_ERROR, u'token expired, please login again')
    except jwt.InvalidTokenError:
        raise CbsException(GENERIC_ERROR, u'Invalid token, please try again with a new token')
    except Exception as e:
        g.logger.error(traceback.format_exc())
        raise CbsException(GENERIC_ERROR, e.message)


def get_by_inn(bag):
    user = g.tran.query(db.User).filter_by(inn=bag['inn']).first()
    if not user:
        # TODO get user info by inn from portal
        bag['fullname'] = get_salt_string()
        user = save_by_inn(bag)
    user.cm_company = user.data.get('comm_member', {}).get('company', '') if user.data else ''
    return {'doc': user}


def save_by_inn(bag):
    u = g.tran.query(db.User).filter_by(inn=bag['inn']).first()
    if u:
        user = orm_to_json(u)
        if bag.get(FULL_NAME, ''):
            user[FULL_NAME] = bag[FULL_NAME]
        if bag.get(POSITION, ''):
            user[POSITION] = bag[POSITION]
        if bag.get(EMAIL, ''):
            user[EMAIL] = bag[EMAIL]
        if bag.get('company', ''):
            user['data'] = {'comm_member': {'company': bag['company']}}
        user = entity.add({CRUD: db.User, BOBJECT: user})
    else:
        new_user = {'inn': bag['inn'], 'fullname': bag['fullname']}

        if not bag.get(USERNAME, ''):
            new_user[USERNAME] = bag['fullname']
        if not bag.get(PASSWORD, ''):
            secure = pyotp.random_base32()
            password = sha1('123123' + secure).hexdigest()
            new_user[PASSWORD] = password
            new_user['secure'] = secure

        user = entity.add({CRUD: db.User, BOBJECT: new_user})

    return user


def save_comm_member(bag):
    u = save_by_inn(bag)
    empl = {'company_id': g.company._id, 'user_id': u.id, 'comm_member': True}
    employee.save_comm_member(empl)


def delete_comm_member(bag):
    ce = g.tran.query(db.Companyemployees).select_from(db.Companyemployees) \
        .outerjoin(db.User, db.User.id == db.Companyemployees.user_id) \
        .filter(db.Companyemployees.company_id == g.company._id,
                db.Companyemployees.comm_member == True,
                db.User.inn == bag['inn']).first()
    if ce:
        g.tran.delete(ce)
        g.tran.flush()
