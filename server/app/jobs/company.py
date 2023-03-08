# coding=utf-8
from flask import g
from sqlalchemy import and_
from sqlalchemy import func
from app import controller
from app.model import db


def update_statuses(bag):
    companies = g.tran.query(db.Companies).filter_by(_deleted='infinity') \
        .filter(and_(db.Companies.end_date < func.now(), db.Companies.company_status == 'confirmed')).all()

    for company in companies:
        company.company_status = 'expired'
        controller.call(controller_name='data.put', bag=company)
