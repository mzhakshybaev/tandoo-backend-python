# coding=utf-8
from flask import g
from sqlalchemy import and_
from app import utils
from app.helper.utils import get_datetime
from app.keys import INFINITY, DT_FORMAT_TZ
from app.model import db
from app.service import table_access, chain
from app.utils import orm_to_json


@table_access(name=db.Companydocument.__name__)
def listing(bag):
    sql = g.tran.query(db.Companydocument, db.Companies, db.DirDocument) \
        .outerjoin(db.Companies, and_(db.Companydocument.company_id == db.Companies._id,
                                      db.Companies._deleted == INFINITY)) \
        .outerjoin(db.DirDocument, and_(db.Companydocument.dirdocument_id == db.DirDocument._id,
                                        db.DirDocument._deleted == INFINITY)) \
        .filter(db.Companydocument._deleted == INFINITY)

    if hasattr(g, 'company'):
        sql = sql.filter(db.Companydocument.company_id == g.company._id)
    if bag.get('dirdocument_id', ''):
        sql = sql.filter(db.Companydocument.dirdocument_id == bag['dirdocument_id'])

    comp_docs = []
    sql = sql.order_by(db.Companydocument.date_start.desc(), db.Companydocument._created.desc())

    if 'limit' in bag:
        sql = sql.limit(bag['limit'])

    for cd, comp, doc in sql.all():
        d = orm_to_json(cd)
        d['company'] = comp.name
        d['inn'] = comp.inn
        d['document'] = doc.name
        d['debt'] = cd.debt
        d['debt_status'] = u'Имеется' if cd.debt else u'Не имеется'
        comp_docs.append(d)
    return {'docs': comp_docs}


@table_access(name=db.Companydocument.__name__)
@chain(controller_name='data.put', output=['id', 'rev'])
def save(bag):
    pass


def send_request(bag):
    comp = g.tran.query(db.Companies).filter_by(_deleted='infinity', _id=g.company._id).first()
    if comp:
        sf_doc = g.tran.query(db.DirDocument).filter_by(_deleted='infinity') \
            .filter(db.DirDocument.data['type'].astext == 'sf').first()
        tax_doc = g.tran.query(db.DirDocument).filter_by(_deleted='infinity') \
            .filter(db.DirDocument.data['type'].astext == 'tax').first()

        p_resp = utils.portal_post('debt', data={'companyInn': comp.inn})
        sf, sf_debt = prepare_comp_doc(p_resp.get('sf', {}), comp._id, sf_doc._id, bag.get('advert_id', ''))
        save(sf)
        tax, tax_debt = prepare_comp_doc(p_resp.get('gns', {}), comp._id, tax_doc._id, bag.get('advert_id', ''))
        save(tax)
    return listing(bag)


def get_docs(bag):
    all_docs = g.tran.query(db.DirDocument).filter_by(_deleted='infinity').all()
    comp_docs = []
    for doc in all_docs:
        label = ""
        document = g.tran.query(db.Companydocument) \
            .filter_by(_deleted='infinity', company_id=g.company._id, dirdocument_id=doc._id) \
            .order_by(db.Companydocument._created.desc()).first()

        if g.lang == "ru":
            label = doc.name
        elif g.lang == "en":
            label = doc.name_en if doc.name_en and doc.name_en != 'null' else doc.name
        elif g.lang == 'kg':
            label = doc.name_kg if doc.name_kg and doc.name_kg != 'null' else doc.name

        if document:
            document.dirdocument_name = label
            comp_docs.append(document)
        else:
            comp_docs.append({'dirdocument_name': label})

    return {'docs': comp_docs}


def prepare_comp_doc(bag, comp_id, doc_id, advert_id):
    if not bag:
        return None, None
    date_issued = get_datetime(bag.get('dateIssued').split('.')[0], DT_FORMAT_TZ, True)
    date_end = get_datetime(bag.get('date').split('.')[0], DT_FORMAT_TZ, True)
    data = {'portal_id': bag.get('id', 0)}
    if advert_id:
        data['advert_id'] = advert_id
    comp_doc = {'company_id': comp_id, 'dirdocument_id': doc_id, 'date_start': date_issued,
                'date_end': date_end, 'issuer': bag.get('issuer', ''), 'debt': bag.get('flag', False),
                'data': data}
    return comp_doc, bag.get('flag', False)
