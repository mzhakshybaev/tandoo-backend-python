import React, {Component, Fragment} from "react";
import {inject, observer} from "mobx-react";
import Button from "components/AppButton";
import Table from "components/AppTable";
import {clone} from 'lodash-es'
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
  Row,
  Label
} from "reactstrap";
import {FGI, Required} from "components/AppInput";
import Select from "components/Select"
import TelInput from "components/TelInput";
import {translate} from "react-i18next";
import {MaskedInput} from "components/MaskedInput";
import CoateSelect from "../../components/CoateSelect";
import FileUploader from "components/FileUploader";
import * as request from "utils/requester";

@translate(['common', 'settings', ''])
@inject("supplierStore", "dictStore", "authStore") @observer
export default class AddCompany extends Component {
  constructor(props) {
    super(props);

    let {user} = props.authStore;

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
      resident_state: '', // resident, noresident
      ownership_type: '', // ip, org
      // main
      ownership: null,
      inn: '', // org
      name: '',
      ip_inn: user.inn || '', // ip
      ip_fio: user.fullname,
      short_name: '',
      main_doc_img: [],
      main_doc_regulations: [],
      phone: user.phone,
      email: user.email,
      coate: null,
      street: '',
      house: '',
      apt: '',
      // owner
      owner_fio: user.fullname,
      owner_inn: user.inn,
      owner_pos: '',
      owner_email: user.email,
      owner_phone: user.phone,
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
      //
      collapseExpr: false,
      collapseSupplies: false,
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
    let companyId = this.props.match.params.id;

    if (companyId) {
      let params = {
        id: companyId
      };

      let comp = await request.postAsync('company/get_company', 'doc', params);

      this.setState({
        id: this.props.match.params.id,
        ownership: comp.ownership,
        ownership_type: comp.typeofownership,
        resident_state: comp.resident_state,
        inn: comp.inn,
        ip_inn: comp.inn,
        name: comp.name,
        ip_name: comp.name,
        short_name: comp.short_name,
        coate: comp.dircoate_id,
        phone: comp.data.phone,
        email: comp.data.email,
        street: comp.data && comp.data.address && comp.data.address.street || '',
        house: comp.data && comp.data.address && comp.data.address.house || '',
        apt: comp.data && comp.data.address && comp.data.address.apt || '',
        main_doc_img: comp.main_doc_img,
        main_doc_regulations: comp.main_doc_regulations,
        // owner data
        owner_fio: comp.owner_data && comp.owner_data.fio || '',
        owner_inn: comp.owner_data && comp.owner_data.inn || '',
        owner_pos: comp.owner_data && comp.owner_data.pos || '',
        owner_email: comp.owner_data && comp.owner_data.email || '',
        owner_phone: comp.owner_data && comp.owner_data.phone || '',
        // bank data
        company_bank_id: comp.company_bank._id,
        account_number: comp.company_bank.account_number,
        bik: comp.company_bank.bik,
        okpo: comp.company_bank.okpo,
        bank: comp.bank,
        // qualification
        prequal_id: comp.prequal && comp.prequal._id || '',
        supplies: comp.prequal && comp.prequal.data.supplies || [],
        experiences: comp.prequal && comp.prequal.data.experiences || [],
        fin_report_img: comp.prequal && comp.prequal.fin_report_img,
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
    this.setState({supplies: [...this.state.supplies, supplyData]});
    this.setState({
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
    const getVal = fn => fn instanceof Function ? fn.call(this) : fn;
    const ifRes = (yes, no) => getVal(this.isResident ? yes : no);
    const ifIP = (yes, no) => getVal(this.isIP ? yes : no);
    const state = this.state;

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
        main_doc_regulations: state.main_doc_regulations,
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
        }
      })),

    };

    if (this.state.id) {
      params['main_info']['_id'] = this.state.id || '';
      params['bank_info']['_id'] = this.state.company_bank_id || '';

      if (this.state.prequal_id)
        params['prequal_info']['_id'] = this.state.prequal_id;
    }
    // params
    // debugger
    // return

    let r = await this.props.supplierStore.saveCompanyInfo(params);
    // let r = await this.props.supplierStore.saveCompanyDraft(params);
    // console.log('r', r)
    this.setState({isSent: true});

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

  setFiles(prop, files) {
    // 'main_doc_img'
    // console.log(prop, files);

    this.setState({[prop]: files});
  }

  renderMsgSaved() {
    const {t} = this.props;
    let user = this.props.authStore.user;
    return (
      <Row className="justify-content-center">
        <Col md="9">
          <Card>
            <CardBody className="p-4 text-center">
              <p>{t('??????????????????')} {user && user.fullname || t('????????????????????????')},</p>

              <p>{t('???????? ?????????????????????? ???????????? ???? ???????????????????????????????? ????????????????????')}</p>

              <p>{t('?? ??????????????????, ?????????????????????????? ????????????????.')}</p>
              <Button onClick={() => this.props.history.push('/home')}>{t('???? ??????????????')}</Button>
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
                <CustomInput type="radio" id={1} label={t("?????????????????? ????")} name="resident_state" value="resident"
                             checked={this.state.resident_state === "resident"}
                             onChange={e => this.setResidentState(e.target.value)}/>
                <CustomInput type="radio" id={2} label={t("???? ?????????????????? ????")} name="resident_state" value="noresident"
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
                  <CustomInput type="radio" id={3} label={t("???????????????????????????? ??????????????????????????????")} name="ownership_type"
                               value="ip" checked={this.state.ownership_type === "ip"}
                               onChange={e => this.setOwnershipType(e.target.value)}/>
                  <CustomInput type="radio" id={4} label={t("??????????????????????")} name="ownership_type" value="org"
                               checked={this.state.ownership_type === "org"}
                               onChange={e => this.setOwnershipType(e.target.value)}/>
                </FormGroup>
              </Col>
            </Row>

            {(isIP || isOrg) &&
            <Row>
              <Col md={colLength} className="mt-3">
                <CardTitle>{t('???????????????? ????????????')}</CardTitle>

                <FGI l={t("?????????? ??????????????????????????")} lf={4} ls={8} className="mt-2" required>
                  <Select options={this.getOwnerships()} placeholder={t("????????????????")}
                          valueKey="_id" labelKey="name" value={state.ownership}
                          onChange={ownership => this.setState({ownership})}/>
                </FGI>

                {isIP &&
                <Fragment>
                  <FGI l={t("??????")} lf={4} ls={8} className="mt-2" required>
                    <MaskedInput mask="99999999999999" value={state.ip_inn}
                                 callback={ip_inn => this.setState({ip_inn})}/>
                  </FGI>
                  <FGI l={t("??????")} lf={4} ls={8} className="mt-2" required>
                    <Input type="text" value={state.ip_fio}
                           onChange={e => this.setState({ip_fio: e.target.value})}/>
                  </FGI>
                </Fragment>
                }

                {isOrg &&
                <Fragment>
                  <FGI l={t("?????? ??????????????????????")} lf={4} ls={8} className="mt-2" required>
                    <MaskedInput mask="99999999999999" value={state.inn}
                                 callback={inn => this.setState({inn})}/>
                  </FGI>
                  <FGI l={t("???????????????????????? ??????????????????????")} lf={4} ls={8} className="mt-2" required>
                    <Input type="text" value={state.name}
                           onChange={e => this.setState({name: e.target.value})}/>
                  </FGI>
                </Fragment>
                }

                <FGI l={t("?????????????????????? ????????????????????????")} lf={4} ls={8} className="mt-2" required>
                  <Input type="text" value={state.short_name}
                         onChange={e => this.setState({short_name: e.target.value})}/>
                </FGI>

                <FGI l={t("???????????????? ???????????????????????? ?????????????????????? ???????????? ?? ?????????? ?????????????????????? (?????????????????????????? ?? ??????????????????????)")}
                     lf={7} ls={5} required>
                  <FileUploader path={'companydocs'} files={state.main_doc_img}
                                onChange={files => this.setFiles('main_doc_img', files)}/>
                </FGI>

                {isOrg &&
                <FGI l={t("??????????")} lf={7} ls={5} required>
                  <FileUploader files={state.main_doc_regulations} path={'companydocs'}
                                onChange={files => this.setState({main_doc_regulations: files})}/>
                </FGI>
                }

                <FGI l={t("Email")} lf={4} ls={8} className="mt-2" required>
                  <Input type="email" value={state.email}
                         onChange={e => this.setState({email: e.target.value})}/>
                </FGI>

                <FGI l={t("???????????????????? ??????????????")} lf={4} ls={8}>
                  <TelInput value={state.phone}
                            onChange={phone => this.setState({phone})}/>
                </FGI>

                <FGI l={t("???????????????????? ??????????")} lf={4} ls={8} className="mt-2" required>
                  <CoateSelect placeholder={t("????????????????")}
                               valueKey="id" value={state.coate}
                               onChange={coate => this.setState({coate})}/>
                </FGI>

                <FormGroup row className="mt-2">
                  <Label sm={2}>
                    {t('??????????')}
                    <Required/>
                  </Label>
                  <Col sm={2}>
                    <Input type="text" value={state.street}
                           onChange={e => this.setState({street: e.target.value})}/>
                  </Col>

                  <Label sm={2}>
                    {t('??? ????????')}
                    <Required/>
                  </Label>
                  <Col sm={2}>
                    <Input type="text" value={state.house}
                           onChange={e => this.setState({house: e.target.value})}/>
                  </Col>

                  <Label sm={2}>
                    {t('????????????????')}
                  </Label>
                  <Col sm={2}>
                    <Input type="text" value={state.apt}
                           onChange={e => this.setState({apt: e.target.value})}/>
                  </Col>
                </FormGroup>

              </Col>

              {isOrg &&
              <Col md={colLength} className="mt-3">
                <CardTitle>{t('???????????????? ?? ????????????????????????')}</CardTitle>
                <FGI l={t("??????")} lf={4} ls={6} className="mt-2" required>
                  <MaskedInput mask="99999999999999" value={state.owner_inn}
                               onChange={e => this.setState({owner_inn: e.target.value})}/>
                </FGI>

                <FGI l={t("??????")} lf={4} ls={6} className="mt-2" required>
                  <Input type="text" value={state.owner_fio}
                         onChange={e => this.setState({owner_fio: e.target.value})}/>
                </FGI>

                <FGI l={t("??????????????????")} lf={4} ls={6} className="mt-2" required>
                  <Input type="text" value={state.owner_pos}
                         onChange={e => this.setState({owner_pos: e.target.value})}/>
                </FGI>
                <FGI l={t("Email")} lf={4} ls={6} className="mt-2" required>
                  <Input type="email" value={state.owner_email}
                         onChange={e => this.setState({owner_email: e.target.value})}/>
                </FGI>
                <FGI l={t("?????????? ??????. ????????????????")} lf={4} ls={6} className="mt-2" required>
                  <TelInput value={state.owner_phone}
                            onChange={owner_phone => this.setState({owner_phone})}/>
                </FGI>
              </Col>
              }

              <Col md={colLength} className="mt-3">
                <CardTitle>{t('???????????????????? ??????????????????')}</CardTitle>
                <FGI l={t("????????")} lf={4} ls={6} className="mt-2" required>
                  <Select options={state.banks} placeholder={t("????????????????")}
                          labelKey="name" valueKey="_id" value={state.bank}
                          onChange={bank => this.setState({bank})}/>
                </FGI>
                <FGI l={t("?????????? ???????????????????? ??????????")} lf={4} ls={6} className="mt-2" required>
                  <MaskedInput mask="9999999999999999" value={state.account_number}
                               onChange={e => this.setState({account_number: e.target.value})}/>
                </FGI>

                <FGI l={t("??????")} lf={4} ls={6} className="mt-2" required>
                  <MaskedInput mask="99999999" value={state.bik}
                               onChange={e => this.setState({bik: e.target.value})}/>
                </FGI>

                <FGI l={t("?????? ????????")} lf={4} ls={6} className="mt-2" required>
                  <MaskedInput mask="99999999" value={state.okpo}
                               onChange={e => this.setState({okpo: e.target.value})}/>
                </FGI>
              </Col>

              <Col md={colLength2} className="mt-5">
                <CardTitle>{t('???????????????????????????????????????? ?????????? ????????????????????')}</CardTitle>
                {/*<FGI l={t("?????? ?????????????????????????? ????????????????????????")} lf={3} ls={6} className="mt-2" required>
                  <Select options={state.ea_types} placeholder={t("????????????????")}
                          labelKey="name" valueKey="_id" value={state.ea_type}
                          onChange={ea_type => this.setState({ea_type})}
                  />
                </FGI>*/}
                <Card className="mt-4">
                  <CardHeader>
                    {t('???????????????? ?? ?????????????????????? ?????????????????? ??????????????')}
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
                           pageSize={Math.max(2, state.supplies.length)}
                           filterable={false}
                           showPagination={false}
                           showRowNumbers={true}
                           columns={[
                             {Header: t("???????????????????????? ????????????"), accessor: "goods_type"},
                             {Header: t("???????? ???????????????????? ????????????????"), accessor: "date_contract"},
                             {
                               Header: t("???????????????????? (????????????????????????,??????????,???????????????????? ????????????????)"),
                               accessor: "buyer_info",
                             },
                             {Header: t("?????????????????? ????????????????, ??????"), accessor: "cost",},
                           ]}/>
                  </CardBody>
                </Card>

                {isOrg &&
                <Card>
                  <CardHeader>
                    {t('???????????????????????? ?? ???????? ???????????????????? ???????????????? ???????????????????? ????????????????????')}
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
                           pageSize={Math.max(2, state.experiences.length)}
                           filterable={false}
                           showPagination={false}
                           showRowNumbers={true}
                           columns={[
                             {Header: t("??????????????????"), accessor: "pos"},
                             {Header: t("??????"), accessor: "fio"},
                             {Header: t("?????????? ???????? ????????????(??????)"), accessor: "gen_expr",},
                             {Header: t("???????? ???????????? ?? ???????????????? ???????????????????? (??????)"), accessor: "sup_expr"},
                           ]}/>
                  </CardBody>
                </Card>
                }

                <Col sm={12} md={12}>
                  <Row>
                    <Col md={6}>
                      <FGI l={t("???????????????????? ???????????????????? ???? ?????????????????? ????????")} lf={7} ls={5}>
                        <FileUploader path={'companydocs'} files={state.fin_report_img}
                                      onChange={files => this.setFiles('fin_report_img', files)}/>
                      </FGI>
                    </Col>
                  </Row>
                  {/*<Row>
                    <Col md={6}>
                      <FGI l={"?????????????? ???????????????????????????? ???? ??????????????"} lf={7} ls={5}>
                        <ImageInput fileHandler={file => this.handleFiles("taxDebtImage", "taxDebtPreview", file)}
                                    comment={"?????????????????? ??????????????"}
                                    imgPreview={this.state.taxDebtPreview}/>
                      </FGI>
                    </Col>
                    <Col md={3}>
                      <Input type={"text"} value={this.state.taxDebtNumber} placeholder={"?????????? ??????????????"}
                             onChange={(elem) => this.setState({taxDebtNumber: elem.target.value})}/>
                    </Col>
                    <Col md={3}>
                      <Input type={"date"} value={this.state.taxDebtDate}
                             onChange={(elem) => this.setState({taxDebtDate: elem.target.value})}/>
                      <FormText color={"muted"}>???????? ????????????</FormText>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <FGI l={"?????????????? ???????????????????????????? ???? ???????????????????? ?????????????????? ????????????????"} lf={7} ls={5}>
                        <ImageInput fileHandler={file => this.handleFiles("socDebtImage", "socDebtPreview", file)}
                                    comment={"?????????????????? ??????????????"}
                                    imgPreview={this.state.socDebtPreview}/>
                      </FGI>
                    </Col>
                    <Col md={3}>
                      <Input type={"text"} value={this.state.socDebtNumber} placeholder={"?????????? ??????????????"}
                             onChange={(elem) => this.setState({socDebtNumber: elem.target.value})}/>
                    </Col>
                    <Col md={3}>
                      <Input type={"date"} value={this.state.socDebtDate}
                             onChange={(elem) => this.setState({socDebtDate: elem.target.value})}/>
                      <FormText color={"muted"}>???????? ????????????</FormText>
                    </Col>
                  </Row>*/}
                </Col>
              </Col>

              <Col xs={12}>
                <Button onClick={() => this.save()} title={!this.canSendForm() ? t('???? ?????? ???????? ???????? ??????????????????!!!') : ''}>
                  {t('??????????????????')}
                </Button>
              </Col>

              <Col xs={12}>
                {this.canSendForm() ?
                  <FormText color="muted">{t('???? ??????????????????????????')}</FormText>
                  :
                  <FormText color="danger">{t('???? ???? ?????????????????? ?????? ????????!!!!')}</FormText>}
              </Col>
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
              <FGI l={t("???????????????????????? ????????????????")} lf={3} ls={9} className="mt-2" required>
                <Input type="text" value={state.sup_goods_type}
                       onChange={e => this.setState({sup_goods_type: e.target.value})}/>
              </FGI>
              <FGI l={t("???????? ???????????????????? ????????????????")} lf={3} ls={9} className="mt-2" required>
                <Input type="text" value={state.sup_date_contract}
                       onChange={e => this.setState({sup_date_contract: e.target.value})}/>
              </FGI>
              <FGI l={t("???????????????????? (????????????????????????, ??????????, ???????????????????? ????????????????)")} lf={3} ls={9} className="mt-2"
                   required>
                <Input type="text" value={state.sup_buyer_info}
                       onChange={e => this.setState({sup_buyer_info: e.target.value})}/>
              </FGI>
              <FGI l={t("?????????????????? ????????????????, ??????. ??????")} lf={3} ls={9} className="mt-2" required>
                <Input type="text" value={state.sup_cost}
                       onChange={e => this.setState({sup_cost: e.target.value})}/>
              </FGI>
              <FGI l={t("???????????????????? ?????????????? ?????? ????????-??????????????")} lf={3} ls={3} className="mt-2" required>
                <FileUploader path={'companydocs'} files={state.sup_report} onChange={files => this.setFiles('sup_report', files)}/>
              </FGI>
              {/*<FGI l={"?????????? ?????????? ???????????????? ?? ??????????"} lf={3} ls={6} className="mt-2" row>
                  <Input type={"number"} value={this.state.volume}
                         placeholder={"??????????????"}
                         onChange={(elem) => {
                           if (elem.target.value >= 0)
                             this.setState({volume: elem.target.value})
                         }}/>
                </FGI>
                <FGI l={"?????????????????????? ???? ????????????"} lf={3} ls={6} className="mt-2" row>
                  <Input type={"text"} value={this.state.period}
                         placeholder={"?????????????? ???????????? (??????, ??????????)"}
                         onChange={(elem) => this.setState({period: elem.target.value})}/>
                </FGI>*/}
            </Col>
          </Row>
        </FormGroup>
        <Button onClick={() => this.addSupplyData()}>????????????????</Button>
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
              <FGI l={t("??????????????????")} lf={3} ls={9} className="mt-2" required>
                <Input type="text" value={state.exp_pos}
                       onChange={e => this.setState({exp_pos: e.target.value})}/>
              </FGI>
              <FGI l={t("??????")} lf={3} ls={9} className="mt-2" required>
                <Input type="text" value={state.exp_fio}
                       onChange={e => this.setState({exp_fio: e.target.value})}/>
              </FGI>
              <FGI l={t("?????????? ???????? ????????????(??????)")} lf={3} ls={9} className="mt-2" required>
                <Input type="text" value={state.exp_gen_expr}
                       onChange={e => this.setState({exp_gen_expr: e.target.value})}/>
              </FGI>
              <FGI l={t("???????? ???????????? ?? ???????????????? ???????????????????? (??????)")} lf={3} ls={9} className="mt-2" required>
                <Input type="text" value={state.exp_sup_expr}
                       onChange={e => this.setState({exp_sup_expr: e.target.value})}/>
              </FGI>
            </Col>
          </Row>
        </FormGroup>
        <Button onClick={() => this.addExprData()}>????????????????</Button>
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
          <CardTitle>{t('???????????????? ????????????')}</CardTitle>

          <FGI l={t("????????????")} lf={4} ls={8} className="mt-2" required>
            <Select options={this.state.countries} placeholder={t("????????????????")}
                    valueKey="_id" labelKey="name" value={state.country}
                    onChange={country => this.setState({country})}/>
          </FGI>

          <FGI l={t("?????? ??????????????????????")} lf={4} ls={8} className="mt-2" required>
            <MaskedInput mask="99999999999999" value={state.inn}
                         callback={inn => this.setState({inn})}/>
          </FGI>

          <FGI l={t("???????????????????????? ??????????????????????")} lf={4} ls={8} className="mt-2" required>
            <Input type="text" value={state.name}
                   onChange={e => this.setState({name: e.target.value})}/>
          </FGI>

          <FGI l={t("?????????????????????? ????????????????????????")} lf={4} ls={8} className="mt-2" required>
            <Input type="text" value={state.short_name}
                   onChange={e => this.setState({short_name: e.target.value})}/>
          </FGI>

          <FGI l={t("???????????????? ???????????????????????? ?????????????????????? ???????????? ?? ?????????? ?????????????????????? (?????????????????????????? ?? ??????????????????????)")}
               lf={7} ls={5} required>
            <FileUploader path={'companydocs'} files={state.main_doc_img} onChange={files => this.setFiles('main_doc_img', files)}/>
          </FGI>

          <FGI l={t("??????????")} lf={7} ls={5} required>
            <FileUploader path={'companydocs'} files={state.main_doc_regulations} onChange={files => this.setFiles('main_doc_regulations', files)}/>
          </FGI>

          <FGI l={t("Email")} lf={4} ls={8} className="mt-2" required>
            <Input type="email" value={state.email}
                   onChange={e => this.setState({email: e.target.value})}/>
          </FGI>

          <FGI l={t("???????????????????? ??????????????")} lf={4} ls={8}>
            <TelInput value={state.phone}
                      onChange={phone => this.setState({phone})}/>
          </FGI>

          <FGI l={t("???????????????????? ??????????")} lf={4} ls={8} className="mt-2" required>
            <CoateSelect placeholder={t("????????????????")}
                         valueKey='id' value={state.coate}
                         onChange={coate => this.setState({coate})}/>
          </FGI>

          <FormGroup row className="mt-2">
            <Label sm={2}>
              {t('??????????')}
              <Required/>
            </Label>
            <Col sm={2}>
              <Input type="text" value={state.street}
                     onChange={e => this.setState({street: e.target.value})}/>
            </Col>

            <Label sm={2}>
              {t('??? ????????')}
              <Required/>
            </Label>
            <Col sm={2}>
              <Input type="text" value={state.house}
                     onChange={e => this.setState({house: e.target.value})}/>
            </Col>

            <Label sm={2}>
              {t('????????????????')}
            </Label>
            <Col sm={2}>
              <Input type="text" value={state.apt}
                     onChange={e => this.setState({apt: e.target.value})}/>
            </Col>
          </FormGroup>

        </Col>

        <Col md={colLength} className="mt-3">
          <CardTitle>{t('???????????????? ?? ????????????????????????')}</CardTitle>
          <FGI l={t("??????")} lf={4} ls={6} className="mt-2" required>
            <MaskedInput mask="99999999999999" value={state.owner_inn}
                         onChange={e => this.setState({owner_inn: e.target.value})}/>
          </FGI>

          <FGI l={t("??????")} lf={4} ls={6} className="mt-2" required>
            <Input type="text" value={state.owner_fio}
                   onChange={e => this.setState({owner_fio: e.target.value})}/>
          </FGI>

          <FGI l={t("??????????????????")} lf={4} ls={6} className="mt-2" required>
            <Input type="text" value={state.owner_pos}
                   onChange={e => this.setState({owner_pos: e.target.value})}/>
          </FGI>
          <FGI l={t("Email")} lf={4} ls={6} className="mt-2" required>
            <Input type="email" value={state.owner_email}
                   onChange={e => this.setState({owner_email: e.target.value})}/>
          </FGI>
          <FGI l={t("?????????? ??????. ????????????????")} lf={4} ls={6} className="mt-2" required>
            <TelInput value={state.owner_phone}
                      onChange={owner_phone => this.setState({owner_phone})}/>
          </FGI>
          <FGI l={t("?????? ?????????????????????????? ????????????????????????")} lf={3} ls={6} className="mt-2" required>
            <Select options={state.ea_types} placeholder={t("????????????????")}
                    labelKey="name" valueKey="_id" value={state.ea_type}
                    onChange={ea_type => this.setState({ea_type})}
            />
          </FGI>
        </Col>

        <Col md={colLength} className="mt-3">
          <CardTitle>{t('???????????????????? ??????????????????')}</CardTitle>
          <FGI l={t("????????")} lf={4} ls={6} className="mt-2" required>
            <Input type="text" value={state.bank_name}
                   onChange={e => this.setState({bank_name: e.target.value})}/>
          </FGI>
          <FGI l={t("?????????? ???????????????????? ??????????")} lf={4} ls={6} className="mt-2" required>
            <MaskedInput mask="9999999999999999" value={state.account_number}
                         onChange={e => this.setState({account_number: e.target.value})}/>
          </FGI>

          <FGI l={t("??????")} lf={4} ls={6} className="mt-2" required>
            <MaskedInput mask="99999999" value={state.bik}
                         onChange={e => this.setState({bik: e.target.value})}/>
          </FGI>

          <FGI l={t("?????? ????????")} lf={4} ls={6} className="mt-2" required>
            <MaskedInput mask="99999999" value={state.okpo}
                         onChange={e => this.setState({okpo: e.target.value})}/>
          </FGI>
        </Col>

        <Col md={colLength} className="mt-3">
          <FGI l={t("???????????????????? ???????????????????? ???? ?????????????????? ????????")} lf={7} ls={5} required>
            <FileUploader path={'companydocs'} files={state.fin_report_img}
                          onChange={files => this.setFiles('fin_report_img', files)}/>
          </FGI>
        </Col>

        <Col xs={12}>
          <Button onClick={() => this.save()} disabled={!this.canSendForm()}>{t('??????????????????')}</Button>
        </Col>
        <Col xs={12}>
          <FormText color="muted">{t('???? ??????????????????????????')}</FormText>
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
