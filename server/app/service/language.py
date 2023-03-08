# coding=utf-8
import json
from flask import g
from app.model import db
import io

from app.utils import orm_to_json
from appconf import LANGUAGE_FOLDER

try:
  to_unicode = unicode
except NameError:
  to_unicode = str


def get(bag):
    data_ru = {}
    data_kg = {}
    data_en = {}
    query = g.tran.query(db.Language).filter_by(_deleted='infinity').all()
    query = orm_to_json(query)
    for item in query:
        data_ru.update({item['key']: item['name_ru']})
        data_kg.update({item['key']: item['name_kg']})
        data_en.update({item['key']: item['name_en']})
    with io.open(LANGUAGE_FOLDER + 'locale-ru.json', 'w+', encoding='utf8') as outfile:
        str_ = json.dumps(data_ru,
                          indent=4, sort_keys=True,
                          separators=(',', ': '), ensure_ascii=False)
        outfile.write(to_unicode(str_))
    #
    with io.open(LANGUAGE_FOLDER + 'locale-en.json', 'w+', encoding='utf8') as outfile2:
        str_ = json.dumps(data_en,
                          indent=4, sort_keys=True,
                          separators=(',', ': '), ensure_ascii=False)
        outfile2.write(to_unicode(str_))
    #
    with io.open(LANGUAGE_FOLDER + 'locale-kg.json', 'w+', encoding='utf8') as outfile3:
        str_ = json.dumps(data_kg,
                          indent=4, sort_keys=True,
                          separators=(',', ': '), ensure_ascii=False)
        outfile3.write(to_unicode(str_))

    # return {"data_ru": data_ru, "data_en":data_en, "data_kg": data_kg}
    return



