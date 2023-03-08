# coding=utf-8
from flask import g
import datetime

from sqlalchemy import and_

from app import controller
from app import scheduler
from app import service
from app.controller import entity
from app.keys import INFINITY, CRUD, BOBJECT
from app.model import db
from app.service import table_access
from app.storage import PostgresDatabase
from app.utils import orm_to_json


def check(bag):
    bag.update(scheduler.check(bag['job_id']))


@table_access('Advert')
def status_check(bag):
    advert = bag['advert']
    advert['type'] = bag['type']

    if advert['status'] in ['Published']:
        print advert['_id']
        dirprocurement = g.tran.query(db.DirProcurement)\
            .filter_by(_deleted='infinity', _id=advert['dirprocurement_id']).first()
        dirprocurement = orm_to_json(dirprocurement)
        if 'code' in dirprocurement['data'] and dirprocurement['data']['code'] == 'Simplified':
            reason = 'Не состоялась в связи с отсутствием не менее двух участников'
        else:
            reason = 'Не состоялась в связи с отсутствием участников'
        advert_lots = g.tran.query(db.Advert_lot)\
            .filter_by(_deleted='infinity', advert_id=advert['_id']).all()
        advert_lots = orm_to_json(advert_lots)
        for advert_lot in advert_lots:
            application_count = g.tran.query(db.Application)\
                .filter_by(_deleted='infinity', advert_lot_id=advert_lot['_id'], status='Published').count()

            if dirprocurement['count'] > application_count:
                    advert_lot['type'] = 'Advert_lot'
                    advert_lot['status'] = 'Canceled'
                    advert_lot['reason'] = reason
                    protocol = {
                        'advert_lot_id': advert_lot['_id'],
                        'title': 'Операция отмены',
                        'description': advert_lot['reason'],
                    }
                    pr = entity.add({CRUD: db.Protocol, BOBJECT: protocol})

                    advert_lot_res = controller.call(controller_name='data.put', bag=advert_lot)

        advert['status'] = 'Evaluation'

        advert_res = controller.call(controller_name='data.put', bag=advert)


def test(bag):
    advert_lots_ids = g.tran.query(db.Advert_lot._id) \
        .filter_by(_deleted='infinity', advert_id='e83b1f46-8c20-413d-a9d2-c71cf7c1f29f').all()
    advert_lots_ids = orm_to_json(advert_lots_ids)
    items = []
    for advert_lot in advert_lots_ids:
        application_count = g.tran.query(db.Application) \
            .filter_by(_deleted='infinity', advert_lot_id=advert_lot['_id'], status='Published').count()
        items.append(application_count)
    return {'items': items}


