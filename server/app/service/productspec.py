from flask import g

from app.model import db
from app.service import table_access, chain


@table_access('ProductSpec')
@chain(controller_name='data.listing', output=['docs', 'count'])
def listing(bag):
    pass


def get(bag):
    product_spec = g.tran.query(db.ProductSpec).filter(db.ProductSpec.product_id == bag["product_id"]).all()
    for ps in product_spec:
        ps.property_value = g.tran.query(db.SpecificationPropertyValue).filter(db.SpecificationPropertyValue.id == ps.specification_property_value_id).first()
    return {'docs': product_spec}


@table_access('ProductSpec')
@chain(controller_name='data.put', output=['id', 'rev'])
def save(bag):
    pass


@table_access('ProductSpec')
@chain(controller_name='data.delete', output=["ok", "id", "rev"])
def delete(bag):
    pass
