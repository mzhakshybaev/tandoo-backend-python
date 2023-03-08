# coding=utf-8
from datetime import datetime

from flask import g
from sqlalchemy import TEXT
from sqlalchemy import and_
from sqlalchemy import cast
from sqlalchemy import func
from sqlalchemy import text

from app.keys import INFINITY
from app.messages import GENERIC_ERROR
from app.model import db
from app.service import table_access
from app.service.dictionary import tables
from app.utils import orm_to_json, CbsException


@table_access('Advert')
def listing(bag):
    if hasattr(g, 'company'):
        procurement_id = '62e43b5e-3cca-4d3f-9680-c106c91ed7cf'
        auctions_data = g.tran.query(db.Advert).filter_by(_deleted='infinity', dirprocurement_id=procurement_id) \
            .order_by(db.Advert.created_date.desc(), db.Advert._created).all()

        if bag.get('filter', {}):
            if bag['filter'].get('status', ''):
                auctions_data = auctions_data.filter(db.Advert.status == bag['filter']['status'])

        auctions = []
        for auction in auctions_data:
            advert_lots = g.tran.query(db.Advert_lot).filter_by(_deleted='infinity').filter(
                db.Advert_lot.advert_id == auction._id).all()
            lot_budget = 0
            for advert_lot in advert_lots:
                lot_budget += advert_lot.budget
            dirsection = g.tran.query(db.DirSection) \
                .filter_by(_deleted='infinity').filter(db.DirSection._id == auction.dirsection_id).first()
            organization = g.tran.query(db.Companies) \
                .filter_by(_deleted='infinity') \
                .filter(db.Companies._id == auction.company_id).first()
            dirprocurement = g.tran.query(db.DirProcurement) \
                .filter_by(_deleted='infinity') \
                .filter(db.DirProcurement._id == auction.dirprocurement_id).first()
            if g.lang == "ru":
                dirsectionlabel = dirsection.name
            elif g.lang == "en":
                dirsectionlabel = dirsection.name_en if dirsection.name_en else dirsection.name
            elif g.lang == "kg":
                dirsectionlabel = dirsection.name_kg if dirsection.name_kg else dirsection.name
            else:
                dirsectionlabel = dirsection.name
            data = {
                "_id": auction._id,
                "code": auction.code,
                "step": auction.step,
                "status": auction.status,
                "start_date": auction.start_date,
                "published_date": auction.published_date,
                "create_date": auction.created_date,
                "update_date": auction.update_date,
                "dirsection": dirsectionlabel,
                "deadline": auction.deadline,
                "organization": organization.name,
                "dirprocurement": dirprocurement.name if dirprocurement else {},
                "count_lot": len(advert_lots),
                "budget": lot_budget
            }
            auctions.append(data)
        count = len(auctions)
        return {'docs': auctions, 'count': count}
    else:
        raise CbsException(GENERIC_ERROR, u'У вас нет выбранной организации')