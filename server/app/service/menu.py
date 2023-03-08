from app import controller
from app.model import db
from app.service import table_access, chain


@table_access('Menus')
@chain(controller_name='data.listing', output=['docs'])
def listing(bag):
    pass


@table_access('Menus')
def save(bag):
    if isinstance(bag['roles_id'], (unicode, str)):
        bag['roles_id'] = bag['roles_id'].split(",")
    return controller.call(controller_name='data.put', bag=bag)


@table_access('Menus')
@chain(controller_name='data.delete', output=["ok", "id", "rev"])
def delete(bag):
    pass