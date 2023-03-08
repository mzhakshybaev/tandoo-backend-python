import React, {Component, Fragment} from "react";
import {inject, observer} from "mobx-react";
import Button from "components/AppButton";
import Table from "components/AppTable";
import {Input} from "reactstrap/dist/reactstrap";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Collapse,
  CustomInput,
  FormGroup,
  FormText,
  Label,
  Row
} from "reactstrap";
import {FGI, Required} from "components/AppInput";
import Select from "components/Select"
import TelInput from "components/TelInput";
import {translate} from "react-i18next";
import {MaskedInput} from "components/MaskedInput";
import CoateSelect from "../../components/CoateSelect";
import * as request from "utils/requester";
import FileUploader from "../../components/FileUploader";
import {showError} from "../../../../utils/messages";

@translate(['common', 'settings', ''])
@inject("supplierStore", "dictStore", "authStore") @observer
export default class CompanyQual extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSent: false,
      // dicts
      ownerships: [],
      countries: [],
      coates: [],
      banks: [],
      images: [],
      ea_types: [],
      // form data
      resident_state: 'resident', // resident, noresident
      ownership_type: 'org', // ip, org
      // main
      ownership: null,
      inn: '', // org
      name: '',
      ip_inn: '', // ip
      ip_fio: '',
      short_name: '',
      main_doc_img: [],
      main_doc_regulations: [],
      phone: '',
      email: '',
      coate: null,
      street: '',
      house: '',
      apt: '',
      legalAddress: '',
      factAddress: '',
      bankName: '',
      // owner
      owner_fio: '',
      owner_inn: '',
      owner_pos: '',
      owner_email: '',
      owner_phone: '',
      // bank
      bank: null,
      bank_name: '', // for noresident
      account_number: null,
      bik: null,
      okpo: null,
      //
      ea_type: null,
      fin_report_img: [],

      country: null,
      //
      supplies: [],
      experiences: [],
      certificates: [],
      regulations: [],
      finances: [],
      // supplies
      sup_goods_type: '',
      sup_date_contract: '',
      sup_buyer_info: '',
      sup_cost: '',
      sup_report: [],
      // experience
      exp_pos: '',
      exp_fio: '',
      exp_gen_expr: '',
      exp_sup_expr: '',
      // certificates
      cert_file: [],
      //
      collapseExpr: false,
      collapseSupplies: false,
      collapseCert: false,
      collapseReg: false,
      collapseFin: false,
    };
  }

  componentDidMount() {
    this.load();
  }

  async load() {
    let {getDictData2, getCoateListing} = this.props.dictStore;

    let [ownerships, countries, coates, banks, ea_types] = await Promise.all([
      getDictData2({type: 'Typeofownership'}),
      getDictData2({type: 'DirCountry'}),
      getCoateListing(),
      getDictData2({type: 'DirBank'}),
      getDictData2({type: 'DirTypesofeconomicactivity'}),
    ]);
    this.setState({ownerships, countries, coates, banks, ea_types});

    this.loadCompany();
  }

  async loadCompany() {
    let {company, user} = this.props.authStore;

    let comp = await request.postAsync('company/get_from_portal', 'doc', {});

    if (user) {
      this.setState(
        {
          ip_inn: user.inn || '', // ip
          ip_fio: user.fullname,
          phone: user.phone,
          email: user.email,
          owner_fio: user.fullname,
          owner_inn: user.inn,
          owner_email: user.email,
          owner_phone: user.phone,
        }
      );
    }
    if (comp) {
      this.setState({
        //   // ownership: comp.ownership,
        //   // ownership_type: comp.typeofownership,
        //   // resident_state: comp.resident_state,
        id: company._id,
        inn: comp.inn,
        ip_inn: comp.inn,
        name: comp.titleRu,
        ip_name: comp.titleRu,
        //   short_name: comp.short_name,
        //   coate: comp.dircoate_id,
        phone: comp.workPhone,
        legalAddress: comp.legalAddress,
        factAddress: comp.factAddress,
        bankName: comp.bank.bank.name,
        //   email: comp.data.email,
        //   street: comp.data && comp.data.address && comp.data.address.street || '',
        //   house: comp.data && comp.data.address && comp.data.address.house || '',
        //   apt: comp.data && comp.data.address && comp.data.address.apt || '',
        //   main_doc_img: comp.main_doc_img,
        //   main_doc_regulations: comp.main_doc_regulations,
        //   // owner data
        //   owner_fio: comp.owner_data && comp.owner_data.fio || '',
        //   owner_inn: comp.owner_data && comp.owner_data.inn || '',
        //   owner_pos: comp.owner_data && comp.owner_data.pos || '',
        //   owner_email: comp.owner_data && comp.owner_data.email || '',
        //   owner_phone: comp.owner_data && comp.owner_data.phone || '',
        //   // bank data
        bank: comp.bank.dir_bank,
        company_bank_id: comp.bank._id,
        account_number: comp.bank.accountNumber,
        bik: comp.bank.dir_bank && comp.bank.dir_bank.bik,
        okpo: comp.bank.dir_bank && comp.bank.dir_bank.okpo,
        //   // qualification
        //   prequal_id: comp.prequal && comp.prequal._id || '',
        //   supplies: comp.prequal && comp.prequal.data.supplies || [],
        //   experiences: comp.prequal && comp.prequal.data.experiences || [],
        //   fin_report_img: comp.prequal && comp.prequal.fin_report_img,
      });
    }
  }

  addSupplyData = () => {
    let supplyData = {
      goods_type: this.state.sup_goods_type,
      date_contract: this.state.sup_date_contract,
      buyer_info: this.state.sup_buyer_info,
      cost: this.state.sup_cost,
      report: this.state.sup_report,
    };
    this.setState({
      supplies: [...this.state.supplies, supplyData],
      sup_goods_type: '',
      sup_date_contract: '',
      sup_buyer_info: '',
      sup_cost: '',
      sup_report: null,
    });
  };

  addExprData = () => {
    let exprData = {
      pos: this.state.exp_pos,
      fio: this.state.exp_fio,
      gen_expr: this.state.exp_gen_expr,
      sup_expr: this.state.exp_sup_expr
    };
    this.setState({experiences: [...this.state.experiences, exprData]});
    this.setState({exp_pos: '', exp_fio: '', exp_gen_expr: '', exp_sup_expr: ''});
  };

  addRegCert = () => {
    let certData = {
      number: this.state.certNumber,
      issueDate: this.state.certIssueDate,
      issuer: this.state.certIssuer,
      cert_file: this.state.cert_file
    };
    this.setState({certificates: [...this.state.certificates, certData]});
    this.setState({certNumber: '', certIssueDate: '', certIssuer: '', cert_file: null});
  };

  addRegulation = () => {
    let data = {
      reg_file: this.state.reg_file
    };
    this.setState({regulations: [...this.state.regulations, data]});
    this.setState({reg_file: null});
  };

  addFinance = () => {
    let data = {
      fin_name: this.state.fin_name,
      fin_file: this.state.fin_file
    };
    this.setState({finances: [...this.state.finances, data]});
    this.setState({fin_name: '', fin_file: null});
  };

  get isResident() {
    let {resident_state: rs} = this.state;
    return rs && (rs === 'resident');
  }

  get isNoResident() {
    let {resident_state: rs} = this.state;
    return rs && (rs === 'noresident');
  }

  get isIP() {
    let {resident_state: rs, ownership_type: ot} = this.state;
    return ot && (rs === 'resident') && (ot === 'ip');
  }

  get isOrg() {
    let {resident_state: rs, ownership_type: ot} = this.state;
    return ot && (rs === 'resident') && (ot === 'org');
  }

  setResidentState(resident_state) {
    this.setState({
      resident_state,
      ownership_type: '',
      ownership: null,
    });
    // this.setState({ownership: null});
    // this.props.dictStore.getDictData2({type: 'Typeofownership', filter: {'type_owner': value}}).then(r => {
    //   this.setState({ownerships: r});
    // });
  }

  setOwnershipType(ownership_type) {
    this.setState({
      ownership_type,
      ownership: null,
    })
  }

  getOwnerships() {
    let {resident_state, ownership_type} = this.state;
    return this.state.ownerships.filter(({data: {type}, type_owner}) => {
      return (type_owner === resident_state && type === ownership_type);
    })
  }

  async save() {
    const state = this.state;
    if (state.certificates.length === 0 || state.regulations.length === 0) {
      showError("Заполните данные");
      return;
    }

    const getVal = fn => fn instanceof Function ? fn.call(this) : fn;
    const ifRes = (yes, no) => getVal(this.isResident ? yes : no);
    const ifIP = (yes, no) => getVal(this.isIP ? yes : no);

    let user = this.props.authStore.user;
    /*let images = [
      state.main_doc_img,
      state.main_doc_regulations,
      state.fin_report_img
    ];
    let images_upl = await Promise.all(images.map(img => {
      return this.props.supplierStore.uploadImages(img)
    }));

    let [
      main_doc_img_upl,
      main_doc_regulations_upl,
      fin_report_img_upl
    ] = images_upl.map(img => img.files);*/


    let params = {

      main_info: {
        // class Companies(Base, CouchSync):
        //     company_status = Enum('waiting', 'confirmed', 'rejected', 'blacklist', name="company_status"),
        //                      nullable=False, default='waiting'
        //     role = Integer
        //     roles_id = Json, nullable=False, default=[]
        //
        // name = String, nullable=False
        _id: state._id,
        name: ifIP(state.ip_fio, state.name),
        // short_name = String
        short_name: state.short_name,
        // user_id = Integer, ForeignKey(User.id, onupdate='cascade', ondelete='no action'), nullable=False
        user_id: user.id,
        // company_type = String
        company_type: 'supplier',
        // inn = String
        inn: ifIP(state.ip_inn, state.inn),
        // resident_state: Enum('resident', 'noresident')
        resident_state: state.resident_state,
        // typeofownership: Enum('ip', 'org')
        typeofownership: state.ownership_type,
        // typeofownership_id = String
        typeofownership_id: state.ownership && state.ownership._id,
        // dircountry_id = String
        dircountry_id: ifRes(undefined, state.country && state.country._id),
        // dircoate_id = String

        // main_doc_img = String
        main_doc_img: state.main_doc_img,
        // main_doc_regulations: state.main_doc_regulations,
        main_doc_regulations: state.regulations[0].reg_file,
        // owner_data: Json
        owner_data: ifIP(undefined, {
          fio: state.owner_fio,
          inn: state.owner_inn,
          pos: state.owner_pos,
          email: state.owner_email,
          phone: state.owner_phone,
        }),
        // data = Json
        data: {
          phone: state.phone,
          email: state.email,
          address: {
            street: state.street,
            house: state.house,
            apt: state.apt,
          }
        },
        dircoate_id: state.coate
      }
      ,
      bank_info: {
        // class Companybank(Base, CompanySync):
        // dirbank_id = String, nullable=False
        dirbank_id: ifRes(state.bank && state.bank._id),
        // bank_name = String
        bank_name: ifRes(undefined, state.bank_name),
        // account_number = String, nullable=False
        account_number: state.account_number,
        // bik = String, nullable=False
        bik: state.bik,
        // okpo = String, nullable=False
        okpo: state.okpo,
        // data = Json
      },
      prequal_info: ifRes(() => ({
        // class Companyqualification(Base, CompanySync):
        // dirtypesofeconomicactivity_id = Column(String) // Type Of Economical Activity Id
        dirtypesofeconomicactivity_id: state.ea_type && state.ea_type._id,
        //     volume = String
        // volume: this.state.volume,
        //     fin_report_img = String
        fin_report_img: state.fin_report_img,
        //     tax_debt_img = String
        // tax_debt_img: this.state.taxDebtImage,
        //     soc_debt_img = String
        // soc_debt_img: this.state.socDebtImage,
        //     data = Json
        data: {
          supplies: ifRes(state.supplies, []),
          experiences: ifIP([], state.experiences),
          certificates: state.certificates,
          finances: state.finances
        }
      })),

    };

    if (this.state.id) {
      params['main_info']['_id'] = this.state.id || '';

      if (this.state.company_bank_id)
        params['bank_info']['_id'] = this.state.company_bank_id;

      if (this.state.prequal_id)
        params['prequal_info']['_id'] = this.state.prequal_id;
    }

    let r = await this.props.supplierStore.saveCompanyInfo(params);
    // let r = await this.props.supplierStore.saveCompanyDraft(params);
    // console.log('r', r)
    this.setState({isSent: true});

  }

  // handleFiles(imgName, previewName, file) {
  //   let model = {};
  //   model[previewName] = file.base64;
  //   this.setState(model);
  //   this.props.supplierStore.uploadImage(file.base64.split(',')[1]).then(r => {
  //     let model = {};
  //     model[imgName] = r.file;
  //     this.setState(model)
  //   })
  // }

  setFiles(prop, files) {
    // 'main_doc_img'
    // console.log(prop, files);

    this.setState({[prop]: files});
  }

  renderMsgSaved() {
    const {t, authStore, history} = this.props;
    let {user} = authStore;
    return (
      <Row className="justify-content-center">
        <Col md="9">
          <Card>
            <CardBody className="p-4 text-center">
              <p>{t('Уважаемый')} {user && user.fullname || t('пользователь')},</p>

              <p>{t('Ваши заполненные данные по Предквалификации отправлены')}</p>

              <p>{t('С уважением, Администрация Каталога.')}</p>
              <Button onClick={() => history.push('/home')}>{t('На главную')}</Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  render() {
    const {t} = this.props;
    let colLength = 6;
    let colLength2 = 12;
    let {state, isResident, isNoResident, isIP, isOrg} = this;
    if (state.isSent) {
      return this.renderMsgSaved();
    }

    return (
      <Card className="animated fadeIn">
        <CardBody className="p-3">

          <Row>
            <Col md={12} className="d-flex justify-content-center">
              <FormGroup row>
                <CustomInput type="radio" id={1} label={t("Резиденты КР")} name="resident_state" value="resident"
                             checked={this.state.resident_state === "resident"}
                             onChange={e => this.setResidentState(e.target.value)}/>
                <CustomInput type="radio" id={2} label={t("Не резиденты КР")} name="resident_state" value="noresident"
                             checked={this.state.resident_state === "noresident"}
                             onChange={e => this.setResidentState(e.target.value)}/>
              </FormGroup>
            </Col>
          </Row>

          {isNoResident && this.notResidentContent()}

          {isResident &&
          <Fragment>
            <Row>
              <Col md={12} className="d-flex justify-content-center">
                <FormGroup row>
                  <CustomInput type="radio" id={3} label={t("Индивидуальный предприниматель")} name="ownership_type"
                               value="ip" checked={this.state.ownership_type === "ip"}
                               onChange={e => this.setOwnershipType(e.target.value)}/>
                  <CustomInput type="radio" id={4} label={t("Организация")} name="ownership_type" value="org"
                               checked={this.state.ownership_type === "org"}
                               onChange={e => this.setOwnershipType(e.target.value)}/>
                </FormGroup>
              </Col>
            </Row>

            {(isIP || isOrg) &&
            <Row>
              <Col md={colLength} className="mt-3">
                <CardTitle>{t('Основные данные')}</CardTitle>

                <FGI l={t("Форма собственности")} lf={4} ls={8} className="mt-2" required>
                  <Select options={this.getOwnerships()} placeholder={t("Выберите")}
                          valueKey="_id" labelKey="name" value={state.ownership}
                          onChange={ownership => this.setState({ownership})}/>
                </FGI>

                {isIP &&
                <Fragment>
                  <FGI l={t("ИНН")} lf={4} ls={8} className="mt-2" required>
                    <MaskedInput mask="99999999999999" value={state.ip_inn}
                                 callback={ip_inn => this.setState({ip_inn})}/>
                  </FGI>
                  <FGI l={t("ФИО")} lf={4} ls={8} className="mt-2" required>
                    <Input type="text" value={state.ip_fio}
                           onChange={e => this.setState({ip_fio: e.target.value})}/>
                  </FGI>
                </Fragment>
                }

                {isOrg &&
                <Fragment>
                  <FGI l={t("ИНН организации")} lf={4} ls={8} className="mt-2" required>
                    <MaskedInput mask="99999999999999" value={state.inn}
                                 callback={inn => this.setState({inn})}/>
                  </FGI>
                  <FGI l={t("Наименование организации")} lf={4} ls={8} className="mt-2" required>
                    <Input type="text" value={state.name}
                           onChange={e => this.setState({name: e.target.value})}/>
                  </FGI>
                </Fragment>
                }

                <FGI l={t("Сокращенное наименование")} lf={4} ls={8} className="mt-2" required>
                  <Input type="text" value={state.short_name}
                         onChange={e => this.setState({short_name: e.target.value})}/>
                </FGI>

                {/*<FGI l={t("Документ определяющий юридический статус и место регистрации (Свидетельство о регистрации)")}*/}
                {/*     lf={7} ls={5} required>*/}
                {/*  <FileUploader path={'companydocs'} files={state.main_doc_img}*/}
                {/*                onChange={files => this.setFiles('main_doc_img', files)}/>*/}
                {/*</FGI>*/}

                {/*{isOrg &&*/}
                {/*<FGI l={t("Устав")} lf={7} ls={5} required>*/}
                {/*  <FileUploader files={state.main_doc_regulations} path={'companydocs'}*/}
                {/*                onChange={files => this.setState({main_doc_regulations: files})}/>*/}
                {/*</FGI>*/}
                {/*}*/}

                <FGI l={t("Email")} lf={4} ls={8} className="mt-2" required>
                  <Input type="email" value={state.email}
                         onChange={e => this.setState({email: e.target.value})}/>
                </FGI>

                <FGI l={t("Контактный телефон")} lf={4} ls={8}>
                  <TelInput value={state.phone} onChange={phone => this.setState({phone})}/>
                </FGI>

                <FGI l={t("Населенный пункт")} lf={4} ls={8} className="mt-2" required>
                  <CoateSelect placeholder={t("Выберите")}
                               valueKey="id" value={state.coate}
                               onChange={coate => this.setState({coate})}/>
                </FGI>

                <FGI l={t("Юридический адрес")} lf={4} ls={8} className="mt-2" required>
                  <Input type="text" value={state.legalAddress}
                         onChange={e => this.setState({legalAddress: e.target.value})}/>
                </FGI>

                <FGI l={t("Фактический адрес")} lf={4} ls={8} className="mt-2" required>
                  <Input type="text" value={state.factAddress}
                         onChange={e => this.setState({factAddress: e.target.value})}/>
                </FGI>

                <FormGroup row className="mt-2">
                  <Label sm={2}>
                    {t('Улица')}
                    <Required/>
                  </Label>
                  <Col sm={2}>
                    <Input type="text" value={state.street}
                           onChange={e => this.setState({street: e.target.value})}/>
                  </Col>

                  <Label sm={2}>
                    {t('№ дома')}
                    <Required/>
                  </Label>
                  <Col sm={2}>
                    <Input type="text" value={state.house}
                           onChange={e => this.setState({house: e.target.value})}/>
                  </Col>

                  <Label sm={2}>
                    {t('Квартира')}
                  </Label>
                  <Col sm={2}>
                    <Input type="text" value={state.apt}
                           onChange={e => this.setState({apt: e.target.value})}/>
                  </Col>
                </FormGroup>

              </Col>

              {isOrg &&
              <Col md={colLength} className="mt-3">
                <CardTitle>{t('Сведения о руководителе')}</CardTitle>
                <FGI l={t("ИНН")} lf={4} ls={6} className="mt-2" required>
                  <MaskedInput mask="99999999999999" value={state.owner_inn}
                               onChange={e => this.setState({owner_inn: e.target.value})}/>
                </FGI>

                <FGI l={t("ФИО")} lf={4} ls={6} className="mt-2" required>
                  <Input type="text" value={state.owner_fio}
                         onChange={e => this.setState({owner_fio: e.target.value})}/>
                </FGI>

                <FGI l={t("Должность")} lf={4} ls={6} className="mt-2" required>
                  <Input type="text" value={state.owner_pos}
                         onChange={e => this.setState({owner_pos: e.target.value})}/>
                </FGI>
                <FGI l={t("Email")} lf={4} ls={6} className="mt-2" required>
                  <Input type="email" value={state.owner_email}
                         onChange={e => this.setState({owner_email: e.target.value})}/>
                </FGI>
                <FGI l={t("Номер моб. телефона")} lf={4} ls={6} className="mt-2" required>
                  <TelInput value={state.owner_phone}
                            onChange={owner_phone => this.setState({owner_phone})}/>
                </FGI>
              </Col>
              }

              <Col md={colLength} className="mt-3">
                <CardTitle>{t('Банковские реквизиты')}</CardTitle>
                <FGI l={t("Банк")} lf={4} ls={6} className="mt-2" required>
                  <Select options={state.banks} placeholder={t("Выберите")}
                          labelKey="name" valueKey="_id" value={state.bank}
                          onChange={bank => this.setState({bank})}/>
                </FGI>

                <FGI l={t("Номер расчетного счета")} lf={4} ls={6} className="mt-2" required>
                  <MaskedInput mask="9999999999999999" value={state.account_number}
                               onChange={e => this.setState({account_number: e.target.value})}/>
                </FGI>

                <FGI l={t("БИК")} lf={4} ls={6} className="mt-2" required>
                  <MaskedInput mask="99999999" value={state.bik}
                               onChange={e => this.setState({bik: e.target.value})}/>
                </FGI>

                <FGI l={t("Код ОКПО")} lf={4} ls={6} className="mt-2" required>
                  <MaskedInput mask="99999999" value={state.okpo}
                               onChange={e => this.setState({okpo: e.target.value})}/>
                </FGI>
              </Col>

              <Col md={colLength2} className="mt-5">
                <CardTitle>{t('Предквалификационная форма поставщика')}</CardTitle>
                {/*<FGI l={t("Вид экономической деятельности")} lf={3} ls={6} className="mt-2" required>
                  <Select options={state.ea_types} placeholder={t("Выберите")}
                          labelKey="name" valueKey="_id" value={state.ea_type}
                          onChange={ea_type => this.setState({ea_type})}
                  />
                </FGI>*/}
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
                           pageSize={Math.max(1, this.state.certificates.length)}
                           filterable={false}
                           showPagination={false}
                           showRowNumbers={true}
                           columns={[
                             {Header: t("Серия и номер"), accessor: "number"},
                             {Header: t("Дата выдачи"), accessor: "issueDate"},
                             {Header: t("Орган выдавший"), accessor: "issuer",},
                             {Header: t("Файл"), accessor: "cert_file"},
                           ]}/>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    {t('Устав')}
                    <div className="card-actions">
                      <Button onClick={() => this.setState({collapseReg: !this.state.collapseReg})}>
                        <i className="fa fa-plus"/>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <Collapse isOpen={this.state.collapseReg}>
                      {this.renderRegulations()}
                    </Collapse>
                    <Table data={this.state.regulations}
                           pageSize={Math.max(1, this.state.regulations.length)}
                           filterable={false}
                           showPagination={false}
                           showRowNumbers={true}
                           columns={[
                             {Header: t("Файл"), accessor: "reg_file"},
                           ]}/>
                  </CardBody>
                </Card>

                <Card className="mt-4">
                  <CardHeader>
                    {t('Сведения о выполненных поставках товаров')}
                    <div className="card-actions">
                      <Button onClick={() => this.setState({collapseSupplies: !state.collapseSupplies})}>
                        <i className="fa fa-plus"/>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <Collapse isOpen={state.collapseSupplies}>
                      {this.renderSupplies()}
                    </Collapse>
                    <Table data={this.state.supplies}
                           pageSize={Math.max(5, state.supplies.length)}
                           filterable={false}
                           showPagination={false}
                           showRowNumbers={true}
                           columns={[
                             {Header: t("Наименование товара"), accessor: "goods_type"},
                             {Header: t("Дата выполнения договора"), accessor: "date_contract"},
                             {
                               Header: t("Покупатель (наименование,адрес,контактные телефоны)"),
                               accessor: "buyer_info",
                             },
                             {Header: t("Стоимость договора, сом"), accessor: "cost",},
                             {Header: t("Файл"), accessor: "report",},
                           ]}/>
                  </CardBody>
                </Card>

                {isOrg &&
                <Card>
                  <CardHeader>
                    {t('Квалификация и опыт работников ключевых должностей Поставщика')}
                    <div className="card-actions">
                      <Button onClick={() => this.setState({collapseExpr: !state.collapseExpr})}>
                        <i className="fa fa-plus"/>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <Collapse isOpen={state.collapseExpr}>
                      {this.renderExperiences()}
                    </Collapse>
                    <Table data={this.state.experiences}
                           pageSize={Math.max(5, state.experiences.length)}
                           filterable={false}
                           showPagination={false}
                           showRowNumbers={true}
                           columns={[
                             {Header: t("Должность"), accessor: "pos"},
                             {Header: t("ФИО"), accessor: "fio"},
                             {Header: t("Общий опыт работы(лет)"), accessor: "gen_expr",},
                             {Header: t("Опыт работы в качестве Поставщика (лет)"), accessor: "sup_expr"},
                           ]}/>
                  </CardBody>
                </Card>
                }

                <Card>
                  <CardHeader>
                    {t('Бухгалтерский баланс и ЕНД')}
                    <div className="card-actions">
                      <Button onClick={() => this.setState({collapseFin: !this.state.collapseFin})}>
                        <i className="fa fa-plus"/>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <Collapse isOpen={this.state.collapseFin}>
                      {this.renderFinances()}
                    </Collapse>
                    <Table data={this.state.finances}
                           pageSize={Math.max(5, this.state.finances.length)}
                           filterable={false}
                           showPagination={false}
                           showRowNumbers={true}
                           columns={[
                             {Header: t("Наименование документа"), accessor: "fin_name"},
                             {Header: t("Файл"), accessor: "fin_file"},
                           ]}/>
                  </CardBody>
                </Card>

                {/*<Col sm={12} md={12}>*/}
                {/*  <Row>*/}
                {/*    <Col md={6}>*/}
                {/*      <FGI l={t("Прикрепить декларации за последние годы")} lf={7} ls={5}>*/}
                {/*        <FileUploader path={'companydocs'} files={state.fin_report_img}*/}
                {/*                      onChange={files => this.setFiles('fin_report_img', files)}/>*/}
                {/*      </FGI>*/}
                {/*    </Col>*/}
                {/*  </Row>*/}
                {/*</Col>*/}
              </Col>

              <Col xs={12}>
                <Button onClick={() => this.save()}>
                  {t('Отправить на одобрение')}
                </Button>
              </Col>

              {/*<Col xs={12}>*/}
              {/*  {this.canSendForm() ?*/}
              {/*    <FormText color="muted">{t('на подтверждение')}</FormText>*/}
              {/*    :*/}
              {/*    <FormText color="danger">{t('Вы не заполнили все поля!!!!')}</FormText>}*/}
              {/*</Col>*/}
            </Row>
            }
          </Fragment>
          }

        </CardBody>
      </Card>
    )
  }

  renderSupplies = () => {
    const {t} = this.props;
    let state = this.state;
    return (
      <div className="animated fadeIn">
        <FormGroup>
          <Row>
            <Col>
              <FGI l={t("Наименование договора")} lf={3} ls={9} className="mt-2" required>
                <Input type="text" value={state.sup_goods_type}
                       onChange={e => this.setState({sup_goods_type: e.target.value})}/>
              </FGI>
              <FGI l={t("Дата выполнения договора")} lf={3} ls={9} className="mt-2" required>
                <Input type="text" value={state.sup_date_contract}
                       onChange={e => this.setState({sup_date_contract: e.target.value})}/>
              </FGI>
              <FGI l={t("Покупатель (наименование, адрес, контактные телефоны)")} lf={3} ls={9} className="mt-2"
                   required>
                <Input type="text" value={state.sup_buyer_info}
                       onChange={e => this.setState({sup_buyer_info: e.target.value})}/>
              </FGI>
              <FGI l={t("Стоимость договора, тыс. сом")} lf={3} ls={9} className="mt-2" required>
                <Input type="text" value={state.sup_cost}
                       onChange={e => this.setState({sup_cost: e.target.value})}/>
              </FGI>
              <FGI l={t("Прикрепить договор или счет-фактуру")} lf={3} ls={3} className="mt-2" required>
                <FileUploader path={'companydocs'} files={state.sup_report}
                              onChange={files => this.setFiles('sup_report', files)}/>
              </FGI>
              {/*<FGI l={"Общий объем поставок в сомах"} lf={3} ls={6} className="mt-2" row>
                  <Input type={"number"} value={this.state.volume}
                         placeholder={"Укажите"}
                         onChange={(elem) => {
                           if (elem.target.value >= 0)
                             this.setState({volume: elem.target.value})
                         }}/>
                </FGI>
                <FGI l={"Выполненных за период"} lf={3} ls={6} className="mt-2" row>
                  <Input type={"text"} value={this.state.period}
                         placeholder={"Укажите период (год, месяц)"}
                         onChange={(elem) => this.setState({period: elem.target.value})}/>
                </FGI>*/}
            </Col>
          </Row>
        </FormGroup>
        <Button onClick={() => this.addSupplyData()}>Добавить</Button>
      </div>
    )
  };

  renderExperiences = () => {
    const {t} = this.props;
    let state = this.state;
    return (
      <div className="animated fadeIn">
        <FormGroup>
          <Row>
            <Col>
              <FGI l={t("Должность")} lf={3} ls={9} className="mt-2" required>
                <Input type="text" value={state.exp_pos}
                       onChange={e => this.setState({exp_pos: e.target.value})}/>
              </FGI>
              <FGI l={t("ФИО")} lf={3} ls={9} className="mt-2" required>
                <Input type="text" value={state.exp_fio}
                       onChange={e => this.setState({exp_fio: e.target.value})}/>
              </FGI>
              <FGI l={t("Общий опыт работы(лет)")} lf={3} ls={9} className="mt-2" required>
                <Input type="text" value={state.exp_gen_expr}
                       onChange={e => this.setState({exp_gen_expr: e.target.value})}/>
              </FGI>
              <FGI l={t("Опыт работы в качестве Поставщика (лет)")} lf={3} ls={9} className="mt-2" required>
                <Input type="text" value={state.exp_sup_expr}
                       onChange={e => this.setState({exp_sup_expr: e.target.value})}/>
              </FGI>
            </Col>
          </Row>
        </FormGroup>
        <Button onClick={() => this.addExprData()}>Добавить</Button>
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
              <FGI l={t("Файл")} lf={3} ls={3} className="mt-2" required>
                <FileUploader path={'companydocs'} files={this.state.cert_file}
                              onChange={files => this.setFiles('cert_file', files)}/>

              </FGI>
            </Col>
          </Row>
        </FormGroup>
        <Button onClick={() => this.addRegCert()}>{t('Добавить')}</Button>
      </div>
    )
  };

  renderRegulations = () => {
    const {t} = this.props;
    return (
      <div className="animated fadeIn">
        <FormGroup>
          <Row>
            <Col>
              <FGI l={t("Наименование документа")} lf={3} ls={3} className="mt-2" required>
                <FileUploader path={'companydocs'} files={this.state.reg_file}
                              onChange={files => this.setFiles('reg_file', files)}/>

              </FGI>
            </Col>
          </Row>
        </FormGroup>
        <Button onClick={() => this.addRegulation()}>{t('Добавить')}</Button>
      </div>
    )
  };

  renderFinances = () => {
    const {t} = this.props;
    return (
      <div className="animated fadeIn">
        <FormGroup>
          <Row>
            <Col>
              <FGI l={t('Наименование документа')} lf={3} ls={9} className="mt-2" required>
                <Input type={"text"} value={this.state.fin_name}
                       onChange={(elem) => this.setState({fin_name: elem.target.value})}/>
              </FGI>
              <FGI l={t("Файл")} lf={3} ls={3} className="mt-2" required>
                <FileUploader path={'companydocs'} files={this.state.fin_file}
                              onChange={files => this.setFiles('fin_file', files)}/>

              </FGI>
            </Col>
          </Row>
        </FormGroup>
        <Button onClick={() => this.addFinance()}>{t('Добавить')}</Button>
      </div>
    )
  };

  notResidentContent() {
    const {t} = this.props;
    let state = this.state;
    let colLength = 6;

    return (
      <Row>
        <Col md={colLength} className="mt-3">
          <CardTitle>{t('Основные данные')}</CardTitle>

          <FGI l={t("Страна")} lf={4} ls={8} className="mt-2" required>
            <Select options={this.state.countries} placeholder={t("Выберите")}
                    valueKey="_id" labelKey="name" value={state.country}
                    onChange={country => this.setState({country})}/>
          </FGI>

          <FGI l={t("ИНН организации")} lf={4} ls={8} className="mt-2" required>
            <MaskedInput mask="99999999999999" value={state.inn}
                         callback={inn => this.setState({inn})}/>
          </FGI>

          <FGI l={t("Наименование организации")} lf={4} ls={8} className="mt-2" required>
            <Input type="text" value={state.name}
                   onChange={e => this.setState({name: e.target.value})}/>
          </FGI>

          <FGI l={t("Сокращенное наименование")} lf={4} ls={8} className="mt-2" required>
            <Input type="text" value={state.short_name}
                   onChange={e => this.setState({short_name: e.target.value})}/>
          </FGI>

          {/*<FGI l={t("Документ определяющий юридический статус и место регистрации (Свидетельство о регистрации)")}*/}
          {/*     lf={7} ls={5} required>*/}
          {/*  <FileUploader path={'companydocs'} files={state.main_doc_img}*/}
          {/*                onChange={files => this.setFiles('main_doc_img', files)}/>*/}
          {/*</FGI>*/}

          {/*<FGI l={t("Устав")} lf={7} ls={5} required>*/}
          {/*  <FileUploader path={'companydocs'} files={state.main_doc_regulations}*/}
          {/*                onChange={files => this.setFiles('main_doc_regulations', files)}/>*/}
          {/*</FGI>*/}

          <FGI l={t("Email")} lf={4} ls={8} className="mt-2" required>
            <Input type="email" value={state.email}
                   onChange={e => this.setState({email: e.target.value})}/>
          </FGI>

          <FGI l={t("Контактный телефон")} lf={4} ls={8}>
            <TelInput value={state.phone}
                      onChange={phone => this.setState({phone})}/>
          </FGI>

          <FGI l={t("Населенный пункт")} lf={4} ls={8} className="mt-2" required>
            <CoateSelect placeholder={t("Выберите")}
                         valueKey='id' value={state.coate}
                         onChange={coate => this.setState({coate})}/>
          </FGI>

          <FormGroup row className="mt-2">
            <Label sm={2}>
              {t('Улица')}
              <Required/>
            </Label>
            <Col sm={2}>
              <Input type="text" value={state.street}
                     onChange={e => this.setState({street: e.target.value})}/>
            </Col>

            <Label sm={2}>
              {t('№ дома')}
              <Required/>
            </Label>
            <Col sm={2}>
              <Input type="text" value={state.house}
                     onChange={e => this.setState({house: e.target.value})}/>
            </Col>

            <Label sm={2}>
              {t('Квартира')}
            </Label>
            <Col sm={2}>
              <Input type="text" value={state.apt}
                     onChange={e => this.setState({apt: e.target.value})}/>
            </Col>
          </FormGroup>

        </Col>

        <Col md={colLength} className="mt-3">
          <CardTitle>{t('Сведения о руководителе')}</CardTitle>
          <FGI l={t("ИНН")} lf={4} ls={6} className="mt-2" required>
            <MaskedInput mask="99999999999999" value={state.owner_inn}
                         onChange={e => this.setState({owner_inn: e.target.value})}/>
          </FGI>

          <FGI l={t("ФИО")} lf={4} ls={6} className="mt-2" required>
            <Input type="text" value={state.owner_fio}
                   onChange={e => this.setState({owner_fio: e.target.value})}/>
          </FGI>

          <FGI l={t("Должность")} lf={4} ls={6} className="mt-2" required>
            <Input type="text" value={state.owner_pos}
                   onChange={e => this.setState({owner_pos: e.target.value})}/>
          </FGI>
          <FGI l={t("Email")} lf={4} ls={6} className="mt-2" required>
            <Input type="email" value={state.owner_email}
                   onChange={e => this.setState({owner_email: e.target.value})}/>
          </FGI>
          <FGI l={t("Номер моб. телефона")} lf={4} ls={6} className="mt-2" required>
            <TelInput value={state.owner_phone}
                      onChange={owner_phone => this.setState({owner_phone})}/>
          </FGI>
          <FGI l={t("Вид экономической деятельности")} lf={3} ls={6} className="mt-2" required>
            <Select options={state.ea_types} placeholder={t("Выберите")}
                    labelKey="name" valueKey="_id" value={state.ea_type}
                    onChange={ea_type => this.setState({ea_type})}
            />
          </FGI>
        </Col>

        <Col md={colLength} className="mt-3">
          <CardTitle>{t('Банковские реквизиты')}</CardTitle>
          <FGI l={t("Банк")} lf={4} ls={6} className="mt-2" required>
            <Input type="text" value={state.bank_name}
                   onChange={e => this.setState({bank_name: e.target.value})}/>
          </FGI>
          <FGI l={t("Номер расчетного счета")} lf={4} ls={6} className="mt-2" required>
            <MaskedInput mask="9999999999999999" value={state.account_number}
                         onChange={e => this.setState({account_number: e.target.value})}/>
          </FGI>

          <FGI l={t("БИК")} lf={4} ls={6} className="mt-2" required>
            <MaskedInput mask="99999999" value={state.bik}
                         onChange={e => this.setState({bik: e.target.value})}/>
          </FGI>

          <FGI l={t("Код ОКПО")} lf={4} ls={6} className="mt-2" required>
            <MaskedInput mask="99999999" value={state.okpo}
                         onChange={e => this.setState({okpo: e.target.value})}/>
          </FGI>
        </Col>

        <Col md={colLength} className="mt-3">
          <FGI l={t("Прикрепить декларации за последние годы")} lf={7} ls={5} required>
            <FileUploader path={'companydocs'} files={state.fin_report_img}
                          onChange={files => this.setFiles('fin_report_img', files)}/>
          </FGI>
        </Col>

        <Col xs={12}>
          <Button onClick={() => this.save()} disabled={!this.canSendForm()}>{t('Отправить')}</Button>
        </Col>
        <Col xs={12}>
          <FormText color="muted">{t('на подтверждение')}</FormText>
        </Col>
      </Row>
    )
  }

  canSendForm = () => {
    // return true;
    const {
      street, house, ownership, name, bank, inn, bik,
      okpo, coate, owner_inn, owner_fio, owner_pos, owner_email, owner_phone,
      account_number, ip_inn, ip_fio, short_name, email
    } = this.state;
    const {isResident, isIP, isOrg} = this;

    // console.log({isResident, isIP});

    if (isResident && isIP) {
      let res = (ownership && ip_inn && ip_fio && short_name &&
        email && coate && street && house && bank && account_number && bik && okpo);

      // console.log(res, {
      //   ownership, ip_inn, ip_fio, short_name,
      //   email, coate, street, house, bank, account_number, bik, okpo
      // });

      return res;
    } else if (isResident && isOrg) {
      let res = (ownership && inn && name && short_name && owner_inn &&
        owner_fio && owner_pos && owner_email && owner_phone &&
        email && coate && street && house && bank && account_number && bik && okpo);

      // console.log(res, {
      //     ownership, inn, name, short_name, owner_inn,
      //     owner_fio, owner_pos, owner_email, owner_phone,
      //     email, coate, street, house, bank, account_number, bik, okpo
      // });

      return res;
    }
  };
};
