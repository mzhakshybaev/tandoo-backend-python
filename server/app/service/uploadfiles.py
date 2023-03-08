# -*- coding: utf-8 -*-
import os

from flask import request

import run
from app.messages import GENERIC_ERROR
from app.utils import CbsException
import run

UPLOAD_DIR = 'uploads'
DOCS_DIR = os.path.join(UPLOAD_DIR, 'docs')


def default_save(bag):
    result = {}
    if hasattr(request, 'files'):
        uploaded_files = request.files
        if len(uploaded_files) > 1:
            raise CbsException(GENERIC_ERROR, u'Нельзя загружать несполько файлов одоновременно')
        for file in uploaded_files:
            filename = run.default_uploader.save(uploaded_files[file])
            result = {'filename': filename, 'url': run.default_uploader.url(filename)}
    return {'file': result}
