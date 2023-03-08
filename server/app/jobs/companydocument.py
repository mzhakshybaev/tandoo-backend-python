# coding=utf-8
from datetime import datetime

from flask import g
from sqlalchemy import and_
from sqlalchemy import func
from sqlalchemy import or_

from app import service, controller
from app.controller import entity
from app.keys import CRUD, BOBJECT
from app.model import db
from app.utils import orm_to_json


def date_doct(bag):
    all_docs = g.tran.query(db.DirDocument).filter_by(_deleted='infinity').all()
    status = ['confirmed']
    companies = g.tran.query(db.Companies).filter_by(_deleted='infinity') \
        .filter(db.Companies.company_status.in_(status)).all()
    for company in companies:
        for doc in all_docs:
            label = doc.name
            document = g.tran.query(db.Companydocument)\
                .filter_by(_deleted='infinity', dirdocument_id=doc._id, company_id=company._id)\
                .order_by(db.Companydocument._created.desc()).first()
            date = document.date_end - datetime.now()
            day = date.days
            if day <= 6:
                text = {
                    "company_id": document.company_id,
                    "type": "CompanyDocs",
                    "title": u"Требуется обновления {}".format(label),
                    "title_kg": u"Жаңылоо талап кылынат {}".format(doc.name_kg),
                    "title_en": u"Update required {}".format(doc.name_en),
                    "description": u"Срок действия справки {0} истекает через {1} дней, "
                                   u"просим Вас обновить".format(label, day),
                    "description_kg": u"{0} - Маалымат кагазынын жарактуу мөөнөтү {1} "
                                      u"күндөн кийин аяктайт".format(doc.name_kg, day),
                    "description_en": u"{0} - Reference expires in {1}  days".format(doc.name_en, day),
                    "notification_status": "active",
                    "data": {}
                }
                entity.add({CRUD: db.NotificationCompany, BOBJECT: text})
            elif day == 0:
                text = {
                    "company_id": document.company_id,
                    "type": "CompanyDocs",
                    "title_kg": u"Жаңылоо талап кылынат {}".format(doc.name_kg),
                    "title_en": u"Update required {}".format(doc.name_en),
                    "description": u"Срок действия справки {} истек, просим Вас обновить".format(label),
                    "description_kg": u"{} - Маалымат кагазынын жарактуу мөөнөтү аяктады, "
                                      u"жаңылатууңузду суранабыз".format(doc.name_kg),
                    "description_en": u"Help expired {}, please update".format(doc.name_en),
                    "notification_status": "active",
                    "data": {}
                }
                res = entity.add({CRUD: db.NotificationCompany, BOBJECT: text})
            elif day < 0:
                break
