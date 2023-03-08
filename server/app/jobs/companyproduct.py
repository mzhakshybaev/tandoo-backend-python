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


def update_status(bag):
    companyproducts = g.tran.query(db.Company_product).filter_by(_deleted='infinity', status='active').all()
    for product in companyproducts:
        dictprod = g.tran.query(db.Product).filter_by(_deleted='infinity', _id=product.product_id).first()
        dircategory = g.tran.query(db.DirCategory).filter(db.DirCategory.id == dictprod.dircategory_id).first()
        prod, dirbrand = g.tran.query(db.ProductDict, db.DirBrand).filter_by(_deleted='infinity') \
            .outerjoin(db.DirBrand, db.ProductDict.dictionary_id == db.DirBrand._id)\
            .filter(and_(db.ProductDict.product_id == dictprod._id, db.ProductDict.dirname == "DirBrand")).first()
        label = dircategory.name + ' ' + dirbrand.name
        date = product.date_end - datetime.now()
        day = date.days
        if day <= 6:
            text = {
                "company_id": product.company_id,
                "type": "Products",
                "title": u"Требуется обновления срока истечения цены продукта",
                "title_kg": u"Продукттун баасынын мөөнөтүн жаңылоо талап кылынат",
                "title_en": u"Update of the expiration price of the product is required",
                "description": u"Срок истечения цены продукта {0} истекает через {1} дней, "
                               u"просим Вас обновить".format(label, day),
                "description_kg": u"{0} Продукттун баасынын жарактуу мөөнөтү {1}"
                                  u" күндөн кийин аяктайт жана жаңылатууңузду суранабыз".format(label, day),
                "description_en": u"Product price {0} expires in {1} days” and please update".format(label, day),
                "notification_status": "active",
                "data": {
                    "product_id":product._id
                }
            }
            res = entity.add({CRUD: db.NotificationCompany, BOBJECT: text})
        elif day == 0:
            text = {
                "company_id": product.company_id,
                "type": "Products",
                "title": u"Требуется обновления срока истечения цены продукта",
                "title_kg": u"Продукттун баасынын мөөнөтүн жаңылоо талап кылынат",
                "title_en": u"Update of the expiration price of the product is required",
                "description": u"Срок истечения цены продукта  {} истек, просим Вас обновить".format(label),
                "description_kg": u"{} - продукттун баасынын мөөнөтү аягына чыкты, "
                                  u"жаңылатууңузду суранабыз".format(label),
                "description_en": u"The expiry price of the product {} has expired, please update".format(label),
                "notification_status": "active",
                "data": {
                    "product_id": product._id
                }
            }
            res = entity.add({CRUD: db.NotificationCompany, BOBJECT: text})
        elif day < 0:
            break

