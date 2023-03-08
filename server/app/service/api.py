from app import controller

from app.model import db
from app.service import table_access, chain


@table_access(name=db.Api.__name__)
@chain(controller_name='data.listing', output=['docs', 'count'])
def listing(bag):
    pass


@table_access(name=db.Api.__name__)
def save(bag):
    if isinstance(bag['roles_id'], (unicode, str)):
        bag['roles_id'] = bag['roles_id'].split(",")
    controller.call(controller_name='data.put', bag=bag)
    return