# coding=utf-8
from xml.etree import ElementTree
import requests
from flask import g
from sqlalchemy import func
from sqlalchemy.orm.exc import NoResultFound
import datetime
from datetime import datetime
from app.model import db
from app.messages import GENERIC_ERROR
from app import controller
from app.model.db import ABSTIME
from app.utils import CbsException


NBKR_DAILY = 'http://www.nbkr.kg/XML/daily.xml'
NBKR_WEEKLY = 'http://www.nbkr.kg/XML/weekly.xml'
xpath = 'Currency[@ISOCode="{0}"]/Value'


def get_currency_nbkr(iso_code):
    if iso_code == 'KGS':
        return 1
    xml = requests.get(NBKR_DAILY, timeout=10).content
    e = ElementTree.fromstring(xml)
    node = e.find(xpath.format(iso_code))
    if node is None:
        xml = requests.get(NBKR_WEEKLY, timeout=10).content
        e = ElementTree.fromstring(xml)
        node = e.find(xpath.format(iso_code))
    return float(node.text.replace(',', '.'))


def get_nbkr_rate(bag):
    isoes = ['USD', 'EUR', 'KZT', 'RUB']
    res = []
    date = datetime.now()
    for iso in isoes:
        item = get_rate(iso, date)
        res.append({"currency": iso, "value": item})
    return {'results': res}


def get_rate(p_currency='KGS', date=None):
    if p_currency == 'KGS':
        return 1
    else:
        try:
            sql = g.tran.query(db.CurrencyRate).with_for_update(read=False, of=db.CurrencyRate)\
                .filter_by(_deleted='infinity').filter(db.CurrencyRate.currency == p_currency)
            if date is not None:
                # date = datetime.strptime(date, '%Y-%m-%dT%H:%M:%S.%fZ')
                sql = sql.filter(db.CurrencyRate.currency_date.cast(ABSTIME) == date.strftime("%Y%m%d"))
            else:
                sql = sql.filter(db.CurrencyRate.currency_date.cast(ABSTIME) == func.current_date().strftime("%Y%m%d"))
            rate = sql.one()
            cur = float(rate.rate)
        except NoResultFound:
            date = datetime.now()
            # if date < date.today():
            #     raise CbsException(GENERIC_ERROR, u'Курс {0} не найден на дату: {1}'.format(p_currency, str(date)))
            cur = get_currency_nbkr(p_currency)
            if not cur:
                raise CbsException(GENERIC_ERROR, u'Курс {0} не найден на дату : {1}'.format(p_currency, str(date)))
            cr = {'currency': p_currency, 'rate': cur, 'currency_date':datetime.now().date().strftime('%Y-%m-%d %H:%M:%S'), 'type': 'CurrencyRate'}
            controller.call(controller_name='data.put', bag=cr)
        return round(cur, 4)





