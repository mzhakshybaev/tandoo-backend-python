from app.model import db
from app.service import table_access, chain


@table_access(name=db.Companyqualification.__name__)
@chain(controller_name='data.listing', output=['docs', 'count'])
def listing(bag):
    pass


@table_access(name=db.Companyqualification.__name__)
@chain(controller_name='data.put', output=['id', 'rev'])
def save(bag):
    pass


@table_access(name=db.Companyqualification.__name__)
@chain(controller_name='data.get', output=['doc'])
def get(bag):
    pass
