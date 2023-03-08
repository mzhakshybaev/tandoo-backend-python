# coding=utf-8
import json

import requests
from flask import g
import datetime

from app.utils import portal_post, CbsException
from messages import GENERIC_ERROR


def listing(bag):
    inn = g.user.company['companyInn']
    if not inn:
        raise CbsException(GENERIC_ERROR, u'ИНН организации отсутствует')
    year = datetime.date.today().year
    data = {'companyInn': inn, 'year': year}

    resp = portal_post('plan', data)
    return {'data': resp}


def get(bag):
    if not bag.get('inn'):
        raise CbsException(GENERIC_ERROR, u'ИНН организации отсутствует')
    if not bag.get('code'):
        raise CbsException(GENERIC_ERROR, u'CPV Код отсутствует')
    url = "http://localhost:8080"
    data = {'inn': bag['inn'], 'code': bag['code']}
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    r = requests.post(url, data=json.dumps(data), headers=headers, timeout=60)
    return {'data': r}
