import logging
import logging.handlers

from flask import Flask
from spyne.application import Application
from spyne.protocol.soap import Soap11
from spyne.server.wsgi import WsgiApplication
from werkzeug.wsgi import DispatcherMiddleware

from .soap_service import policy_manager, AuthenticationService, APP_NS, UserDefinedContext

__author__ = 'Jaynakus'


def create_soap_app(flask_app):
    '''Creates SOAP services application and distribute Flask config into
    user con defined context for each method call.
    '''
    application = Application([AuthenticationService] + policy_manager.services,
                              tns=APP_NS,
                              in_protocol=Soap11(validator='lxml'),
                              out_protocol=Soap11())

    def _on_method_call(ctx):
        ctx.udc = UserDefinedContext(flask_app.config)

    def _on_method_context_closed(ctx):
        if ctx.udc is not None:
            ctx.udc.session.commit()
            ctx.udc.session.close()

    def _on_method_exception_object(ctx):
        if ctx.udc is not None:
            ctx.udc.session.rollback()

    application.event_manager.add_listener('method_call', _on_method_call)
    application.event_manager.add_listener('method_context_closed', _on_method_context_closed)
    application.event_manager.add_listener('method_exception_object', _on_method_exception_object)

    return application


def create_app(name, logger_name='daily.log', test=False):
    if not test:
        try:
            logging.basicConfig(level=logging.INFO,
                                format="%(threadName)s %(asctime)s %(name)-12s %(message)s",
                                datefmt="%d-%m-%y %H:%M")

            daily = logging.handlers.TimedRotatingFileHandler("log/" + logger_name, when="midnight", interval=1,
                                                              backupCount=15,
                                                              encoding="utf-8")
            logging.getLogger().addHandler(daily)
            fmt = logging.Formatter('%(asctime)s %(name)-12s %(message)s')
            daily.setFormatter(fmt)
            daily.setLevel(logging.DEBUG)
        except:
            pass

    app = Flask(name)
    app.wsgi_app = DispatcherMiddleware(app.wsgi_app, {
        '/soap': WsgiApplication(create_soap_app(app))
    })

    return app


