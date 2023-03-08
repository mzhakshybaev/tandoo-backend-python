# coding=utf-8
import datetime
import hashlib
import pickle

from flask import g
from sqlalchemy import or_
from sqlalchemy import type_coerce
from sqlalchemy.dialects.postgresql import JSONB

from spyne.decorator import rpc
from spyne.model.primitive import Mandatory
from spyne.service import ServiceBase
from spyne.model.complex import ComplexModel
from spyne.model.fault import Fault

from app.model import db
from . import APP_NS, RequestHeader, _on_method_call


class Policy(ComplexModel):
    __namespace__ = APP_NS

    name = Mandatory.Integer
    clientfullname = Mandatory.String
    cost = Mandatory.Decimal
    insuranceamount = Mandatory.Decimal
    insurancepremium = Mandatory.Decimal
    validfrom = Mandatory.DateTime
    validto = Mandatory.DateTime
    companyid = Mandatory.String


class PolicyManagerService(ServiceBase):
    __tns__ = APP_NS
    __in_header__ = RequestHeader

    @rpc(Mandatory.String,
         Mandatory.String,

         Mandatory.String,
         Mandatory.Decimal,
         Mandatory.Decimal,
         Mandatory.Decimal,
         Mandatory.Date,
         Mandatory.Date,
         Mandatory.String,
         Mandatory.String,
         Mandatory.String,
         Mandatory.String,
         _returns=Mandatory.AnyDict)
    def add_policy(ctx,
                   client_name,
                   client_surname,

                   name,
                   cost,
                   insurance_amount,
                   insurance_premium,
                   valid_from,
                   valid_to,
                   company_id,
                   product_code,
                   product_id,
                   currency_code):
        policy_no = product_code + str(ctx.udc.redis.incr(product_code)).zfill(5)
        policy = db.Policies()
        policy.company_id = company_id
        policy.product_id = product_id
        policy.policy_no = policy_no
        policy.client = {'name': client_name,
                         'surname': client_surname}
        issue_date = datetime.datetime.today().now()
        policy.issue_date = issue_date
        policy.insurance_amount = insurance_amount
        policy.insurance_premium = insurance_premium
        policy.data = {'valid_from': valid_from.strftime('%Y-%m-%d %H:%M'),
                       'valid_to': valid_to.strftime('%Y-%m-%d %H:%M'),
                       'status': u'Оформлен',
                       'currency_name': currency_code}
        policy.insurance_data = {'date_end': valid_from.strftime('%Y-%m-%d %H:%M'),
                                 'date_start': valid_to.strftime('%Y-%m-%d %H:%M')}

        policy._id = ctx.udc._generate_table_id(db.Policies.__name__.lower())
        policy._rev = '%d-%s' % (0, hashlib.md5(pickle.dumps(policy_no)).hexdigest())

        policy.user_id = 1  # only while testing
        ctx.udc.session.add(policy)
        ctx.udc.session.flush()
        return {'name': name,
                'client_name': client_name,
                'client_surname': client_surname,

                'cost': cost,
                'policy_no': policy_no,
                'issue_date': issue_date,
                'insurance_amount': insurance_amount,
                'insurance_premium': insurance_premium,
                'valid_from': valid_from,
                'valid_to': valid_to,
                'company_id': company_id,
                'product_code': product_code,
                'product_id': product_id,
                'currency_code': currency_code}


class PolicyManagerServiceTest(ServiceBase):
    __tns__ = APP_NS
    __in_header__ = RequestHeader

    @rpc(Mandatory.String,
         Mandatory.String,

         Mandatory.String,
         Mandatory.Decimal,
         Mandatory.Decimal,
         Mandatory.Decimal,
         Mandatory.Date,
         Mandatory.Date,
         Mandatory.String,
         Mandatory.String,
         Mandatory.String,
         Mandatory.String,
         _returns=Mandatory.AnyDict)
    def add_policy_test(ctx,
                       client_name,
                       client_surname,

                       name,
                       cost,
                       insurance_amount,
                       insurance_premium,
                       valid_from,
                       valid_to,
                       company_id,
                       product_code,
                       product_id,
                       currency_code):
        policy_no = product_code + str(ctx.udc.redis.incr(product_code)).zfill(5)
        issue_date = datetime.datetime.today().now()
        return {'name': name,
                'client_name': client_name,
                'client_surname': client_surname,

                'cost': cost,
                'policy_no': policy_no,
                'issue_date': issue_date,
                'insurance_amount': insurance_amount,
                'insurance_premium': insurance_premium,
                'valid_from': valid_from,
                'valid_to': valid_to,
                'company_id': company_id,
                'product_code': product_code,
                'product_id': product_id,
                'currency_code': currency_code}

PolicyManagerService.event_manager.add_listener('method_call', _on_method_call)
PolicyManagerServiceTest.event_manager.add_listener('method_call', _on_method_call)

services = [
    PolicyManagerService,
    PolicyManagerServiceTest
]



