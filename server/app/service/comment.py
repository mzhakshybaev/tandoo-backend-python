# coding=utf-8
from flask import g

from app import controller
from app.model import db
from app.service import table_access, chain
from app.service.dictionary import tables
from app.utils import CbsException
from messages import GENERIC_ERROR


@table_access(name=db.Comments.__name__)
@chain(controller_name='data.listing', output=['docs', 'count'])
def listing(bag):
    pass


@table_access(name=db.Comments.__name__)
@chain(controller_name='data.put', output=['id', 'rev'])
def save(bag):
    pass
