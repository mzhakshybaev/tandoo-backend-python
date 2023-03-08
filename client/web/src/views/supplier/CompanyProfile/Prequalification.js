import React, {Component} from 'react'
import {Card, CardBody, CardHeader, Col, Collapse, FormGroup, ListGroup, Row} from "reactstrap";
import {FGI} from "components/AppInput";
import Select from "components/Select";
import Hoc from 'components/Hoc'
import {inject, observer} from 'mobx-react'
import Button from "components/AppButton";
import Table from "components/AppTable";
import ImageInput from "components/ImageInput";
import {Input} from "reactstrap/dist/reactstrap";
import {IMAGES_URL} from "utils/common";
import {showError, showSuccess} from "utils/messages";
import {translate} from "react-i18next";

@translate(['common', 'settings', ''])
@inject('adminStore', 'dictStore', "supplierStore", "mainStore") @observer
class Prequalification extends Component {
  state = {
    resident_state: '',
    ownership_type: '',
    finReportPreview: null,
    fin_report_image: null,
    reportPreview: null,
    report: null,
    supplies: [],
    experiences: [],
    certificates: [],
    compData: [],
    ea_types: [], ea_type: null,
    _id: null,
    // supplies
    goods_type: '',
    date_contract: '',
    buyer_info: '',
    cost: '',
    // experience
    office: '',
    fio: '',
    gen_expr: '',
    sup_expr: '',
    // registration certificates
    certNumber: '',
    certIssuer: '',
    certName: '',
    collapseExpr: false,
    collapseSupplies: false,
    collapseCert: false,
    company: null,
  };

  componentDidMount() {
    this.props.dictStore.getDictData2({type: 'DirTypesofeconomicactivity'}).then(r => {
      this.setState({ea_types: r});
    });
    let {company} = this.props;
    this.getCompanyData(company);
    if (company) {
      let param = {company_id: company._id, with_releated: true}
      this.props.supplierStore.getCompanyQual(param).then(qual => {
        console.log('qqq', qual);
        this.setState({
          company,
          // supplies: qual.data && qual.data.supplies || [],
          // experiences: qual.data && qual.data.experiences || [],
          certificates: qual.data && qual.data.certificates || [],
          _id: qual._id,
          _rev: qual._rev,
        })
      })
    }

    let compData = {
      "id": 76317244,
      "inn": "00708201710169",
      "rni": null,
      "titleRu": "Общество с ограниченной ответственностью \"ИВТ Лаб\"",
      "titleKy": null,
      "titleEn": null,
      "legalAddress": "г.Бишкек, ул. Логвиненко 27/2",
      "factAddress": "г.Бишкек, ул. Логвиненко 27/2",
      "website": "ubtlab.kg",
      "postalCode": null,
      "workPhone": "+996 (709) 90-54-44",
      "dateCreated": "01.11.2017",
      "notes": null,
      "bank": {
        "accountNumber": "1180000098504922",
        "bik": "118005",
        "bank": {
          "name": "Закрытое акционерное общество \"Демир Кыргыз Интернэшнл банк\"",
          "address": "720040, г.Бишкек, пр. Чуй,245",
          "phoneNumber": "610610",
          "numberOfSubDivisions": 7,
          "email": "dkib@demirbank.kg",
          "website": "www.demirbank.kg"
        },
        "bankName": null,
        "paymentTerms": null
      },
      "ate": {
        "code": "41711000000000",
        "nameRu": "Бишкек",
        "nameKg": "Бишкек",
        "nameEn": "Бишкек",
        "parent": {
          "code": "41700000000000",
          "nameRu": "Кыргызская Республика",
          "nameKg": "Кыргыз Республикасы",
          "nameEn": "Кыргыз Республикасы",
          "parent": null
        }
      },
      "form": {
        "id": 3,
        "titleRu": "Общество с ограниченной ответственностью",
        "titleKy": "Общество с ограниченной ответственностью",
        "titleEn": "Limited liability company",
        "role": {
          "id": 2,
          "title": "supplier",
          "titleRu": "Мэнеджер\r\n",
          "description": "Supplier",
          "isPublic": true,
          "roleType": "SUPPLIER"
        }
      },
      "country": {
        "id": 225,
        "titleRu": "Кыргызская Республика",
        "titleKy": "Кыргызская Республика",
        "titleEn": "Kyrgyzstan",
        "isoCode": "417",
        "sorting": null
      }
    }

    this.setState({compData});
  }

  getCompanyData(company) {
    let store = this.props.adminStore;
    store.getData({
      type: "DirTypesofeconomicactivity",
      id: company && company.companuqualifications ? company.companuqualifications[0].dirtypesofeconomicactivity_id : 0
    }).then(r => {
      this.setState({ea_type: r});
    });
  }

  handleFiles(imgName, previewName, file) {
    let model = {};
    model[previewName] = file.base64;
    this.setState(model);
    this.props.supplierStore.uploadImage(file.base64.split(',')[1]).then(r => {
      let model = {};
      model[imgName] = r.file;
      this.setState(model)
    })
  }

  addSupplyData = () => {
    let supplyData = {
      goods_type: this.state.goods_type,
      date_contract: this.state.date_contract,
      buyer_info: this.state.buyer_info,
      cost: this.state.cost
    };
    this.setState({supplies: [...this.state.supplies, supplyData]});
    this.setState({goods_type: '', date_contract: '', buyer_info: '', cost: '', report: null, reportPreview: null});
  };

  addExprData = () => {
    let exprData = {
      office: this.state.office,
      fio: this.state.fio,
      gen_expr: this.state.gen_expr,
      sup_expr: this.state.sup_expr
    };
    this.setState({experiences: [...this.state.experiences, exprData]});
    this.setState({office: '', fio: '', gen_expr: '', sup_expr: ''});
  };

  addRegCerts = () => {
    let certData = {
      number: this.state.certNumber,
      issueDate: this.state.certIssueDate,
      issuer: this.state.certIssuer,
      name: this.state.certName
    };
    this.setState({certificates: [...this.state.certificates, certData]});
    this.setState({certNumber: '', certIssueDate: '', certIssuer: '', certName: ''});
  };

  get isResident() {
    let {resident_state: rs} = this.state;
    return rs && (rs === 'resident');
  }

  get isIP() {
    let {resident_state: rs, ownership_type: ot} = this.state;
    return ot && (rs === 'resident') && (ot === 'ip');
  }

  get isOrg() {
    let {resident_state: rs, ownership_type: ot} = this.state;
    return ot && (rs === 'resident') && (ot === 'org');
  }

  saveHandler = async () => {
    const ifRes = (yes, no) => this.isResident ? yes : no;
    const ifIP = (yes, no) => this.isIP ? yes : no;
    const state = this.state;
    let params = {
      company_id: state.company._id,
      _id: state._id,
      _rev: state._rev,
      dirtypesofeconomicactivity_id: state.ea_type._id,
      data: {
        supplies: ifRes(state.supplies, []),
        certificates: state.certificates,
      }
    };

    try {
      await this.props.supplierStore.saveCompanyQual(params);
      showSuccess('Успешно сохранено!');
    } catch (e) {
      console.error(e);
      showError(e.message)
    }
  };

  render() {
    const {t} = this.props;
    const {mainStore} = this.props;
    const {compData} = this.state;
    const {language} = mainStore;
    let label = 'name';
    if (language && language.code !== 'ru') {
      label = [label, language.code].join('_')
    }
    return (
      <Hoc>
        <h2 className="text-center">{t('Предквалификационная форма поставщика')}</h2>
        <>
          <Row>
            <Col md={12}>
              <h6>
                <strong>{t('Форма собственности')}: </strong>
                <span></span>
              </h6>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <h6>
                <strong>{t('ИНН организации')}: </strong>
                <span>{compData.inn}</span>
              </h6>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <h6>
                <strong>{t('Дата регистрации')}: </strong>
                <span>{compData.dateCreated}</span>
              </h6>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <h6>
                <strong>{t('Наименование организации')}: </strong>
                <span>{compData.titleRu}</span>
              </h6>
            </Col>
          </Row>
          {compData.country &&
          <Row>
            <Col md={12}>
              <h6>
                <strong>{t('Страна')}: </strong>
                <span>{compData.country.titleRu}</span>
              </h6>
            </Col>
          </Row>}
          <Row>
            <Col md={12}>
              <h6>
                <strong>{t('Юридический адрес')}: </strong>
                <span>{compData.legalAddress}</span>
              </h6>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <h6>
                <strong>{t('Фактический адрес')}: </strong>
                <span>{compData.factAddress}</span>
              </h6>
            </Col>
          </Row>
          {compData.ate &&
          <Row>
            <Col md={12}>
              <h6>
                <strong>{t('Населенный пункт')}: </strong>
                <span>{compData.ate.nameRu}</span>
              </h6>
            </Col>
          </Row>}
          {compData.bank &&
          <>
            <Row>
              <Col md={12}>
                <h6>
                  <strong>{t('Банк')}: </strong>
                  <span>{compData.bank.bank.name}</span>
                </h6>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <h6>
                  <strong>{t('БИК')}: </strong>
                  <span>{compData.bank.bik}</span>
                </h6>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <h6>
                  <strong>{t('Р/счет')}: </strong>
                  <span>{compData.bank.accountNumber}</span>
                </h6>
              </Col>
            </Row>
          </>}
          {compData.workPhone &&
          <Row>
            <Col md={12}>
              <h6>
                <strong>{t('Рабочий телефон')}: </strong>
                <span>{compData.workPhone}</span>
              </h6>
            </Col>
          </Row>}
        </>
        <Hoc>
          <FGI l={t('Вид экономической деятельности')} lf={3} ls={6} className="mt-2" required>
            <Select options={this.state.ea_types} placeholder={t('Выберите')}
                    labelKey={label} value={this.state.ea_type}
                    onChange={value => this.setState({ea_type: value})}
            />
          </FGI>
          <>
            {/*<Card className={"mt-4"}>*/}
            {/*  <CardHeader>*/}
            {/*    {t('Сведения о выполненных поставках товаров')}*/}
            {/*    <div className="card-actions">*/}
            {/*      <Button onClick={() => this.setState({collapseSupplies: !this.state.collapseSupplies})}>*/}
            {/*        <i className="fa fa-plus"/>*/}
            {/*      </Button>*/}
            {/*    </div>*/}
            {/*  </CardHeader>*/}
            {/*  <CardBody>*/}
            {/*    <Collapse isOpen={this.state.collapseSupplies}>*/}
            {/*      {this.renderSupplies()}*/}
            {/*    </Collapse>*/}
            {/*    <Table data={this.state.supplies}*/}
            {/*           pageSize={Math.max(2, this.state.supplies.length)}*/}
            {/*           filterable={false}*/}
            {/*           showPagination={false}*/}
            {/*           showRowNumbers={true}*/}
            {/*           columns={[*/}
            {/*             {Header: t("Наименование товара"), accessor: "goods_type"},*/}
            {/*             {Header: t("Дата выполнения договора"), accessor: "date_contract"},*/}
            {/*             {Header: t("Покупатель (наименование,адрес,контактные телефоны)"), accessor: "buyer_info",},*/}
            {/*             {Header: t("Стоимость договора, тыс. сом"), accessor: "cost",},*/}
            {/*           ]}/>*/}
            {/*  </CardBody>*/}
            {/*</Card>*/}

            {/*<Card>*/}
            {/*  <CardHeader>*/}
            {/*    {t('Квалификация и опыт работников ключевых должностей Поставщика')}*/}
            {/*    <div className="card-actions">*/}
            {/*      <Button onClick={() => this.setState({collapseExpr: !this.state.collapseExpr})}>*/}
            {/*        <i className="fa fa-plus"/>*/}
            {/*      </Button>*/}
            {/*    </div>*/}
            {/*  </CardHeader>*/}
            {/*  <CardBody>*/}
            {/*    <Collapse isOpen={this.state.collapseExpr}>*/}
            {/*      {this.renderExperiences()}*/}
            {/*    </Collapse>*/}
            {/*    <Table data={this.state.experiences}*/}
            {/*           pageSize={Math.max(2, this.state.experiences.length)}*/}
            {/*           filterable={false}*/}
            {/*           showPagination={false}*/}
            {/*           showRowNumbers={true}*/}
            {/*           columns={[*/}
            {/*             {Header: t("Должность"), accessor: "office"},*/}
            {/*             {Header: t("ФИО"), accessor: "fio"},*/}
            {/*             {Header: t("Общий опыт работы(лет)"), accessor: "gen_expr",},*/}
            {/*             {Header: t("Опыт работы в качестве Поставщика (лет)"), accessor: "sup_expr"},*/}
            {/*           ]}/>*/}
            {/*  </CardBody>*/}
            {/*</Card>*/}
          </>
          <Card>
            <CardHeader>
              {t('Свидетельство о регистрации')}
              <div className="card-actions">
                <Button onClick={() => this.setState({collapseCert: !this.state.collapseCert})}>
                  <i className="fa fa-plus"/>
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <Collapse isOpen={this.state.collapseCert}>
                {this.renderRegCertificates()}
              </Collapse>
              <Table data={this.state.certificates}
                     pageSize={Math.max(5, this.state.certificates.length)}
                     filterable={false}
                     showPagination={false}
                     showRowNumbers={true}
                     columns={[
                       {Header: t("Серия и номер"), accessor: "number"},
                       {Header: t("Дата выдачи"), accessor: "issueDate"},
                       {Header: t("Орган выдавший"), accessor: "issuer",},
                       {Header: t("Наименование"), accessor: "name"},
                     ]}/>
            </CardBody>
          </Card>

          <Col sm={12} md={12}>
            <Row>
              <Col md={6} xs={12} className="d-flex align-items-end">
                <Button className="primary" title={t('Отправить на одобрение')}
                        disabled={!(this.state.finReportPreview)}>
                  {t('Отправить на одобрение')}
                </Button>
              </Col>
              <Col md={6} xs={12} className="d-flex align-items-end">
                <Button className="primary" title={t('Сохранить')}
                        onClick={this.saveHandler}
                        disabled={!(this.state.ea_type)}>
                  {t('Сохранить')}
                </Button>
              </Col>
            </Row>
          </Col>
        </Hoc>
      </Hoc>
    )
  }

  renderSupplies = () => {
    const {t} = this.props;
    return (
      <div className="animated fadeIn">
        <FormGroup>
          <Row>
            <Col>
              <FGI l={t('Наименование договора')} lf={3} ls={9} className="mt-2" required>
                <Input type={"text"} value={this.state.goods_type}
                       onChange={(elem) => this.setState({goods_type: elem.target.value})}/>
              </FGI>
              <FGI l={t('Дата выполнения договора')} lf={3} ls={9} className="mt-2" required>
                <Input type={"text"} value={this.state.date_contract}
                       onChange={(elem) => this.setState({date_contract: elem.target.value})}/>
              </FGI>
              <FGI l={t('Покупатель (наименование,адрес,контактные телефоны)')} lf={3} ls={9} className="mt-2" required>
                <Input type={"text"} value={this.state.buyer_info}
                       onChange={(elem) => this.setState({buyer_info: elem.target.value})}/>
              </FGI>
              <FGI l={t('Стоимость договора, тыс. сом')} lf={3} ls={9} className="mt-2" required>
                <Input type={"text"} value={this.state.cost}
                       onChange={(elem) => this.setState({cost: elem.target.value})}/>
              </FGI>
              <FGI l={t('Прикрепить договор или счет-фактуру')} lf={3} ls={3} className="mt-2" required>
                <ImageInput fileHandler={file => this.handleFiles("report", "reportPreview", file)}
                            comment={t('Загрузить')}
                            imgPreview={this.state.reportPreview}/>
              </FGI>
            </Col>
          </Row>
        </FormGroup>
        <Button onClick={() => this.addSupplyData()}>{t('Добавить')}</Button>
      </div>
    )
  };

  renderExperiences = () => {
    const {t} = this.props;
    return (
      <div className="animated fadeIn">
        <FormGroup>
          <Row>
            <Col>
              <FGI l={t('Должность')} lf={3} ls={9} className="mt-2" required>
                <Input type={"text"} value={this.state.office}
                       onChange={(elem) => this.setState({office: elem.target.value})}/>
              </FGI>
              <FGI l={t('ФИО')} lf={3} ls={9} className="mt-2" required>
                <Input type={"text"} value={this.state.fio}
                       onChange={(elem) => this.setState({fio: elem.target.value})}/>
              </FGI>
              <FGI l={t('Общий опыт работы(лет)')} lf={3} ls={9} className="mt-2" required>
                <Input type={"text"} value={this.state.gen_expr}
                       onChange={(elem) => this.setState({gen_expr: elem.target.value})}/>
              </FGI>
              <FGI l={t('Опыт работы в качестве Поставщика (лет)')} lf={3} ls={9} className="mt-2" required>
                <Input type={"text"} value={this.state.sup_expr}
                       onChange={(elem) => this.setState({sup_expr: elem.target.value})}/>
              </FGI>
            </Col>
          </Row>
        </FormGroup>
        <Button onClick={() => this.addExprData()}>{t('Добавить')}</Button>
      </div>
    )
  };

  renderRegCertificates = () => {
    const {t} = this.props;
    return (
      <div className="animated fadeIn">
        <FormGroup>
          <Row>
            <Col>
              <FGI l={t('Серия и номер Свидетельства')} lf={3} ls={9} className="mt-2" required>
                <Input type={"text"} value={this.state.certNumber}
                       onChange={(elem) => this.setState({certNumber: elem.target.value})}/>
              </FGI>
              <FGI l={t('Дата выдачи Свидетельства')} lf={3} ls={9} className="mt-2" required>
                <Input type={"text"} value={this.state.certIssueDate}
                       onChange={(elem) => this.setState({certIssueDate: elem.target.value})}/>
              </FGI>
              <FGI l={t('Орган выдавший Свидетельство')} lf={3} ls={9} className="mt-2" required>
                <Input type={"text"} value={this.state.certIssuer}
                       onChange={(elem) => this.setState({certIssuer: elem.target.value})}/>
              </FGI>
              <FGI l={t('Наименование документа')} lf={3} ls={9} className="mt-2" required>
                <Input type={"text"} value={this.state.certName}
                       onChange={(elem) => this.setState({certName: elem.target.value})}/>
              </FGI>
            </Col>
          </Row>
        </FormGroup>
        <Button onClick={() => this.addRegCerts()}>{t('Добавить')}</Button>
      </div>
    )
  };

}

export default Prequalification
