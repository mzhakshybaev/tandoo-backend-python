import json
import logging
import traceback
from datetime import datetime, timedelta

from apscheduler.schedulers import SchedulerAlreadyRunningError
from apscheduler.schedulers.background import BackgroundScheduler
from flask import g
from redis import Redis

import SessionFactory
from appconf import REDIS_DB
from appconf import REDIS_URI
from apputils import JSONEncoderCore

__author__ = 'Jaynakus'


def check(job_id):
    data = g.redis.get('job:' + str(job_id))
    return json.loads(data)


class CoreScheduler(object):
    __instance = None

    def __new__(cls):
        if CoreScheduler.__instance is None:
            CoreScheduler.__instance = object.__new__(cls)
            CoreScheduler.__instance.scheduler = BackgroundScheduler()
            CoreScheduler.__instance.app = None
        return CoreScheduler.__instance

    def start(self, app=None):
        if app:
            app.scheduler = self
            self.__instance.app = app
        try:
            self.__instance.scheduler.start()
        except SchedulerAlreadyRunningError:
            pass

    def run(self, job, message, job_id=None):
        def call_func(*args, **kwargs):
            with self.app.app_context():
                db_session = SessionFactory.get_session()
                g.tran = db_session()
                g.redis = Redis(REDIS_URI, db=REDIS_DB)
                g.logger = logging.getLogger(str(job.__name__))
                g.batch = True
                try:
                    bag = job(*args, **kwargs)
                    if 'status' not in bag:
                        bag['status'] = 1
                    g.redis.setex('job:' + str(job_id), json.dumps(bag, cls=JSONEncoderCore), timedelta(minutes=5))
                    g.tran.commit()
                except Exception as e:
                    g.tran.rollback()
                    g.redis.setex('job:' + str(job_id),
                                  json.dumps({'status': 2, 'message': repr(e.message)}, cls=JSONEncoderCore),
                                  timedelta(minutes=5))
                    logging.error(traceback.format_exc())
                finally:
                    db_session.remove()

        if not job_id:
            job_id = g.redis.incr('job_id')
        g.redis.setex('job:' + str(job_id), json.dumps({'status': 0}), timedelta(minutes=60))
        self.scheduler.add_job(call_func, args=[message],
                               trigger='date',
                               id=str(job_id),
                               name='{}: {}'.format(job.__name__, str(job_id)),
                               next_run_time=datetime.now() + timedelta(seconds=10),
                               max_instances=1,
                               misfire_grace_time=30)
        return job_id

    def schedule(self, job, message=None, **kwargs):
        def call_func(*args, **kwargs):
            with self.app.app_context():
                db_session = SessionFactory.get_session()
                g.tran = db_session()
                g.redis = Redis(REDIS_URI, db=REDIS_DB)
                g.logger = logging.getLogger(str(job.__name__))
                g.batch = True
                try:
                    job(*args, **kwargs)
                    g.tran.commit()
                except Exception:
                    g.tran.rollback()
                    logging.error(traceback.format_exc())
                finally:
                    db_session.remove()

        self.scheduler.add_job(call_func,
                               trigger='interval',
                               name='{}'.format(job.__name__),
                               args=[message],
                               max_instances=1,
                               replace_existing=True,
                               **kwargs)
