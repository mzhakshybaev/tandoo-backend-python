# coding=utf-8
import re

from datetime import datetime, timedelta
from random import randint

from flask import g

GENERIC_DOMAINS = "aero", "asia", "biz", "cat", "com", "coop", \
                  "edu", "gov", "info", "int", "jobs", "mil", "mobi", "museum", \
                  "name", "net", "org", "pro", "tel", "travel"


def is_valid_email(email_address, domains=GENERIC_DOMAINS):
    """Checks for a syntactically invalid email address."""

    # Email address must be 7 characters in total.
    if len(email_address) < 7:
        return False  # Address too short.

    # Split up email address into parts.
    try:
        local_part, domain_name = email_address.rsplit('@', 1)
        host, top_level = domain_name.rsplit('.', 1)
    except ValueError:
        return False  # Address does not have enough parts.

    # Check for Country code or Generic Domain.
    if len(top_level) != 2 and top_level not in domains:
        return False  # Not a domain name.

    for i in '-_.%+.':
        local_part = local_part.replace(i, "")
    for i in '-_.':
        host = host.replace(i, "")

    match = re.match('^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', email_address)
    if not match:
        return False

    if local_part.isalnum() and host.isalnum():
        return True  # Email address is fine.
    else:
        return False  # Email address has funny characters.


def has_cyrillic(text):
    return bool(re.search(u'[а-яА-Я]', text))


def has_latin(text):
    return bool(re.search('[a-zA-Z]', text))


def has_digit(text):
    return bool(re.search(r'\d', text))


def has_symbol(text):
    return bool(re.search('[~!@#$%^&*()_+|~\-=`{}\[\]:\'";<>?,.]', text))


def get_code():
    period_advert = datetime.now().strftime("%y%m%d")
    stt = g.redis.incr(period_advert)
    return period_advert + str(stt).zfill(3)


def get_code_consignment():
    period_advert = datetime.now().strftime("%m%d")
    stt = g.redis.incr(period_advert)
    return period_advert + str(stt).zfill(2)


def get_code_application(code):
    stt = g.redis.incr(code)
    return code + str(stt).zfill(3)


def get_datetime(date_string, date_format='%Y-%m-%d', time_zone=False):
    dt = datetime.strptime(date_string, date_format)
    if time_zone:
        dt = dt + timedelta(hours=6)
    return dt


def get_salt_string(p_length=5):
    chars_list = map(chr, range(97, 123))
    salt_string = ''
    for num in range(0, p_length):
        salt_string += chars_list[randint(0, 25)]

    return salt_string
