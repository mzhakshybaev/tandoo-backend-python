# coding=utf-8
from flask import g
from sqlalchemy import func, text
from sqlalchemy import or_, type_coerce
from sqlalchemy.dialects.postgresql import JSONB

from app.model import db
from app.utils import orm_to_json


def listing(bag):
    product = g.tran.query(db.Products._id).filter_by(_deleted='infinity')
    if g.company.company_type == 'agent':
        insurance_company = g.tran.query(db.Companies).filter_by(_deleted='infinity') \
            .filter(db.Companies.agents_id.contains(type_coerce([g.company._id], JSONB))).first()
        product = product.filter(or_(
            db.Products.company_id == insurance_company._id,
            db.Products.company_id == g.company._id
        ))
    else:
        product = g.tran.query(db.Products._id).filter_by(company_id=g.company._id, _deleted='infinity')

    for col in db.Products.__table__.c:
        product = product.add_column(col)

    company = g.tran.query(func.jsonb_agg(
        func.jsonb_build_object(
            '_id', db.Companies._id,
            'name', db.Companies.name
        )
    )).select_from(db.Companies) \
        .filter_by(_deleted='infinity').filter(db.Companies._id == db.Products.company_id).as_scalar() \
        .label('company')

    factor = g.tran.query(func.jsonb_agg(func.row_to_json(text('factors.*'))))\
        .select_from(db.Factors) \
        .filter_by(_deleted='infinity').filter(db.Factors._id == db.ProductsFactor.factor_id).as_scalar() \
        .label('factor')

    services = g.tran.query(func.jsonb_agg(func.row_to_json(text('services.*')))) \
        .select_from(db.Services) \
        .filter_by(_deleted='infinity').as_scalar() \
        .label('services')

    productsfactor = g.tran.query(func.jsonb_agg(
        func.jsonb_build_object(
            '_id', db.ProductsFactor._id,
            'product_id', db.ProductsFactor.product_id,
            'factor_id', db.ProductsFactor.factor_id,
            'values', db.ProductsFactor.values,
            'coefficient', db.ProductsFactor.coefficient,
            'coefficient_type', db.ProductsFactor.coefficient_type,
            'is_default', db.ProductsFactor.is_default,
            'factor', factor
        )
    )).select_from(db.ProductsFactor) \
        .filter_by(_deleted='infinity').filter(db.ProductsFactor.product_id == db.Products._id)

    basefactors = g.tran.query(func.jsonb_agg(func.row_to_json(text('productsbasefactor.*')))) \
        .select_from(db.ProductsBaseFactor) \
        .filter_by(_deleted='infinity').filter(db.ProductsBaseFactor.product_id == db.Products._id).as_scalar() \
        .label('basefactors')

    productsfactor = productsfactor.as_scalar() \
        .label('factors')
    product = product.add_columns(productsfactor, basefactors, company, services)
    product = orm_to_json(product.all())

    countries = orm_to_json(g.tran.query(db.Countries)
                            .filter_by(_deleted='infinity').all())

    currencies = orm_to_json(g.tran.query(db.Currencies)
                             .filter_by(_deleted='infinity').all())

    return {'product': product, 'countries': countries, 'currencies': currencies}


def issue_listing(bag):
    countries = orm_to_json(g.tran.query(db.Countries)
                            .filter_by(_deleted='infinity').all())


    currencies = orm_to_json(g.tran.query(db.Currencies)
                             .filter_by(_deleted='infinity').all())

    return {'countries': countries, 'currencies': currencies}


def view_listing(bag):
    product = g.tran.query(db.Products._id).filter_by(_deleted='infinity')
    if g.company.company_type == 'agent':
        insurance_company = g.tran.query(db.Companies).filter_by(_deleted='infinity') \
            .filter(db.Companies.agents_id.contains(type_coerce([g.company._id], JSONB))).first()
        product = product.filter(or_(
            db.Products.company_id == insurance_company._id,
            db.Products.company_id == g.company._id
        ))
    else:
        product = g.tran.query(db.Products._id).filter_by(company_id=g.company._id, _deleted='infinity')

    for col in db.Products.__table__.c:
        product = product.add_column(col)

    company = g.tran.query(func.jsonb_agg(
        func.jsonb_build_object(
            '_id', db.Companies._id,
            'name', db.Companies.name
        )
    )).select_from(db.Companies) \
        .filter_by(_deleted='infinity').filter(db.Companies._id == db.Products.company_id).as_scalar() \
        .label('company')

    factor = g.tran.query(func.jsonb_agg(func.row_to_json(text('factors.*')))) \
        .select_from(db.Factors) \
        .filter_by(_deleted='infinity').filter(db.Factors._id == db.ProductsFactor.factor_id).as_scalar() \
        .label('factor')

    productsfactor = g.tran.query(func.jsonb_agg(
        func.jsonb_build_object(
            '_id', db.ProductsFactor._id,
            'product_id', db.ProductsFactor.product_id,
            'factor_id', db.ProductsFactor.factor_id,
            'values', db.ProductsFactor.values,
            'coefficient', db.ProductsFactor.coefficient,
            'coefficient_type', db.ProductsFactor.coefficient_type,
            'is_default', db.ProductsFactor.is_default,
            'factor', factor
        )
    )).select_from(db.ProductsFactor) \
        .filter_by(_deleted='infinity').filter(db.ProductsFactor.product_id == db.Products._id)

    basefactors = g.tran.query(func.jsonb_agg(func.row_to_json(text('productsbasefactor.*')))) \
        .select_from(db.ProductsBaseFactor) \
        .filter_by(_deleted='infinity').filter(db.ProductsBaseFactor.product_id == db.Products._id).as_scalar() \
        .label('basefactors')

    productsfactor = productsfactor.as_scalar() \
        .label('factors')
    product = product.add_columns(productsfactor, basefactors, company)
    product = orm_to_json(product.first())

    countries = orm_to_json(g.tran.query(db.Countries)
                            .filter_by(_deleted='infinity').all())

    currencies = orm_to_json(g.tran.query(db.Currencies)
                             .filter_by(_deleted='infinity').all())

    return {'product': product, 'countries': countries, 'currencies': currencies}
