# coding=utf-8
from datetime import datetime
from functools import update_wrapper

from flask import g, request
from sqlalchemy.ext.declarative import DeclarativeMeta

from app import controller
from app.messages import USER_NOT_AUTHORIZED, USER_NO_ACCESS, ACCESS_RESTRICTED, API_NOT_ACTIVE, COMPANY_NOT_FOUND
from app.model import db
from app.utils import CbsException, orm_to_json
from messages import GENERIC_ERROR


def chain(service_name='', controller_name='', output=None):
    def decorator(fn):
        def wrapper_function(bag):
            if not bag:
                return
            if service_name:
                bag.update(call(service_name, bag))
            elif controller_name:
                bag.update(controller.call(controller_name, bag))
            if not output:
                return fn(bag)
            res = fn(bag)
            if res is dict:
                bag.update(res)
            ret = {}
            for k in output:
                ret[k] = bag[k]
            return ret

        return update_wrapper(wrapper_function, fn)

    return decorator


def table_access(name='', names=None):
    def decorator(fn):
        def wrapper_function(bag):
            if not bag:
                return fn(bag)
            if name:
                bag['type'] = name
            if names:
                assert bag['type'] in names
            return fn(bag)

        return update_wrapper(wrapper_function, fn)

    return decorator


def auth_required():
    def decorator(fn):
        def wrapped_function(*args, **kwargs):
            # Only for not authenticated users.
            if hasattr(g, 'batch') or hasattr(g, 'user') or request.path in ['/user/auth',
                                                                             '/user/token',
                                                                             '/user/jwttoken',
                                                                             '/user/register',
                                                                             '/user/auth_check',
                                                                             '/user/get_rutoken',
                                                                             '/user/getStatusAuth',
                                                                             '/user/send_otp',
                                                                             '/user/validate_otp',
                                                                             '/user/recovery_password',
                                                                             '/user/checklog',
                                                                             '/user/check',
                                                                             '/catalog/listing',
                                                                             '/specification/speclist',
                                                                             '/currencynbkr/get_nbkr_rate',
                                                                             '/menu/listing',
                                                                             '/category/listing',
                                                                             '/category/childlist',
                                                                             '/company.listing',
                                                                             '/dictionary/listing',
                                                                             '/announce/getAll',
                                                                             '/announce/get',
                                                                             '/purchasercatalog/listing',
                                                                             '/new/mainlisting',
                                                                             '/new/get',
                                                                             '/docs.delete',
                                                                             '/esp/find',
                                                                             '/dirbranch/listing',
                                                                             '/dictionary.listing',
                                                                             '/product/get',
                                                                             '/product/get_local']:
                return fn(*args, **kwargs)
            raise CbsException(USER_NOT_AUTHORIZED)

        return update_wrapper(wrapped_function, fn)

    return decorator


def admin_required():
    def decorator(fn):
        def wrapped_function(*args, **kwargs):
            # Only for not authenticated users.
            if not hasattr(g, 'user') or not g.user:
                raise CbsException(USER_NOT_AUTHORIZED)
            if g.user.role < 10:
                raise CbsException(USER_NO_ACCESS)
            return fn(*args, **kwargs)

        return update_wrapper(wrapped_function, fn)

    return decorator


def is_admin():
    return g.user.role >= 10


def is_operator():
    return g.user.role == 1


def is_company():
    def decorator(fn):
        def wrapped_function(*args, **kwargs):
            if not hasattr(g, 'company'):
                raise CbsException(GENERIC_ERROR,
                                   u'У вас не выбрана организация')
            return fn(*args, **kwargs)

        return update_wrapper(wrapped_function, fn)

    return decorator


def is_purchaser():
    def decorator(fn):
        def wrapped_function(*args, **kwargs):
            if not hasattr(g, 'company') and g.company.company_type == 'purchaser':
                raise CbsException(GENERIC_ERROR,
                                   u'Ваша организация не является закупщиком!')
            return fn(*args, **kwargs)

        return update_wrapper(wrapped_function, fn)

    return decorator


def is_supplier():
    def decorator(fn):
        def wrapped_function(*args, **kwargs):
            if not hasattr(g, 'company') and g.company.company_type == 'supplier':
                raise CbsException(GENERIC_ERROR,
                                   u'Ваша организация не является поставщиком!')
            return fn(*args, **kwargs)

        return update_wrapper(wrapped_function, fn)

    return decorator


@auth_required()
def call(service_name, bag):
    if hasattr(service_name, '__call__'):
        return service_name(bag)
    module = service_name.split('.')
    m = __import__('service.' + module[0])
    m = getattr(m, module[0])
    m = getattr(m, module[1])
    resp = m(bag)

    return resp
