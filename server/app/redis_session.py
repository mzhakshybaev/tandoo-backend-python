import json
from datetime import timedelta
from uuid import uuid1

from flask import g

from app import messages
from app.utils import CbsException

SESSION_TIMEOUT = 30
SESSION_TIMEOUT_NOWEB = 525600


def open_session(data):
    sid = data['token'] if 'token' in data else str(uuid1(clock_seq=g.redis.incr('session_id')))
    if g.client == '1':
        g.redis.setex('session:' + sid, timedelta(minutes=SESSION_TIMEOUT), json.dumps(data))
    else:
        g.redis.setex('session:' + sid, timedelta(minutes=SESSION_TIMEOUT_NOWEB), json.dumps(data))
    return sid


def update_session(token, data):
    session = get_session(token)
    if not session:
        raise CbsException(messages.USER_NOT_AUTHORIZED)
    session.update(data)
    if g.client == '1':
        g.redis.setex('session:' + token, timedelta(minutes=SESSION_TIMEOUT), json.dumps(session))
    else:
        g.redis.setex('session:' + token, timedelta(minutes=SESSION_TIMEOUT_NOWEB), json.dumps(session))


def get_session(token):
    data = g.redis.get('session:' + token)
    if data:
        if g.client == '1':
            g.redis.setex('session:' + token, timedelta(minutes=SESSION_TIMEOUT), data)
        else:
            g.redis.setex('session:' + token, timedelta(minutes=SESSION_TIMEOUT_NOWEB), data)
        return json.loads(data)
    return {}
