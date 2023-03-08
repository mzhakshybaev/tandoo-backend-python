import datetime
import decimal
import json
import re
from copy import copy

from dateutil import parser
from flask import Response
from sqlalchemy import Date
from sqlalchemy.engine import RowProxy
from sqlalchemy.ext.declarative.api import DeclarativeMeta

import messages

__author__ = 'Jaynakus'


class JSONEncoderCore(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime.datetime):
            r = str(o)[:19]
            return r
        elif isinstance(o, datetime.date):
            return str(o)
        elif isinstance(o, datetime.time):
            r = str(o)
            return r
        elif isinstance(o, decimal.Decimal):
            return str(o)
        elif isinstance(o, datetime.timedelta):
            return o.total_seconds()
        elif isinstance(o.__class__, DeclarativeMeta):
            return orm_to_json(o)
        elif isinstance(o, RowProxy):
            return dict(o)
        else:
            return super(JSONEncoderCore, self).default(o)


def make_json_response(p_content):
    if not p_content:
        p_content = {}
    if isinstance(p_content, list):
        p_content = {'data': p_content}
    if 'result' not in p_content:
        p_content.update({'result': 0})
    return Response(json.dumps(p_content, cls=JSONEncoderCore), mimetype='application/json; charset=utf-8')


class AppException(Exception):
    def __init__(self, code, message=''):
        super(AppException, self).__init__()
        self.code = code
        if not message:
            message = messages.MESSAGE.get(code, message)
        self.message = message


def json_to_orm(json_, orm):
    """
    Merge in items in the values dict into our object if it's one of our columns
    """
    if hasattr(orm, '__table__'):
        for c in orm.__table__.columns:
            if c.name in json_:
                if isinstance(c.type, Date):
                    setattr(orm, c.name, parser.parse(json_[c.name]))
                else:
                    setattr(orm, c.name, json_[c.name])
    else:
        for c in orm._asdict().keys():
            if c in json_:
                setattr(orm, c, json_[c])


def orm_to_json(orm):
    if isinstance(orm, dict):
        return orm
    if isinstance(orm, list):
        ret = []
        for o in orm:
            d = copy(o.__dict__)
            d.pop('_sa_instance_state', None)
            ret.append(d)
        return ret
    else:
        d = copy(orm.__dict__)
        d.pop('_sa_instance_state', None)
        return d


def isMobileNumber(p_phonenumber):
    def _nineCharsIsNumber(p_value):
        result = re.search("^[0-9]{9,9}$", p_value)

        if result is not None:
            return True
        else:
            return False

    try:
        operator_codes = ['70', '77', '55', '54', '57', '51', '20']
        phonenumber2str = str(p_phonenumber)

        if _nineCharsIsNumber(phonenumber2str):
            return True if phonenumber2str[0:2] in operator_codes else False
        elif phonenumber2str[0:5] == '00996':
            if _nineCharsIsNumber(phonenumber2str[5:]):
                return True if phonenumber2str[5:7] in operator_codes else False
            else:
                return False
        elif phonenumber2str[0] == '0':
            if _nineCharsIsNumber(phonenumber2str[1:]):
                return True if phonenumber2str[1:3] in operator_codes else False
            else:
                return False
        elif phonenumber2str[0:4] == '+996':
            if _nineCharsIsNumber(phonenumber2str[4:]):
                return True if phonenumber2str[4:6] in operator_codes else False
            else:
                return False
        elif phonenumber2str[0:3] == '996':
            if _nineCharsIsNumber(phonenumber2str[3:]):
                return True if phonenumber2str[3:5] in operator_codes else False
            else:
                return False
        else:
            return False
    except:
        return False


def getCorrectMobileNumber(p_phonenumber, country_code=True):
    try:
        str_number = str(p_phonenumber)
    except:
        return p_phonenumber

    if isMobileNumber(str_number):
        if str_number[0:5] == '00996':
            if country_code:
                return str_number[2:]
            else:
                return str_number[5:]
        elif str_number[0] == '0':
            if country_code:
                return '996' + str_number[1:]
            else:
                return str_number[1:]
        elif str_number[0:4] == '+996':
            if country_code:
                return str_number[1:]
            else:
                return str_number[4:]
        elif str_number[0:3] == '996':
            if country_code:
                return str_number
            else:
                return str_number[3:]
        else:
            if country_code:
                return '996' + str_number
            else:
                return str_number
    else:
        raise AppException(messages.WRONG_PHONE)
