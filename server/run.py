# coding=utf-8
import json
import logging
import os
import sys
import traceback
import urllib
from base64 import b64decode
from datetime import timedelta, datetime
from inspect import isclass
from time import time

import jwt
import requests
from PIL import Image
from flask import g, request, send_from_directory
from flask_cors import CORS
from flask_session import Session
from flask_uploads import UploadSet, configure_uploads, IMAGES
from redis import Redis
from sqlalchemy import DDL, event, func
from sqlalchemy import type_coerce
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import make_transient
from werkzeug.utils import secure_filename

import app
from app import AppFactory, SessionFactory
from app import redis_session
from app.helper import sql_utils
from app.jobs import advert, product, companydocument, companyproduct, company
from app.messages import MESSAGE, KEY_ERROR, GENERIC_ERROR
from app.model import db
from app.model.db import CouchSync, Base
from app.pages.peer import pg
from app.scheduler import CoreScheduler
from app.service import call, auth_required
from app.utils import CbsException, make_json_response, orm_to_json
from appconf import DB_URL, REDIS_URI, JWT_SECRET_KEY, API_ZAKUPKI
from messages import USER_NOT_AUTHORIZED

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, 'static')
UPLOADS_DEFAULT_DEST = os.path.join(STATIC_DIR, 'uploads')
UPLOADS_DEFAULT_URL = '/uploads/'
UPLOADED_IMAGES_DEST = os.path.join(UPLOADS_DEFAULT_DEST, 'images')
UPLOADED_IMAGES_URL = '/uploads/images/'
UPLOADED_PROFILE_IMAGES_DIR = os.path.join(UPLOADED_IMAGES_DEST, 'profile')

# create static folder
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR)

sys.path.append('app')

app = AppFactory.create_app(app.__name__)
app.config.from_object('appconf')
app.permanent_session_lifetime = timedelta(minutes=15)
app.config['WTF_CSRF_ENABLED'] = False
app.config['LOGGER_NAME'] = 'st'
app.config['SESSION_COOKIE_NAME'] = 'st'
app.config['SESSION_TYPE'] = 'sqlalchemy'
app.config['SESSION_PERMANENT'] = True
app.config['SESSION_SQLALCHEMY_TABLE'] = 'sessions'
app.config['SQLALCHEMY_DATABASE_URI'] = DB_URL
app.config['BASE_DIR'] = BASE_DIR
app.config['UPLOADS_DEFAULT_DEST'] = UPLOADS_DEFAULT_DEST
app.config['UPLOADS_DEFAULT_URL'] = UPLOADS_DEFAULT_URL
app.config['UPLOADED_IMAGES_DEST'] = UPLOADED_IMAGES_DEST
app.config['UPLOADED_IMAGES_URL'] = UPLOADED_IMAGES_URL
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024
# related company ids in mobile app
app.config['COMPANY_IDS'] = {
    'augarantid': '946a349f-bad2-40b9-ba3d-e4db088297d6'
}

# Configure the image uploading via Flask-Uploads
image_uploads = UploadSet('images', IMAGES)
configure_uploads(app, image_uploads)

Session(app)

CORS(app, resources=r'*',
     headers=['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials', 'Access-Control-Allow-Origin'],
     supports_credentials=True)

app.register_blueprint(pg, url_prefix='/sync')


@app.route('/')
def index():
    return 'It works'


@app.route('/<string:path>/<string:name>', methods=['GET', 'POST'])
@app.route('/<string:path>.<string:name>', methods=['GET', 'POST'])
def service(path, name):
    if request.endpoint == 'static':
        return
    if request.data:
        bag = json.loads(request.data)
    else:
        bag = {}
    ret = call('{}.{}'.format(path, name), bag)
    return make_json_response(ret)


@app.before_first_request
def before_first():
    sched = CoreScheduler()
    sched.start(app)
    sched.schedule(advert.update_statuses, seconds=10, start_date=datetime.strptime("01/01/18", "%d/%m/%y"))
    sched.schedule(product.update_statuses, seconds=10, start_date=datetime.strptime("01/01/18", "%d/%m/%y"))
    sched.schedule(companydocument.date_doct, seconds=86400, start_date=datetime.strptime("01/01/18", "%d/%m/%y"))
    sched.schedule(companyproduct.update_status, seconds=86400, start_date=datetime.strptime("01/01/18", "%d/%m/%y"))
    sched.schedule(company.update_statuses, seconds=86400, start_date=datetime.strptime("01/01/18", "%d/%m/%y"))
    app.db = db

    classes = [x for x in dir(db) if isclass(getattr(db, x))]
    for c in classes:
        m = getattr(db, c)
        if issubclass(m, Base) and issubclass(m, CouchSync) and m.__name__ != CouchSync.__name__:
            trigger = DDL(
                """
                CREATE TRIGGER timetravel_{0}
        BEFORE INSERT OR DELETE OR UPDATE ON {0}
        FOR EACH ROW
        EXECUTE PROCEDURE
          timetravel(_created, _deleted);
                """.format(c)
            )
            event.listen(m.__table__, 'after_create', trigger.execute_if(dialect='postgresql'))


@app.before_request
def before():
    g.time = time()
    g.logger = logging.getLogger(request.host)
    g.host = request.host
    g.connection = DB_URL
    g.redis_db = 9
    g.tran = SessionFactory.get_session(db=db, db_string=g.connection, app_name=request.host)
    g.redis = Redis(host=REDIS_URI, db=g.redis_db)
    data = request.json or {}
    g.client = data['client'].encode('utf8') if 'client' in data else '1'
    g.lang = data['lang'].encode('utf8') if 'lang' in data else 'ru'

    if 'Authorization' in request.headers and request.authorization:
        auth = request.authorization
        g.token = auth.password
        session = redis_session.get_session(auth.password)
        g.session = session
        if 'user_id' in session:
            g.user = g.tran.query(db.User).filter(db.User.id == session['user_id']).first()
            make_transient(g.user)
            company = g.tran.query(db.Companies).filter_by(_deleted='infinity', user_id=g.user.id).first()

            if company:
                company.roles = {}
                roles = g.tran.query(db.Roles).filter_by(_deleted='infinity') \
                    .filter(type_coerce(company.roles_id, JSONB)
                            .contains(type_coerce(func.jsonb_build_array(db.Roles._id), JSONB))).first()

                company.roles = roles
                g.company = company
                session['company_id'] = company._id
                make_transient(g.company)
            elif 'company_id' in session:
                del session['company_id']
            redis_session.update_session(g.token, session)

    if request.method != 'OPTIONS' and request.path != '/upload/companydocs' and request.path != '/user/auth':
        g.logger.info(u'{0}: Request:{1} - Data:{2}'.format(request.remote_addr, request.url, request.json))


@app.teardown_request
def teardown(exception):
    try:
        if exception is None:
            if request.path != '/upload/companydocs' and request.path != '/user/auth':
                g.logger.info('{0}: Request:{1} finished in {2} sec'.format(request.remote_addr,
                                                                            request.url,
                                                                            time() - g.time))
            if hasattr(g, 'tran') and g.tran is not None:
                g.tran.commit()
        else:
            g.logger.error(traceback.format_exc())
            if hasattr(g, 'tran') and g.tran is not None:
                g.tran.rollback()
                g.user = None
                g.tran = None
                g.company = None
    finally:
        if hasattr(g, 'connection') and g.connection:
            SessionFactory.get_session(db_string=g.connection).remove()


@app.errorhandler(CbsException)
@app.errorhandler(Exception)
def core_error(e):
    g.logger.error(traceback.format_exc())
    try:
        if hasattr(g, 'tran') and g.tran is not None:
            g.tran.rollback()
            g.user = None
            g.tran = None
    finally:
        if hasattr(g, 'connection') and g.connection:
            SessionFactory.get_session(db_string=g.connection).remove()

    if isinstance(e, CbsException):
        msg = e.message if e.message else MESSAGE.get(e.code, 'Got error code: ' + str(e.code))
        return make_json_response({'result': e.code, 'message': msg})
    if isinstance(e, KeyError):
        return make_json_response({'result': KEY_ERROR, 'message': MESSAGE.get(KEY_ERROR, e.message).format(e.message)})
    return make_json_response({
        'result': -1,
        'message': 'Server error: ' + e.message
    })


@app.route('/report/query/<string:code>', methods=['GET'])
def execute_report_query(code):
    result = {}
    _args = request.args.to_dict()
    queries = g.tran.query(db.ReportQueries).filter_by(_deleted='infinity').filter(db.ReportQueries.code == code).all()
    for query in queries:
        query_str = query.query.format(**_args)
        result[query.result_key] = sql_utils.execute(sql=query_str)
    return make_json_response(result)


@app.route('/upload/<string:path>', methods=['POST'])
@auth_required()
def upload_file(path):
    directory = os.path.join(os.path.join('app', app.config['UPLOAD_FOLDER'], path))
    if 'file' in request.files:
        f = request.files['file']
        if f and allowed_file(f.filename):
            filename = secure_filename(f.filename)
            if not os.path.exists(directory):
                os.makedirs(directory)
            try:
                os.remove(os.path.join(directory, filename))
            except OSError:
                pass
            f.save(os.path.join(directory, filename))
            return '{}/{}/{}'.format(path, filename), 200
        return 'File not allowed', 403
    elif request.endpoint == 'static':
        return
    elif request.data:
        bag = json.loads(request.data)
        if 'file' in bag:
            img_data = bag['file']
            filename = '{}.{}'.format(int(round(time() * 1000)), 'jpg')
            if allowed_file(filename):
                if not os.path.exists(directory):
                    os.makedirs(directory)
                fh = open(os.path.join(directory, filename), "wb")
                fh.write(img_data.decode('base64'))
                fh.close()
                return make_json_response({'file': '{}/{}'.format(path, filename)})
            else:
                return 'File not allowed', 403
        elif 'files' in bag:
            files = bag['files']
            filenames = []
            for img_data in files:
                f_name, ext = os.path.splitext(img_data['name'])
                filename = '{}{}'.format(int(round(time() * 1000)), ext)
                if allowed_file(filename):
                    if not os.path.exists(directory):
                        os.makedirs(directory)
                    fh = open(os.path.join(directory, filename), "wb")
                    fh.write(img_data['file'].decode('base64'))
                    fh.close()
                    filenames.append('{}/{}'.format(path, filename))
                else:
                    return 'File not allowed', 403
            return make_json_response({'files': filenames})
    return 'Bad request', 400


@app.route('/upload_file/docs/files/<string:path>', methods=['POST'])
def upload_file2(path):
    if not hasattr(g, 'user'):
        return MESSAGE.get(USER_NOT_AUTHORIZED), 401
    directory = os.path.join(os.path.join('app', app.config['UPLOAD_FOLDER'], path))
    if 'file' in request.files:
        f = request.files['file']
        if f and allowed_file(f.filename, extensions={'pdf', 'doc', 'docx', 'rar', 'zip', 'jpg', 'jpeg', 'gif', 'png'}):
            filename = secure_filename(u'{}-{}'.format(g.redis.incr('docs_file_index'), f.filename))
            if not os.path.exists(directory):
                os.makedirs(directory)
            try:
                os.remove(os.path.join(directory, filename))
            except OSError:
                pass
            f.save(os.path.join(directory, filename))
            return make_json_response({'file': {'filename': f.filename, 'url': '/{}/{}'.format(path, filename)}})
        return 'File not allowed', 403
    elif request.data:
        bag = json.loads(request.data)
        if 'file' in bag:
            img_data = bag['file']
            filename = '{}.{}'.format(int(round(time() * 1000)), 'jpg')
            if allowed_file(filename):
                if not os.path.exists(directory):
                    os.makedirs(directory)
                fh = open(os.path.join(directory, filename), "wb")
                fh.write(img_data.decode('base64'))
                fh.close()
                return make_json_response({'file': '{}/{}'.format(path, filename)})
            else:
                return 'File not allowed', 403
        elif 'files' in bag:
            files = bag['files']
            filenames = []
            for img_data in files:
                filename = '{}.{}'.format(int(round(time() * 1000)), img_data['ext'])
                if allowed_file(filename):
                    if not os.path.exists(directory):
                        os.makedirs(directory)
                    fh = open(os.path.join(directory, filename), "wb")
                    fh.write(img_data['file'].decode('base64'))
                    fh.close()
                    filenames.append('{}/{}'.format(path, filename))
                else:
                    return 'File not allowed', 403
            return make_json_response({'files': filenames})
    return 'Bad request', 400


@app.route('/delfile/<string:path>/<string:filename>', methods=['POST'])
def delete_file(path, filename):
    directory = os.path.join(os.path.join('app', app.config['UPLOAD_FOLDER'], path))
    filename = secure_filename(filename)
    file_path = os.path.join(directory, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return make_json_response({'doc': 'File {} removed'.format(filename)})
    else:
        raise CbsException(GENERIC_ERROR, u'Файл не найден')


@app.route('/download/<string:path>/<string:name>')
def download_file(path, name):
    filename = secure_filename(urllib.unquote(name))
    path_to_file = os.path.join(app.config['UPLOAD_FOLDER'], path)
    if not os.path.exists(os.path.join('app', path_to_file, filename)):
        return 'Файл не найден', 404
    return send_from_directory(path_to_file, filename)


@app.route('/login', methods=['POST'])
def decode_token():
    token = request.args.to_dict().keys()
    re = {'data': {}, 'error': ''}
    try:
        payload = jwt.decode(str(token[0]), b64decode(JWT_SECRET_KEY), algorithms=['HS512'])
        inn = payload['sub'].split('@')
        url = API_ZAKUPKI + "user"
        data = {'companyInn': inn[1], 'userPin': inn[0]}
        headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        user = requests.post(url, data=json.dumps(data), headers=headers, timeout=60)
        if user:
            token = redis_session.open_session({'user_id': user.id})
            session = redis_session.get_session(token)
            redis_session.update_session(token, session)
            return {'token': token, 'user': user}
    except jwt.ExpiredSignatureError as e1:
        re['error'] = 'token expired, please login again'
        return make_json_response(re)
    except jwt.InvalidTokenError:
        re['error'] = 'Invalid token, please try again with a new token'
        return make_json_response(re)
    except:
        re['error'] = 'Error token'
        return make_json_response(re)


def allowed_file(filename):
    if not filename:
        return False
    allowed_extensions = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'ods', 'xls', 'xlsx', 'PDF'}
    f_name, ext = os.path.splitext(filename)
    if not ext:
        return False
    ext = ext.replace('.', '')
    return ext.lower() in allowed_extensions


@app.route('/image/<string:path>/<string:name>', methods=['GET'])
@app.route('/image/<string:path>/<string:name>/<int:width>/<int:height>', methods=['GET'])
def get_image(path, name, width=1024, height=1024):
    filename = secure_filename(urllib.unquote(name))
    path_to_file = os.path.join(os.path.join(app.config['UPLOAD_FOLDER'], urllib.unquote(path)))
    path_to_thumb = os.path.join(path_to_file, '{}x{}'.format(width, height))
    if not os.path.isfile(os.path.join('app', path_to_file, filename)):
        return 'Image not found', 404
    if filename.endswith('.svg'):
        return send_from_directory(path_to_file, filename)
    if not os.path.exists(os.path.join('app', path_to_thumb, filename)):
        img = Image.open(os.path.join('app', path_to_file, filename))
        w, h = img.size
        if w < width and h < height:
            return send_from_directory(path_to_file, filename)
        if not os.path.exists(os.path.join('app', path_to_thumb)):
            os.makedirs(os.path.join('app', path_to_thumb))
        img.thumbnail((width, height))
        img.save(os.path.join('app', path_to_thumb, filename))
    return send_from_directory(path_to_thumb, filename)


@app.route('/users/<string:id>', methods=['POST'])
def getsession(id):
    user = g.tran.query(db.User).filter_by(id=int(id)).first()
    company = None
    docs = None
    if user.default_company is not None and user.default_company != "":
        uc = g.tran.query(db.Companies).filter_by(_deleted='infinity', _id=user.default_company).first()
        if uc:
            company = orm_to_json(uc)
            company['roles'] = g.tran.query(db.Roles).filter_by(_deleted='infinity') \
                .filter(db.Roles._id.in_(company["roles_id"])).first()
    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'fullname': user.fullname,
        'phone': user.phone,
        'inn': user.inn,
        'role': user.role,
        'rec_date': user.rec_date,
        'default_company': user.default_company,
        'data': user.data
    }
    token = redis_session.open_session({'user_id': user.id})
    session = redis_session.get_session(token)
    redis_session.update_session(token, session)
    return make_json_response({'token': token, 'user': user_data, 'company': company, 'docs': docs})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=7000, threaded=True)
