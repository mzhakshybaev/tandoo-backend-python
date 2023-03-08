from flask import g

from app.messages import USER_NOT_AUTHORIZED
from app.model import db
from app.service import chain, table_access
from app.utils import orm_to_json, CbsException


@table_access(name=db.AdminNotification.__name__)
@chain(controller_name='data.get', output=['doc'])
def get(bag):
    pass


def listing(bag):
    # if user is operator
    if g.user.role == 1:
        notifications = g.tran.query(db.AdminNotification).filter_by(_deleted='infinity').all()
    else:
        sequence = ["all"]
        # user_company = g.tran.query(db.Companies).filter_by(_id=g.company._id, _deleted='infinity').one()
        # if user_company and user_company.company_type:
        #     role_id = user_company.roles_id[0]
        #     sequence.append(role_id)
        # else:
        #     raise CbsException(USER_NOT_AUTHORIZED)

        notifications = g.tran.query(db.AdminNotification).filter_by(_deleted='infinity').filter(
            db.AdminNotification.role_id.in_(sequence)).all()

    notifications = orm_to_json(notifications)
    # builds content without styles
    for n in notifications:
        content = ""
        if n.get('content'):
            for b in n['content']['blocks']:
                content += b['text']
            n['content'] = content
    return {"docs": notifications}


@table_access(name=db.AdminNotification.__name__)
@chain(controller_name='data.put')
def save(bag):
    pass
