from app.service import chain


@chain(controller_name='notification.read', output=['notification'])
def read(bag):
    pass


@chain(controller_name='notification.listing', output=['notifications', 'count'])
def listing(bag):
    pass


@chain(controller_name='notification.put', output=['notification'])
def save(bag):
    pass