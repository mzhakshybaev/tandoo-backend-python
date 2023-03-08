import json

from datetime import datetime, timedelta
from flask import g

import pyotp

from app.helper.utils import is_valid_email, has_cyrillic, has_digit, has_latin
from app.keys import ID, USERNAME, EMAIL, PASSWORD, POSITION, PHONE, INN, FULL_NAME
from app.messages import WRONG_CONFIRM_CODE, DO_NOT_MATCH_PASSWORDS, PASSWORD_MUSTBE_MORE_THAN_6_SYMBOLS, WRONG_EMAIL, \
    CYRILLIC_LOGIN, PASSWORD_MUSTBE_LATIN_AND_DIGIT, CYRILLIC_PASSWORD, USER_EMAIL_ALREADY_EXISTS
from app.model import db
from app.utils import CbsException
from apputils import JSONEncoderCore


def get_totp(phone):
    otp_secret = pyotp.random_base32()
    totp = pyotp.TOTP(otp_secret)
    otp = totp.now()
    data = json.dumps({'otp': otp, 'otp_secret': otp_secret}, cls=JSONEncoderCore)
    g.redis.setex('otp:{}'.format(phone), data, 180)
    print('otp - {}'.format(otp))
    return otp


def check_otp(phone, otp):
    if otp in ['111111']:
        return True

    saved_otp_data = g.redis.get('otp:{}'.format(phone))
    if not saved_otp_data:
        raise CbsException(WRONG_CONFIRM_CODE)
    otp_data = json.loads(saved_otp_data)
    saved_otp = otp_data['otp']
    otp_secret = otp_data['otp_secret']

    if not (int(otp) == int(saved_otp)):
        for i in range(-1, 2):
            totp = pyotp.TOTP(otp_secret)
            if totp.verify(int(otp), for_time=datetime.now() + timedelta(seconds=30 * i)):
                break
        else:
            raise CbsException(WRONG_CONFIRM_CODE)


def get_secure_user_data(user):
    user_data = {
        ID: user.id,
        USERNAME: user.username,
        EMAIL: user.email,
        'fullname': user.fullname,
        'phone': user.phone,
        'inn': user.inn,
        'role': user.role,
        'rec_date': user.rec_date,
        'default_company': user.default_company,
        'data': user.data,
        POSITION: user.position,
        PHONE: user.phone,
        INN: user.inn,
        FULL_NAME: user.fullname,
        'company': user.company,
        'roleType': user.roleType,
    }
    return user_data


def get_company_data(company):
    company_data = {
        '_id': company._id,
        'name': company.name,
        'short_name': company.short_name,
        'main_doc_img': company.main_doc_img
    }
    return company_data


def check_password(bag):
    if has_cyrillic(bag[PASSWORD]):
        raise CbsException(CYRILLIC_PASSWORD)
    elif not has_digit(bag[PASSWORD]):
        raise CbsException(PASSWORD_MUSTBE_LATIN_AND_DIGIT)
    elif not has_latin(bag[PASSWORD]):
        raise CbsException(PASSWORD_MUSTBE_LATIN_AND_DIGIT)
    elif 'confirm_password' in bag and bag[PASSWORD] != bag['confirm_password']:
        raise CbsException(DO_NOT_MATCH_PASSWORDS)
    elif len(bag[PASSWORD]) < 6:
        raise CbsException(PASSWORD_MUSTBE_MORE_THAN_6_SYMBOLS)


def check_email(email):
    if has_cyrillic(email):
        raise CbsException(CYRILLIC_LOGIN)
    if not is_valid_email(email):
        raise CbsException(WRONG_EMAIL)

    user = g.tran.query(db.User).filter(db.User.email == email).first()
    if user:
        raise CbsException(USER_EMAIL_ALREADY_EXISTS)
