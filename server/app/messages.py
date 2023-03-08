# coding=utf-8
__author__ = 'Jaynakus'

KEY_ERROR = -100

OK = 0
GENERIC_ERROR = 1
NO_RECORD = 2
MULTI_RECORD = 3
NO_DOC_TEMPLATE_CODE = 4
NO_DOC_TEMPLATE = 5
NO_DATA = 6
BRANCH_NOT_FOUND = 7
NO_CURRENCY_RATE = 8

USER_ALREADY_EXISTS = 101
USER_NOT_FOUND = 102
WRONG_PASSWORD = 103
USER_NOT_ACTIVE = 104
USER_BLOCKED = 105
BASE_ACCOUNT_NOT_FOUND = 106
USER_NOT_AUTHORIZED = 107
PRODUCT_INFO_NOT_FOUND = 108
PRODUCT_OPERATION_INFO_NOT_FOUND = 109
LICENSE_NOT_FOUND = 110
USER_NO_ACCESS = 111
PASSWORDS_NOT_MATCHED = 112
USER_EMAIL_ALREADY_EXISTS = 113
USER_PHONE_ALREADY_EXISTS = 114
USER_INN_ALREADY_EXISTS = 115
WRONG_CONFIRM_CODE = 116
WRONG_EMAIL = 117
DO_NOT_MATCH_PASSWORDS = 118
PASSWORD_MUSTBE_MORE_THAN_6_SYMBOLS = 119
USER_WITH_PHONE_AND_EMAIL_NOT_FOUND = 120
CYRILLIC_LOGIN = 121
DIGIT_FULL_NAME = 122
SYMBOL_FULL_NAME = 123
LATIN_FULL_NAME = 124
PASSWORD_MUSTBE_LATIN_AND_DIGIT = 125
CYRILLIC_PASSWORD = 126

COMPANY_ALREADY_EXISTS = 201
COMPANY_NOT_FOUND = 202
ACCOUNT_HAS_BALANCE = 203
DEBIT_ACCOUNT_NOT_GIVEN = 204
CREDIT_ACCOUNT_NOT_GIVEN = 205
MULTI_CURRENCY_OPERATION_DENIED = 206
TURNOVER_NOT_FOUND = 207
NOT_ENOUGH_PARAMETER = 208
ACCOUNT_INFO_NOT_FOUND = 209
ACCOUNT_NEGATIVE_BALANCE = 210
ACCOUNT_IS_BLOCKED = 211
BOOKKEEPING_TEMPLATE_NOT_FOUND = 212
ACCOUNT_BALANCE_IS_MINUS = 213
TABLE_NOT_FOUND = 214
DEBT_INFO_NOT_FOUND = 215
ACCESS_RESTRICTED = 216
API_NOT_ACTIVE = 217

CLIENT_WITH_THESE_PARAMS_ALREADY_EXISTS = 300
CLIENT_NOT_DEFINED = 301
CLIENT_INCORRECT_AGE = 302
CLIENT_NOT_FOUND = 303

PAYMENT_PLAN_DATE_ERROR = 400
TOTAL_PRINCIPAL_AMOUNT_IS_BIGGER_THAN_LOAN_AMOUNT = 401
GROUP_NAME_EXISTS = 405
LOAN_ALREADY_ISSUED = 403
LOAN_ISSUE_DATE_ERROR = 404
GUARANTORS_NOT_ENOUGH = 405
COLLATERALS_NOT_ENOUGH = 406
PAYMENT_PLAN_PREVIOUS_AND_NEXT_INSTALLMENT_DATES_ARE_SAME = 407
LOAN_IS_CLOSED = 408
PAYMENT_PLAN_IS_NOT_INDIVIDUAL = 409
LOAN_STATUS_MUST_BE_ISSUED = 410
QUARTER_PAYMENT_PLAN_PERIOD_ERROR = 411
EARLY_PAYMENT_AMOUNT_IS_TOO_BIG = 412
PAYMENT_PLAN_IS_NOT_GENERATED = 423
CLIENT_DOUBLE_APPLICATION_ONE_DAY = 430
INSTALLMENT_DATE_ERROR = 431
LOAN_NOT_FOUND_BY_CLIENT = 432
LOAN_NOT_FOUND = 433

NO_EDUCATION_VALUE = 500
NO_MARITAL_STATUS = 501

FILE_NOT_TRANSFERRED = 600

NOT_ACTIVE_COMMITTEE_MEMBER = 700

EMPLOYEE_NOT_FOUND = 800
EMPLOYEE_EXIST = 801

DOCUMENT_TYPE_UNDEFINED = 802

NEWS_NOT_FOUND = 900

MESSAGE = {
    USER_ALREADY_EXISTS: u'Пользователь с таким логином уже существует',
    USER_EMAIL_ALREADY_EXISTS: u'Данное наименование почты уже зарегистрировано, просим ввести свою почту '
                               u'либо обратиться в Администрацию Каталога',
    USER_PHONE_ALREADY_EXISTS: u'Введенный вами номер уже зарегистрирован, '
                               u'просим ввести свой номер либо обратиться в Администрацию Каталога',
    USER_INN_ALREADY_EXISTS: u'Пользователь с таким ИНН уже существует',
    WRONG_EMAIL: u"Неправильный адрес электронной почты",
    DO_NOT_MATCH_PASSWORDS: u"Пароли не совпадают",
    PASSWORD_MUSTBE_MORE_THAN_6_SYMBOLS: u"Пароль должен быть больше 6 символов",
    PASSWORD_MUSTBE_LATIN_AND_DIGIT: u"Пароль должен состоит из латинских букв и цифр",
    USER_NOT_FOUND: u'Пользователь не найден',
    USER_WITH_PHONE_AND_EMAIL_NOT_FOUND: u'Пользователь с такими email и номером телефона не найден',
    WRONG_PASSWORD: u'Неверный пароль',
    PASSWORDS_NOT_MATCHED: u'Пароли не совподают',
    USER_NOT_ACTIVE: u'Пользователь не активен',
    USER_BLOCKED: u'Пользователь заблокирован',
    COMPANY_ALREADY_EXISTS: u'Компания с таким email уже существует',
    BASE_ACCOUNT_NOT_FOUND: u'Базовый счет не найден',
    COMPANY_NOT_FOUND: u'Компания не найдена',
    ACCOUNT_HAS_BALANCE: u'Счет имеет остаток',
    DEBIT_ACCOUNT_NOT_GIVEN: u'Счет дебет не задан',
    CREDIT_ACCOUNT_NOT_GIVEN: u'Счет кредит не задан',
    MULTI_CURRENCY_OPERATION_DENIED: u'Мультивалютная операция не разрешена',
    NOT_ENOUGH_PARAMETER: u'Недостаточно параметров',
    TURNOVER_NOT_FOUND: u'Проводка не найдена',
    GENERIC_ERROR: u'{}',
    NO_CURRENCY_RATE: u"Курс не указан для выбранной валюты",
    USER_NOT_AUTHORIZED: u'Пользователь не авторизован',
    USER_NO_ACCESS: u'Недостаточно прав',
    CLIENT_WITH_THESE_PARAMS_ALREADY_EXISTS: u'Клиент с такими параметрами уже существует',
    KEY_ERROR: u'Недостаточно параметра {}',
    PAYMENT_PLAN_DATE_ERROR: u'Неверная дата в графике платежей',
    CLIENT_NOT_DEFINED: u'Клиент не определен',
    CLIENT_INCORRECT_AGE: u'Неверный возраст клиента',
    CLIENT_NOT_FOUND: u'Клиент не найден',
    TOTAL_PRINCIPAL_AMOUNT_IS_BIGGER_THAN_LOAN_AMOUNT: u'Общая сумма ОД не может быть больше суммы кредита',
    PAYMENT_PLAN_IS_NOT_GENERATED: u'PAYMENT_PLAN_IS_NOT_GENERATED',
    ACCOUNT_INFO_NOT_FOUND: u'Информация по счету не найдена',
    ACCOUNT_NEGATIVE_BALANCE: u'Красное салдьдо',
    ACCOUNT_IS_BLOCKED: u'Счет заблокирован',
    PRODUCT_OPERATION_INFO_NOT_FOUND: u'PRODUCT_OPERATION_INFO_NOT_FOUND',
    PRODUCT_INFO_NOT_FOUND: u'PRODUCT_INFO_NOT_FOUND',
    BOOKKEEPING_TEMPLATE_NOT_FOUND: u'BOOKKEEPING_TEMPLATE_NOT_FOUND',
    LOAN_ALREADY_ISSUED: u'LOAN_ALREADY_ISSUED',
    LOAN_ISSUE_DATE_ERROR: u'LOAN_ISSUE_DATE_ERROR',
    GROUP_NAME_EXISTS: u'GROUP_NAME_EXISTS',
    COLLATERALS_NOT_ENOUGH: u'Не достаточно залога',
    GUARANTORS_NOT_ENOUGH: u'Не достаточно поручителей',
    PAYMENT_PLAN_PREVIOUS_AND_NEXT_INSTALLMENT_DATES_ARE_SAME: u'PAYMENT_PLAN_PREVIOUS_AND_NEXT_INSTALLMENT_DATES_ARE_SAME',
    ACCOUNT_BALANCE_IS_MINUS: u'ACCOUNT_BALANCE_IS_MINUS',
    LOAN_IS_CLOSED: u'Кредит закрыт',
    PAYMENT_PLAN_IS_NOT_INDIVIDUAL: u'PAYMENT_PLAN_IS_NOT_INDIVIDUAL',
    LOAN_STATUS_MUST_BE_ISSUED: u'Статус кредита должен быть ВЫДАН',
    QUARTER_PAYMENT_PLAN_PERIOD_ERROR: u'График не может быть сформировани для выбранного срока',
    EARLY_PAYMENT_AMOUNT_IS_TOO_BIG: u'Сумма частичного погашения достаточно для закрытия кредита',
    NO_DOC_TEMPLATE_CODE: u'Код шаблона не существует',
    NO_DOC_TEMPLATE: u'Шаблон документа не существует',
    CLIENT_DOUBLE_APPLICATION_ONE_DAY: u'Нельзя выполнить более чем одну заявку для клиента в один день',
    WRONG_CONFIRM_CODE: u"Неверно указан код подтверждения",
    CYRILLIC_LOGIN: u"Логин не должен включать кириллицу",
    CYRILLIC_PASSWORD: u"Пароль не должен включать кириллицу",
    DIGIT_FULL_NAME: u"ФИО не должен включать цифры",
    SYMBOL_FULL_NAME: u"ФИО не должен включать знаки",
    LATIN_FULL_NAME: u"ФИО не должен включать латинские буквы",
    DEBT_INFO_NOT_FOUND: u'Не все данные по задолженностям введены у организации',
    ACCESS_RESTRICTED: u'Пользователь не имеет права',
    API_NOT_ACTIVE: u'Недоступен',
    # scoring
    NO_EDUCATION_VALUE: u'У клиента не указано образование',
    NO_MARITAL_STATUS: u'У клиента не указано семейное положение',
    NO_DATA: u'Нет данных',
    INSTALLMENT_DATE_ERROR: u'INSTALLMENT_DATE_ERROR',
    FILE_NOT_TRANSFERRED: u"Ошибка передачи файла",
    NOT_ACTIVE_COMMITTEE_MEMBER: u"Вы не активный член комитета",

    BRANCH_NOT_FOUND: u"Указаный филиал не найден",
    LOAN_NOT_FOUND_BY_CLIENT: u"Кредит не найден по указанному клиенту",
    LOAN_NOT_FOUND: u"Кредит не найден",

    EMPLOYEE_NOT_FOUND: u"Сотрудник не найден",
    EMPLOYEE_EXIST: u"Сотрудник уже есть",

    TABLE_NOT_FOUND: u"Таблица не найдена",
    DOCUMENT_TYPE_UNDEFINED: u'Тип документа не определен',

    NEWS_NOT_FOUND: u"{0} - не найден"
}
