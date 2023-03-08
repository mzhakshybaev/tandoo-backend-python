#!/usr/bin/env python
# encoding: utf8
#
# Copyright © Burak Arslan <burak at arskom dot com dot tr>,
#             Arskom Ltd. http://www.arskom.com.tr
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
#    1. Redistributions of source code must retain the above copyright notice,
#       this list of conditions and the following disclaimer.
#    2. Redistributions in binary form must reproduce the above copyright
#       notice, this list of conditions and the following disclaimer in the
#       documentation and/or other materials provided with the distribution.
#    3. Neither the name of the owner nor the names of its contributors may be
#       used to endorse or promote products derived from this software without
#       specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY DIRECT,
# INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
# BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
# DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
# OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
# NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
# EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
#

import random
import uuid
from sqlalchemy.orm.exc import NoResultFound
from redis import Redis

# bcrypt seems to be among the latest consensus around cryptograpic circles on
# storing passwords.
# You need the package from http://code.google.com/p/py-bcrypt/
# You can install it by running easy_install py-bcrypt.

try:
    import bcrypt
except ImportError:
    print('pip install bcrypt to get it.')
    raise

from spyne.decorator import rpc
from spyne.error import ArgumentError
from spyne.model.complex import ComplexModel
from spyne.model.fault import Fault
from spyne.model.primitive import Mandatory
from spyne.model.primitive import String
from spyne.service import ServiceBase

from app import SessionFactory
from app.model import db
from appconf import DB_URL, REDIS_URI


APP_NS = 'http://kamkor.erp.kg/'


class PublicKeyError(Fault):
    __namespace__ = APP_NS

    def __init__(self, value):
        super(PublicKeyError, self).__init__(
            faultstring='Value %r not found' % value)


class AuthenticationError(Fault):
    __namespace__ = APP_NS

    def __init__(self, user_name):
        # TODO: self.transport.http.resp_code = HTTP_401

        super(AuthenticationError, self).__init__(
            faultcode='Client.AuthenticationError',
            faultstring='Invalid authentication request for %r' % user_name)


class AuthorizationError(Fault):
    __namespace__ = APP_NS

    def __init__(self):
        # TODO: self.transport.http.resp_code = HTTP_401

        super(AuthorizationError, self).__init__(
            faultcode='Client.AuthorizationError',
            faultstring='You are not authozied to access this resource.')


class SpyneDict(dict):
    def __getitem__(self, key):
        try:
            return dict.__getitem__(self, key)
        except KeyError:
            raise PublicKeyError(key)


class RequestHeader(ComplexModel):
    __namespace__ = APP_NS

    session_id = Mandatory.String
    user_name = Mandatory.String


user_db = {
    'svetofor': bcrypt.hashpw('Wh1teR@bbit', bcrypt.gensalt())
}

session_db = set()


class AuthenticationService(ServiceBase):
    __tns__ = APP_NS

    @rpc(Mandatory.String, Mandatory.String, _returns=String,
         _throws=AuthenticationError)
    def authenticate(ctx, user_name, password):
        password_hash = user_db.get(user_name, None)

        if password_hash is None:
            raise AuthenticationError(user_name)

        if bcrypt.hashpw(password, password_hash) == password_hash:
            session_id = (user_name,
                          '%x' % random.randint(1 << 124, (1 << 128) - 1))
            session_db.add(session_id)

        else:
            raise AuthenticationError(user_name)

        return session_id[1]


def _on_method_call(ctx):
    if ctx.in_object is None:
        raise ArgumentError("RequestHeader is null")
    if not (ctx.in_header.user_name, ctx.in_header.session_id) in session_db:
        raise AuthenticationError(ctx.in_object.user_name)


class UserDefinedContext(object):
    def __init__(self, flask_config):
        self.config = flask_config
        self.session = SessionFactory.get_session(db=db, db_string=DB_URL, app_name='soap_app')
        self.redis_db = 9
        self.redis = Redis(host=REDIS_URI, db=self.redis_db)

    def _generate_table_id(self, table, _id=None):
        if not _id:
            _id = str(uuid.uuid4()).lower()
        try:
            ti = self.session.query(db.TableId).filter(db.TableId._id == _id).with_for_update(of=db.TableId).one()
        except NoResultFound:
            ti = db.TableId()
            ti._id = _id
        ti.table_name = table
        self.session.add(ti)
        self.session.flush()
        return ti._id

    # def _new_rev(self, doc):
    #     oldrev = doc.get('_rev')
    #     if oldrev is None:
    #         seq, _ = 0, None
    #     else:
    #         seq, _ = oldrev.split('-', 1)
    #         seq = int(seq)
    #     sig = hashlib.md5(pickle.dumps(doc)).hexdigest()
    #     newrev = '%d-%s' % (seq + 1, sig)
    #     return newrev.lower()


