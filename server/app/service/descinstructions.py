# coding=utf-8
from app.service import table_access, chain


@table_access('DescInstructions')
@chain(controller_name='data.listing', output=['docs'])
def listing(bag):
    pass


@table_access(name='DescInstructions')
@chain(controller_name='data.put', output=['id', 'rev'])
def put(bag):
    pass


@table_access('DescInstructions')
@chain(controller_name='data.delete', output=["ok", "id", "rev"])
def delete(bag):
    pass