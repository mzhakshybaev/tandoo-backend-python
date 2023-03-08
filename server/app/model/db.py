# coding=utf-8
import json

from sqlalchemy import TypeDecorator, PickleType, Column, Numeric, Date, String, func, PrimaryKeyConstraint, types, \
    ForeignKey, \
    DateTime, Integer, Enum, Float, Boolean
from sqlalchemy import text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base, declared_attr
from sqlalchemy.sql.functions import now

Base = declarative_base()


class Json(TypeDecorator):
    impl = JSONB

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(JSONB())
        else:
            return dialect.type_descriptor(PickleType(pickler=json))

    def coerce_compared_value(self, op, value):
        return self.impl.coerce_compared_value(op, value)


class ABSTIME(types.UserDefinedType):
    def get_col_spec(self):
        return 'ABSTIME'

    def bind_processor(self, dialect):
        def process(value):
            return value

        return process

    def result_processor(self, dialect, coltype):
        def process(value):
            return value

        return process


class TableId(Base):
    __tablename__ = 'table_ids'
    seq = Column(Integer, primary_key=True)
    _id = Column(String, unique=True)
    table_name = Column(String, nullable=False)
    created = Column(DateTime, default=func.now())


class Normal(object):
    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower() + 's'

    id = Column(Integer, primary_key=True)


class User(Base, Normal):
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    inn = Column(String)
    fullname = Column(String)
    password = Column(String, nullable=False)
    secure = Column(String, nullable=False)
    role = Column(Integer)
    roles_id = Column(Json, default=[])
    rec_date = Column(DateTime, nullable=False, default=func.now())
    active = Column(Boolean, default=True)
    default_company = Column(String)
    mobilePhone = Column(String)
    roleType = Column(Json)
    position = Column(String)
    company = Column(Json)
    data = Column(Json)


class Token(Base, Normal):
    user_id = Column(Integer, ForeignKey(User.id, ondelete='no action', onupdate='cascade'), nullable=False)
    os = Column(String)
    imei = Column(String, nullable=False)
    token = Column(String, nullable=False)
    dat_rec = Column(DateTime, nullable=False, default=now())


class CouchSync(object):
    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()

    @declared_attr
    def _id(cls):
        return Column(String, ForeignKey(TableId._id, onupdate='cascade', ondelete='cascade'), nullable=False)

    _created = Column(ABSTIME, nullable=False, default=func.now())
    _deleted = Column(ABSTIME, nullable=False, default='infinity')
    _rev = Column(String, nullable=False, default=0)

    @declared_attr
    def edit_user_id(cls):
        return Column(Integer, ForeignKey(User.id, ondelete='no action', onupdate='cascade'))

    @declared_attr
    def __table_args__(cls):
        return PrimaryKeyConstraint('_id', '_created', '_deleted'),


class Replicator(Base, CouchSync):
    history = Column(Json)
    last_seq = Column(Integer)
    replicator = Column(String)
    session_id = Column(String)
    version = Column(String)


class Design(Base, CouchSync):
    language = Column(String)
    views = Column(Json)


class CompanySync(CouchSync):
    company_id = Column(String)


class Log(Base, Normal):
    user_id = Column(String, nullable=False)
    log_time = Column(DateTime, nullable=False, default=func.now())
    api_name = Column(String, nullable=False)
    bag_data = Column(Json)
    data = Column(Json)


class Companies(Base, CouchSync):
    name = Column(String, nullable=False)
    short_name = Column(String)
    user_id = Column(Integer, ForeignKey(User.id, onupdate='cascade', ondelete='no action'))
    company_type = Column(String)
    company_status = Column(String)
    inn = Column(String, nullable=False)
    typeofownership_id = Column(String)
    dircountry_id = Column(String)
    dircoate_id = Column(Json)
    resident_state = Column(String)
    typeofownership = Column(String)
    main_doc_img = Column(Json, default=[])
    main_doc_regulations = Column(Json, default=[])
    role = Column(Integer)
    roles_id = Column(Json, default=[])
    coate = Column(String)
    reason = Column(String)
    coate_name = Column(String)
    end_date = Column(DateTime)
    owner_data = Column(Json)
    data = Column(Json)


class Companybank(Base, CompanySync):
    dirbank_id = Column(String)
    bank_name = Column(String)
    account_number = Column(String, nullable=False)
    bik = Column(String, nullable=False)
    okpo = Column(String)
    data = Column(Json)


class Companyqualification(Base, CompanySync):
    dirtypesofeconomicactivity_id = Column(String)
    volume = Column(String)
    fin_report_img = Column(Json, default=[])
    tax_debt_img = Column(String)
    soc_debt_img = Column(String)
    data = Column(Json)


class Companydocument(Base, CompanySync):
    dirdocument_id = Column(String, nullable=False)
    company_id = Column(String, nullable=False)
    file = Column(String)
    date_start = Column(DateTime, nullable=False, default=func.now())
    date_end = Column(DateTime, nullable=False, default=func.now())
    issuer = Column(String)
    debt = Column(Boolean, default=False)
    data = Column(Json)


class Companyemployees(Base, Normal):
    company_id = Column(String)
    user_id = Column(Integer, ForeignKey(User.id, onupdate='cascade', ondelete='no action'), nullable=False)
    roles_id = Column(String, nullable=True)
    head = Column(Boolean, default=False)
    comm_member = Column(Boolean, default=False)
    data = Column(Json)


class Menus(Base, CouchSync):
    name = Column(String, nullable=False)
    active = Column(Boolean)
    url = Column(String, nullable=False)
    parent_id = Column(String)
    order = Column(Integer)
    visible = Column(Boolean)
    role = Column(Integer)
    roles_id = Column(Json)
    data = Column(Json)


class Api(Base, CouchSync):
    name = Column(String, nullable=False)
    active = Column(Boolean, nullable=False)
    log = Column(Boolean, nullable=False)
    roles_id = Column(Json, nullable=False, default=[])
    data = Column(Json)


class Roles(Base, CouchSync):
    name = Column(String, nullable=False)
    parent_id = Column(String)
    menus_id = Column(Json)
    code = Column(String)
    description = Column(String)
    roletype = Column(Integer)
    data = Column(Json)


class Enums(Base, CouchSync):
    name = Column(String, nullable=False)
    data = Column(Json)


class DirCountry(Base, CouchSync):
    name = Column(String, nullable=False)
    name_kg = Column(String)
    name_en = Column(String)
    code = Column(Json)
    data = Column(Json)


class DirManifacture(Base, CouchSync):
    name = Column(String, nullable=False)
    name_kg = Column(String)
    name_en = Column(String)
    data = Column(Json)


class DirBrand(Base, CouchSync):
    name = Column(String, nullable=False)
    name_kg = Column(String)
    name_en = Column(String)
    data = Column(Json)


class DirDoc(Base, Normal):
    code = Column(String)
    title = Column(String, nullable=False)
    title_kg = Column(String)
    title_en = Column(String)
    description = Column(Json)
    description_kg = Column(Json)
    description_en = Column(Json)
    created_from = Column(ABSTIME, nullable=False, default=func.now())
    is_active = Column(Boolean, default=False)
    files = Column(Json)
    data = Column(Json)


class DirUnits(Base, CouchSync):
    name = Column(String, nullable=False)
    name_kg = Column(String)
    name_en = Column(String)
    code = Column(Numeric, nullable=False)
    short_name = Column(String)
    data = Column(Json)


class DirSection(Base, CouchSync):
    name = Column(String, nullable=False)
    name_kg = Column(String)
    name_en = Column(String)
    dircategories_id = Column(Json, default=[])
    data = Column(Json)


class DirCategory(Base, Normal):
    name = Column(String, nullable=False)
    name_kg = Column(String)
    name_en = Column(String)
    code = Column(String, nullable=False)
    parent_id = Column(String, nullable=False)
    data = Column(Json)


class DirBank(Base, CouchSync):
    name = Column(String, nullable=False)
    name_kg = Column(String)
    name_en = Column(String)
    bik = Column(String, nullable=False)
    bik_swift = Column(String)
    old_bik = Column(String)
    address = Column(String)
    data = Column(Json)


class DirPayment(Base, CouchSync):
    name = Column(String, nullable=False)
    name_kg = Column(String)
    name_en = Column(String)
    data = Column(Json)


class DirDocument(Base, CouchSync):
    name = Column(String, nullable=False)
    name_kg = Column(String)
    name_en = Column(String)
    data = Column(Json)


class DirReportCategories(Base, CouchSync):
    name = Column(String, nullable=False)
    parent_id = Column(String)


class DirReportTemplates(Base, CouchSync):
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)
    template = Column(Json, nullable=False)
    report_category_id = Column(String, nullable=False)


class DirReportQueries(Base, CouchSync):
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)
    query = Column(String, nullable=False)


class Typeofownership(Base, CouchSync):
    name = Column(String, nullable=False)
    name_kg = Column(String)
    name_en = Column(String)
    type_owner = Column(String, nullable=False)
    data = Column(Json)


class DirProcurement(Base, CouchSync):
    name = Column(String, nullable=False)
    name_kg = Column(String)
    name_en = Column(String)
    count = Column(Integer, default=0)
    day_count = Column(Integer, default=0)
    description = Column(String)
    with_concession = Column(Boolean)
    order = Column(Integer, default=0)
    code = Column(String)
    data = Column(Json)


class DirTypesofeconomicactivity(Base, CouchSync):
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)
    name_kg = Column(String)
    name_en = Column(String)
    data = Column(Json)


class DirPosition(Base, CouchSync):
    name = Column(String, nullable=False)
    name_kg = Column(String)
    name_en = Column(String)
    order = Column(Integer)
    data = Column(Json)


class DirSubjects(Base, CouchSync):
    name = Column(String, nullable=False)
    name_kg = Column(String)
    name_en = Column(String)
    order = Column(Integer)
    data = Column(Json)


class Currencies(Base, CouchSync):
    name = Column(String, nullable=False)
    data = Column(Json)


class CurrencyRate(Base, CouchSync):
    currency_date = Column(DateTime)
    currency = Column(String)
    rate = Column(Numeric)


class Product(Base, CouchSync):
    dircategory_id = Column(Integer)
    code = Column(String, nullable=False)
    barcode = Column(String, nullable=False)
    status = Column(Integer, nullable=False)
    image = Column(String)
    images = Column(Json, default=[])
    local = Column(Boolean, default=False)
    data = Column(Json)


class ProductSpec(Base, CouchSync):
    product_id = Column(String, nullable=False)
    specification_id = Column(Integer, nullable=False)
    specification_property_id = Column(Integer, nullable=False)
    specification_property_value_id = Column(Integer, nullable=False)
    data = Column(Json)


class ProductDict(Base, CouchSync):
    product_id = Column(String, nullable=False)
    dirname = Column(String, nullable=False)
    dictionary_id = Column(String, nullable=False)
    data = Column(Json)


class Specification(Base, Normal):
    created_date = Column(DateTime, nullable=False, default=func.now())
    dircategory_id = Column(Integer, nullable=False)
    data = Column(Json)


class SpecificationDictionary(Base, Normal):
    specification_id = Column(Integer, ForeignKey(Specification.id, onupdate='cascade', ondelete='no action'),
                              nullable=False)
    dirname = Column(String, nullable=False)
    name = Column(String, nullable=False)
    roles_id = Column(Json, default=[])
    data = Column(Json)


class SpecificationProperty(Base, Normal):
    specification_id = Column(Integer, ForeignKey(Specification.id, onupdate='cascade', ondelete='no action'),
                              nullable=False)
    order = Column(Integer)
    name = Column(String, nullable=False)
    name_kg = Column(String)
    name_en = Column(String)
    roles_id = Column(Json, default=[])
    data = Column(Json)


class SpecificationPropertyValue(Base, Normal):
    specificationproperty_id = Column(Integer,
                                      ForeignKey(SpecificationProperty.id, onupdate='cascade', ondelete='no action'),
                                      nullable=False)
    name = Column(String, nullable=False)
    name_kg = Column(String)
    name_en = Column(String)
    data = Column(Json)


class Company_product(Base, CouchSync):
    product_id = Column(String, nullable=False)
    company_id = Column(String, nullable=False)
    status = Column(String, nullable=False)
    date_add = Column(DateTime, default=func.now())
    date_update = Column(DateTime)
    unit_price = Column(Float, nullable=False)
    date_end = Column(DateTime)
    data = Column(Json, default={})


class Advert(Base, CouchSync):
    dirsection_id = Column(String, nullable=False)
    code = Column(String)
    dirprocurement_id = Column(String)
    company_id = Column(String, nullable=False)
    status = Column(String, nullable=False)
    created_date = Column(DateTime, nullable=False)
    published_date = Column(DateTime)
    update_date = Column(DateTime, nullable=False)
    step = Column(Float)
    start_date = Column(DateTime)
    deadline = Column(DateTime)
    advert_date = Column(Json, default={})
    reason = Column(String)
    guarantee = Column(Float)
    concession = Column(Float)
    data = Column(Json, default={})


class Advert_lot(Base, CouchSync):
    advert_id = Column(String, nullable=False)
    planid = Column(Integer)
    product_id = Column(Integer)
    lot_id = Column(Integer)
    dircategory_id = Column(Integer, nullable=False)
    quantity = Column(Float, nullable=False)
    dirunits_id = Column(String)
    dirpayment_id = Column(String)
    unit_price = Column(Float, nullable=False)
    budget = Column(Float, nullable=False)
    delivery_place = Column(String, nullable=False)
    estimated_delivery_time = Column(Integer, nullable=False)
    status = Column(String)
    reason = Column(String)
    data = Column(Json, default={})


class Advert_lot_specification(Base, CouchSync):
    advert_lot_id = Column(String, nullable=False)
    specification_id = Column(Integer, nullable=False)
    specification_property_id = Column(Integer, nullable=False)
    specification_property_value_id = Column(Integer, nullable=False)
    data = Column(Json, default={})


class Advert_lot_dictionaries(Base, CouchSync):
    advert_lot_id = Column(String, nullable=False)
    dirname = Column(String, nullable=False)
    dictionary_id = Column(String, nullable=False)
    data = Column(Json)


class Application(Base, CouchSync):
    advert_lot_id = Column(String, nullable=False)
    product_id = Column(Integer)
    lot_id = Column(Integer)
    unit_price = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    company_id = Column(String, nullable=False)
    company_product_id = Column(String, nullable=False)
    code = Column(String)
    reason = Column(String)
    status = Column(String, nullable=False)
    deadline = Column(ABSTIME, default=func.now())
    signed = Column(Boolean)
    selected = Column(Boolean, default=False)
    data = Column(Json, default={})


class SmsOutbox(Base, Normal):
    source_addr = Column(String(20))
    dest_addr = Column(String(20), index=True)
    msg = Column(String)
    rec_date = Column(DateTime, server_default=text('current_timestamp'))


class Notification(Base, Normal):
    user_id = Column(Integer, ForeignKey(User.id, onupdate='cascade', ondelete='no action'), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String)
    notification_status = Column(Enum('active', 'read', 'canceled', name="notification_status"), nullable=False,
                                 default='active')
    datetime = Column(ABSTIME, nullable=False, default=func.now())
    company_id = Column(String)
    data = Column(Json, nullable=False, default={})


class AdminNotification(Base, CouchSync):
    title = Column(String, nullable=False)
    # date_created = Column(ABSTIME, default=func.now())
    date_updated = Column(ABSTIME)
    content = Column(Json, nullable=False)
    role_id = Column(String)  # can not , ForeignKey(Roles._id, onupdate='cascade', ondelete='no action'))


class Contract(Base, Normal):
    code = Column(String, nullable=False)
    status = Column(String, nullable=False)
    advert_id = Column(String, nullable=False)
    purchaser_company_id = Column(String, nullable=False)
    supplier_company_id = Column(String, nullable=False)
    dirsection_id = Column(String, nullable=False)
    total = Column(Float, nullable=False)
    created_date = Column(DateTime, default=func.now())
    updated_date = Column(DateTime)
    date_pur_submit = Column(DateTime)
    date_sup_submit = Column(DateTime)
    date_canceled = Column(DateTime)
    who_canceled = Column(String)
    comment = Column(Json, default=[])
    data = Column(Json, nullable=False, default={})


class ContractLots(Base, Normal):
    status = Column(String, nullable=False)
    contract_id = Column(Integer, nullable=False)
    advert_lot_id = Column(String, nullable=False)
    application_id = Column(String, nullable=False)
    data = Column(Json)


class Protocol(Base, Normal):
    advert_lot_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String)
    datetime = Column(ABSTIME, nullable=False, default=func.now())
    data = Column(Json, nullable=False, default={})


class Message(Base, CouchSync):
    dircategory_id = Column(String)
    message_status = Column(
        Enum('new', 'answered', 'reopened', 'closed', name="message_status"),
        nullable=False, default='new')
    message = Column(Json)
    company_id = Column(String)
    manufacturer = Column(String)
    brand = Column(String)
    data = Column(Json, nullable=False, default={})


class Comments(Base, CouchSync):
    message_id = Column(String, nullable=False)
    comment = Column(String, nullable=False)
    company_id = Column(String)
    data = Column(Json)


# Новости
class New(Base, CouchSync):
    title = Column(String, nullable=False)
    title_kg = Column(String)
    title_en = Column(String)
    description = Column(Json)
    description_kg = Column(Json)
    description_en = Column(Json)
    created_from = Column(ABSTIME, nullable=False, default=func.now())
    is_active = Column(Boolean, default=False)
    files = Column(Json)
    data = Column(Json)


class UserQuery(Base, CouchSync):
    title = Column(String, nullable=False)
    description = Column(Json)
    created_from = Column(ABSTIME, nullable=False, default=func.now())
    is_active = Column(Boolean, default=False)
    files = Column(Json)
    data = Column(Json)


class UserQueryComment(Base, CouchSync):
    userquery_id = Column(String, nullable=False)
    comment = Column(String, nullable=False)
    files = Column(Json)
    data = Column(Json)


class Invoice(Base, Normal):
    status = Column(String)
    contract_id = Column(Integer, nullable=False)
    advert_id = Column(String, nullable=False)
    purchaser_company_id = Column(String, nullable=False)
    supplier_company_id = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    type = Column(String, nullable=False)
    editable = Column(Boolean, nullable=False)
    percent = Column(Float, nullable=False)
    amount = Column(Float, nullable=False)
    created_date = Column(DateTime, default=func.now())
    updated_date = Column(DateTime)
    conditions = Column(String)
    data = Column(Json, nullable=False, default={})


class Consignment(Base, Normal):
    number = Column(String)
    date_number = Column(DateTime)
    advert_id = Column(String, nullable=False)
    contract_id = Column(Integer, nullable=False)
    purchaser_company_id = Column(String, nullable=False)
    supplier_company_id = Column(String, nullable=False)
    sent_status = Column(Boolean)
    got_status = Column(Boolean)
    address = Column(String)
    conditions = Column(String)
    date_to = Column(Date)
    date_from = Column(Date)
    comment = Column(Json)
    data = Column(Json, nullable=False, default={})


class ConsignmentLots(Base, Normal):
    status = Column(String)
    consignment_id = Column(Integer, nullable=False)
    advert_lot_id = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float)
    total = Column(Float)
    data = Column(Json)


class DirCoate(Base, Normal):
    name = Column(String, nullable=False)
    name_kg = Column(String)
    name_en = Column(String)
    center = Column(String)
    code = Column(String, nullable=False)
    parent_id = Column(Integer)
    data = Column(Json)


class CompanyDoc(Base, CouchSync):
    file_name = Column(String)
    company_id = Column(String, nullable=False)
    file = Column(String)
    data = Column(Json)


class ESP(Base, CouchSync):
    name = Column(String)
    name_en = Column(String)
    name_kg = Column(String)


class DirBranch(Base, CouchSync):
    name = Column(String)
    esp_id = Column(String)
    address = Column(String)
    contact = Column(String)
    email = Column(String)


class NotificationCompany(Base, Normal):
    company_id = Column(String)
    type = Column(String)
    title = Column(String, nullable=False)
    title_kg = Column(String)
    title_en = Column(String)
    description = Column(String)
    description_kg = Column(String)
    description_en = Column(String)
    notification_status = Column(Enum('active', 'read', 'canceled', name="notification_status"), nullable=False,
                                 default='active')
    datetime = Column(ABSTIME, nullable=False, default=func.now())
    data = Column(Json, nullable=False, default={})


class Language(Base, Normal):
    key = Column(String, nullable=False)
    name_ru = Column(String)
    name_en = Column(String)
    name_kg = Column(String)
    data = Column(Json)


class Instructions(Base, CouchSync):
    name = Column(String)
    name_en = Column(String)
    name_kg = Column(String)
    data = Column(Json)


class DescInstructions(Base, CouchSync):
    instructions_id = Column(String, nullable=False)
    description = Column(String)
    description_kg = Column(String)
    description_en = Column(String)
    name = Column(String)
    name_en = Column(String)
    name_kg = Column(String)
    data = Column(Json)


class RutokenAuth(Base, Normal):
    session = Column(String)
    identity = Column(String)
    create_date = Column(ABSTIME, nullable=False, default=func.now())
    data = Column(Json)


class RutokenSession(Base, Normal):
    session = Column(String)
    identity = Column(String)
    taxpayerIdentNum = Column(String)
    personalIdentNum = Column(String)
    sign = Column(String)
    create_date = Column(ABSTIME, nullable=False, default=func.now())
    data = Column(Json)
