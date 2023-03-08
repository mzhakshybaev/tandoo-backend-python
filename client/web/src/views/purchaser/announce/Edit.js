import React, {Component} from 'react'
import {FGI} from "components/AppInput";
import {
  Alert,
  Card,
  CardBody,
  Col,
  FormText,
  Collapse,
  Row,
  CustomInput,
} from "reactstrap";
import Select from "components/Select";
import DatePicker from "components/DatePicker";
import Button, {ConfirmButton} from "components/AppButton";
import {action, observable, runInAction, toJS} from "mobx";
import {inject, observer} from "mobx-react";
import Loading from 'components/Loading';
import AnnouncePayments from 'components/announce/Payments';
import {FORMAT_DATE_TIME, FORMAT_DATE_DB} from "utils/common";
import {formatDate} from "utils/helpers";
import momentbd from 'moment-business-days';
import {translate} from "react-i18next";
import announceApi from "stores/api/AnnounceApi";
import Input from 'components/AppInput';
import moment from "moment";
import ReactTable from "react-table";

@translate(['common', 'settings', '']) @inject('mainStore', 'dictStore') @observer
export default class AnnounceEdit extends Component {
  @observable error;
  @observable canSubmit;
  @observable.ref procurements;
  @observable procurement;
  @observable announce;
  @observable start_date;
  @observable step;
  @observable.ref deadline;
  @observable minDLDays;
  @observable minDLDate;
  @observable concession;
  @observable tehnEnabled = false;
  @observable guarantee;
  @observable tehadress;
  @observable guarant_day;
  @observable late_delivery;
  @observable max_dam_ld;
  @observable  late_payment;
  @observable  max_dam_lp;
  @observable defect_day;
  @observable payments = {
    advanceEnabled: false,
    shipmentEnabled: false,
    acceptEnabled: false,
    advance: '',
    shipment: '',
    accept: '',
  };
  @observable isCommission = false;
  @observable commMembers = null;
  @observable showAuction = false;

  componentDidMount() {
    this.load();
  }

  async load() {
    let id = this.props.match.params.id; // from route

    let [procurements, announce] = await Promise.all([
      this.props.dictStore.getDictData2({type: 'DirProcurement'}),
      announceApi.get({id})
    ]);

    procurements = procurements.sort((a, b) => a.order - b.order);

    runInAction(() => {
      Object.assign(this, {
        procurements,
        announce,
        procurement: announce.dirprocurement,
        deadline: announce.deadline,
        // hide: announce.hide || false,
        concession: 20 || announce.concession,
        guarantee: announce.guarantee,
        tehnEnabled: announce.tehnEnabled,
        minDLDays: announce.dirprocurement ? announce.dirprocurement.day_count : null,
        minDLDate: announce.dirprocurement ? momentbd().businessAdd(announce.dirprocurement.day_count) : null,
        payments: {
          advanceEnabled: announce.data && announce.data.payments && announce.data.payments.advanceEnabled || false,
          shipmentEnabled: announce.data && announce.data.payments && announce.data.payments.shipmentEnabled || false,
          acceptEnabled: announce.data && announce.data.payments && announce.data.payments.acceptEnabled || false,
          advance: announce.data && announce.data.payments && announce.data.payments.advance || '',
          shipment: announce.data && announce.data.payments && announce.data.payments.shipment || '',
          accept: announce.data && announce.data.payments && announce.data.payments.accept || '',
        },
        isCommission: announce.data && announce.data.comm_members_txt && announce.data.comm_members_txt.length > 0 || false,
        commMembers: announce.data && announce.data.comm_members_txt && announce.data.comm_members_txt || null,
      });

      this.updateError();
    });
  }

  componentWillUnmount() {
    this.reset();
  }

  @action
  reset() {
    Object.assign(this, {
      error: null,
      canSubmit: false,
      procurements: null,
      procurement: null,
      announce: null,
      deadline: null,
      start_date: null,
      step: null,
      minDLDays: null,
      minDLDate: null,
      concession: null,
      guarantee: null,
      tehnEnabled: false,
      tehadress: null,
      guarant_day: null,
      defect_day: null,
      late_delivery: null,
      max_dam_ld: null,
      late_payment: null,
      max_dam_lp: null,
      payments: {
        advanceEnabled: false,
        shipmentEnabled: false,
        acceptEnabled: false,
        advance: 0,
        shipment: 0,
        accept: 0,
      },
      isCommission: false,
      commMembers: null,
    });
  }

  @action
  setProcurement = procurement => {
    let minDLDays = null;
    let minDLDate = null;

    if (procurement) {
      minDLDays = procurement.day_count;
      minDLDate = momentbd().businessAdd(minDLDays);
    }

    Object.assign(this, {
      procurement,
      minDLDays,
      minDLDate,
    });

    this.showAuction = procurement._id === '62e43b5e-3cca-4d3f-9680-c106c91ed7cf';

    this.updateError();
  };

  @action
  setDeadline = deadline => {
    this.deadline = deadline;
    this.updateError();
  };

  @action
  setPayment = (type, value) => {
    if (['advance', 'shipment', 'accept'].includes(type))
      value = parseFloat(value);

    // TODO: make auto calculations
    this.payments[type] = value;
    this.updateError();
  };

  @action
  setConcession = (concession) => {
    this.concession = concession;
    this.updateError();
  };


  @action
  updateError = () => {
    let {procurement, deadline, payments, minDLDays, concession, guarantee} = this;

    if (!procurement) {
      this.setError('Укажите Метод закупок');
      return;
    }

    if (procurement.with_concession) {
      if (concession === null || concession === '' || isNaN(parseFloat(concession)) || !isFinite(concession)) {
        this.setError('Укажите Значение льготы');
        return;
      }

      concession = parseFloat(concession);

      if (concession < 0 || concession > 20) {
        this.setError('Значение льготы должно быть от 0 до 20');
        return;
      }

      if (guarantee === null || guarantee === '' || isNaN(parseFloat(guarantee)) || !isFinite(guarantee)) {
        this.setError('Укажите сумму гарантийного обеспечения');
        return;
      }

      guarantee = parseFloat(guarantee);

      if (guarantee < 0 || guarantee > 10) {
        this.setError('Значение суммы гарантийного обеспечения должно быть от 0 до 10');
        return;
      }

    }
    if (this.tehnEnabled && !this.tehadress) {
      this.setError('Введите адрес технического испытания');
      return;
    }

    if (!deadline) {
      this.setError('Укажите Срок подачи заявок');
      return;
    }

    deadline = momentbd(deadline);

    // if (deadline.hour() < 9 || deadline.hour() > 18 || (deadline.hour() === 18 && deadline.minute() !== 0)) {
    //   this.setError('Укажите Время (с 9 до 18)');
    //   return;
    // }

    let minDLDate = momentbd().businessAdd(minDLDays);
    this.minDLDate = minDLDate;

    if (deadline.isBefore(minDLDate)) {
      this.setError('Укажите Срок подачи не менее {{minDLDays}} рабочих дней');
      return;
    }

    let {advanceEnabled, shipmentEnabled, acceptEnabled} = payments;

    if (!(advanceEnabled || shipmentEnabled || acceptEnabled)) {
      this.setError('Укажите хотя бы один вид платежа');
      return;
    }

    let {advance, shipment, accept} = this.payments;

    if (advanceEnabled && !advance) {
      this.setError('Укажите Авансовый платеж');
      return;
    }

    if (shipmentEnabled && !shipment) {
      this.setError('Укажите платеж После отгрузки');
      return;
    }

    if (acceptEnabled && !accept) {
      this.setError('Укажите платеж После приемки');
      return;
    }

    let sum = +(advanceEnabled && advance || 0) +
      (shipmentEnabled && shipment || 0) +
      (acceptEnabled && accept || 0);

    if (sum !== 100) {
      this.setError('Сумма платежей должна быть равна 100%');
      return;
    }

    if (this.isCommission) {
      for (let idx = 0; idx < this.commMembers.length; idx++) {
        let {fullname, inn, org, position} = this.commMembers[idx];

        if (!inn) {
          this.setError(`Укажите ПИН участника комиссии № ${idx + 1}`);
          return;
        }
        if (!fullname) {
          this.setError(`Укажите ФИО участника комиссии № ${idx + 1}`);
          return;
        }
        if (!org) {
          this.setError(`Укажите Место работы участника комиссии № ${idx + 1}`);
          return;
        }
        if (!position) {
          this.setError(`Укажите Должность участника комиссии № ${idx + 1}`);
          return;
        }
      }

      if (this.commMembers.length < 3) {
        this.setError('Необходимо назначить в комиссию не менее 3-х человек');
        return;
      }

    }


    this.setError(null)
  }

  setError(error) {
    Object.assign(this, {
      error,
      canSubmit: error === null
    })
  }

  @action.bound
  setQuarantee(guarantee) {
    this.guarantee = parseFloat(guarantee);
  }

  sumbit = async () => {
    if (!this.canSubmit) return;

    let {
      announce, procurement, deadline, payments, concession, guarantee, tehadress, guarant_day,
      defect_day, late_delivery, max_dam_ld, late_payment, max_dam_lp, commMembers
    } = this;

    let params = {
      advert: {
        _id: announce._id,
        dirprocurement_id: procurement._id,
        guarantee: guarantee,
        deadline: formatDate(deadline, FORMAT_DATE_DB),
        start_date: formatDate(this.start_date, FORMAT_DATE_DB),
        step: this.step,
        // hide : announce.hide,
        data: {
          // chairman_id: chairman,
          payments: payments,
          tehadress: tehadress,
          guarant_day: guarant_day,
          defect_day: defect_day,
          late_delivery: late_delivery, //late delivery amount
          max_dam_ld: max_dam_ld, // max deductible amount for late delivery
          late_payment: late_payment, //late payment amount
          max_dam_lp: max_dam_lp, // max deductible amount for late payment
          comm_members_txt: commMembers,
        },
        comm_members: null,
      }
    };

    if (procurement && procurement.with_concession) {
      params['advert']['concession'] = concession;
    }

    await announceApi.update_draft(params);

    this.props.history.push(`/purchaser/announce/preview/${announce._id}`);
  };

  // onMembersHandler = (list) => {
  //   list.length >= 3 ? this.commMembers = list : this.comisMembers = [];
  //   this.updateError();
  // };

  @action
  toggleCommission = async val => {
    this.isCommission = val;
    if (val) {
      this.commMembers = [{
        chairman: true,
        inn: '',
        fullname: '',
        org: '',
        position: '',
      }];
    } else {
      this.commMembers = null;
    }

    this.updateError();
  }

  @action
  addCommMember = () => {
    this.commMembers.push({
      chairman: false,
      fullname: '',
      inn: '',
      org: '',
      position: '',
    })

    this.updateError();
  }

  @action
  removeCommMember = idx => {
    this.commMembers.splice(idx, 1);
    this.updateError();
  }

  @action
  setCommChairman = idx => {
    console.log(idx);
    this.commMembers.forEach((m, i) => {
      m.chairman = (i === idx)
    })
  }

  // onCommissionSet = (event) => {
  //   if (!event.target.checked) this.commMembers = [];
  //   this.chairman = '';
  //   this.isCommission = !this.isCommission;
  //   this.updateError();
  // };
  //
  // chairmanSet = (chair) => {
  //   this.chairman = chair;
  //   this.updateError();
  // };

  render() {

    if (!this.announce) return <Loading/>;

    let {t, mainStore} = this.props;
    let lang = mainStore.language.code;
    const {language} = mainStore;
    let name_key = (lang === 'ru') ? 'name' : ('name_' + lang);
    let name = 'name';
    if (language && language.code === 'en') {
      name = 'name_en'
    }

    let {
      announce, payments, error, deadline, procurement, procurements, minDLDate, minDLDays, concession, canSubmit,
      guarantee, setPayment, setDeadline, setProcurement, sumbit, setConcession, setQuarantee, tehnEnabled,
      setTehnEnabled,
    } = this;

    // DO NOT REMOVE!!!
    let {advanceEnabled, shipmentEnabled, acceptEnabled, advance, shipment, accept} = payments;

    const CustomOption = (option, i, inputValue) => (
      <div title={option.description}>
        {option[name_key] || option.name}
      </div>
    );

    if (typeof deadline == "string")
      deadline = moment(deadline, 'YYYY-MM-DD HH:mm:ss');
    if (typeof this.start_date == 'string')
      this.setState({start_date: moment(this.start_date, 'YYYY-MM-DD HH:mm:ss')})

    return (
      <Card>
        <CardBody>
          <h3 className="text-center">
            {t('Детали объявление')} {announce.code && `№ ${announce.code}`}
          </h3>

          <Row>

            <Col md={{size: 6, offset: 3}}>
              <Row className="mb-2">
                <Col md={5}>
                  {t('Наименование объявления')}:
                </Col>
                <Col md={7}>
                  {announce.dirsection && announce.dirsection[name]}
                </Col>
              </Row>

              <Row className="mb-2">
                <Col>
                  <FGI l={t('Метод закупок')} lf="5" ls="7">
                    <Select options={procurements}
                            valueKey="_id"
                            labelKey={name_key} //"name"
                            value={procurement}
                            placeholder={t('Выберите')}
                            onChange={setProcurement}
                            optionRenderer={CustomOption}/>
                    {procurement &&
                    <FormText color="muted">
                      {procurement.description}
                    </FormText>
                    }
                  </FGI>
                </Col>
              </Row>

              <hr/>

              <h4 className="text-center">
                {t('Особые условия Договора')}
              </h4>

              <Collapse isOpen={procurement && procurement.with_concession}>
                <Row className="mb-2">
                  <Col>
                    <FGI l={t('Сумма гарантийного обеспечения исполнения Договора (не более 10% от цены Договора)')}
                         lf="5" ls="7">
                      <Input type="number" placeholder={t('Введите от 0 до 10 процентов')} value={guarantee} min="0"
                             max="10" step="0.01" onChange={e => setQuarantee(e.target.value)}/>
                    </FGI>
                  </Col>
                </Row>

                <Row className="mb-2">
                  <Col>
                    <FGI l={t('Льгота внутренним поставщикам') + ' (%)'} lf="5" ls="7">
                      <Input type="number" placeholder={t('Введите от 0 до 20 процентов')} value={concession} disabled
                             min="0" max="20" step="0.01"
                             onChange={e => setConcession(e.target.value)}/>
                    </FGI>
                  </Col>
                </Row>
              </Collapse>
              <hr/>
              <Row className="mb-2">
                <Col>
                  <FGI l={t('Технический контроль испытаний')} lf="5" ls="7">
                    <CustomInput type="checkbox" id="tehnEnabled"
                                 checked={tehnEnabled}
                                 onChange={e => this.tehnEnabled = e.target.checked}/>
                  </FGI>
                  <Collapse isOpen={tehnEnabled} tag={Col}>
                    <Input type="text" value={this.tehadress} placeholder={t('Введите страну/город/улицу/дом')}
                           onChange={e => this.tehadress = e.target.value}/>
                  </Collapse>
                </Col>
              </Row>

              <Row className="mb-2">
                <Col>
                  <div>
                    {t('Гарантийный период на товар не менее ')}
                    <span className="d-inline-block">
                       <Input type="number" placeholder={t('Введите кол-во дней')} value={this.guarant_day}
                              onChange={e => this.guarant_day = e.target.value}/>
                    </span>
                    {t(' дней с момента поставки')}
                  </div>
                  <div>
                    {t('Замена бракованного товара производится в течении ')}
                    <span className="d-inline-block">
                       <Input type="number" placeholder={t('Введите кол-во дней')} value={this.defect_day}
                              onChange={e => this.defect_day = e.target.value}/>
                    </span>
                    {t(' рабочих дней с момента получения уведомления с покупателя')}
                  </div>
                </Col>
              </Row>

              <hr/>

              <Row className="mb-2">
                <Col>
                  <FGI l={t('Срок подачи заявок')} lf="5" ls="7">
                    <DatePicker showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                timeCaption={t("Время")}
                                dateFormat={FORMAT_DATE_TIME}
                                value={deadline}
                                placeholder={t('Дата, время')}
                                onChange={setDeadline}
                                disabled={!procurement}
                                minDate={minDLDate}
                                filterDate={date => date.isBusinessDay()}/>
                    {minDLDays ?
                      <FormText color="muted">
                        {t('Не менее')} {minDLDays} {t('рабочих дней')}
                      </FormText> : ''}

                  </FGI>
                </Col>
              </Row>

              <hr/>

              <Row className="mb-2">
                <Col xs="3">
                  {t(`Неустойки за несвоевременную поставку`)}
                </Col>
                <Col xs="3">
                  <Input type="number" name="number" min={0.01} max={0.1} step={0.01}
                         value={this.late_delivery || ''}
                         onChange={e => this.late_delivery = e.target.value}/>
                  <Input type="number" defaultValue={0.1} min={0.1} max={5} step={0.1} value={this.max_dam_ld}
                         onChange={e => this.max_dam_ld = e.target.value}/>
                </Col>
                <Col>
                  <FormText>
                    {t('Ставка за каждый просроченный день')}
                    <br/>
                    {t('Введите значение не превышающую 0.1% за каждый день')}
                  </FormText>
                  <FormText>
                    {t('Максимально вычитаемая сумма')}
                    <br/>
                    {t('Введите значение не превышающую 5% от цены договора')}
                  </FormText>
                </Col>
              </Row>

              <Row className="mb-2">
                <Col xs="3">
                  {t(`За несвоевременную оплату`)}
                </Col>
                <Col xs="3">
                  <Input type="number" defaultValue={0.01} min={0.01} max={0.1} step={0.01} value={this.late_payment}
                         onChange={e => this.late_payment = e.target.value}/>
                  <Input type="number" defaultValue={0.1} min={0.1} max={5} step={0.1} value={this.max_dam_lp}
                         onChange={e => this.max_dam_lp = e.target.value}/>
                </Col>
                <Col>
                  <FormText>
                    {t('Ставка за каждый просроченный день')}
                    <br/>
                    {t('Введите значение не превышающую 0.1% за каждый день')}
                  </FormText>
                  <FormText>
                    {t('Максимально вычитаемая сумма')}
                    <br/>
                    {t('Введите значение не превышающую 5% от цены договора')}
                  </FormText>
                </Col>
              </Row>

              <hr/>

              {this.showAuction &&
              <Row className="mb-2">
                <Col>
                  <FGI l={t('Дата начала аукциона')} lf="5" ls="7">
                    <DatePicker
                      dateFormat={FORMAT_DATE_TIME}
                      value={this.start_date}
                      onChange={(date) => this.start_date = date}
                      minDate={minDLDate}
                      filterDate={date => date.isBusinessDay()}/>
                    {minDLDays ?
                      <FormText color="muted">
                        {t('Не менее')} {minDLDays} {t('рабочих дней')}
                      </FormText> : ''}

                  </FGI>
                </Col>
                <Col>
                  <FGI l='Шаг' lf="5" ls="7">
                    <Input type="number" value={this.step} onChange={e => this.step = e.target.value}/>
                  </FGI>
                </Col>
              </Row>
              }

              <AnnouncePayments payments={payments} editable onChange={setPayment}/>

              <hr/>

              <FGI l="Назначить Конкурсную комиссию" lf="5" ls="7">
                <CustomInput type="checkbox" id="isComm" checked={this.isCommission}
                             onChange={e => this.toggleCommission(e.target.checked)}/>

              </FGI>

              {this.isCommission &&
              <ReactTable data={toJS(this.commMembers)} filterable={false} sortable={false}
                          pageSize={this.commMembers.length} showPagination={false}
                          columns={[{
                            Header: 'Состав комиссии',
                            columns: [{
                              Header: '№',
                              Cell: ({index}) => index + 1,
                              width: 30
                            }, {
                              Header: 'Председатель',
                              accessor: 'chairman',
                              width: 110,
                              Cell: ({value, index}) =>
                                <CustomInput type="radio"
                                             id={`chairman-${index}`}
                                             name="chairman"
                                             checked={value}
                                             onChange={e => this.setCommChairman(index)}
                                             label="&nbsp;"
                                />,
                              Footer:
                                <Button color="success" onClick={this.addCommMember}>
                                  <i className="fa fa-plus"/>
                                  {' '}
                                  {t('Добавить')}
                                </Button>
                            }, {
                              Header: 'ПИН',
                              Cell: this.renderCommMemberInputInn
                            }, {
                              Header: 'ФИО',
                              Cell: this.renderCommMemberInputFullname
                            }, {
                              Header: 'Место работы',
                              Cell: this.renderCommMemberInputOrg
                            }, {
                              Header: 'Должность',
                              Cell: this.renderCommMemberInputPos
                            }, {
                              width: 50,
                              Cell: ({row, index}) =>
                                !row.chairman ? (
                                  <ConfirmButton color="danger" outline size="sm" title={t('Удалить')}
                                                 onConfirm={() => this.removeCommMember(index)}>
                                    <i className="fa fa-trash"/>
                                  </ConfirmButton>
                                ) : ''
                            }]
                          }]}/>}

              {/*<pre>
                {JSON.stringify(this.commMembers, null, '  ')}
              </pre>*/}

              {/*<FGI l='Добавить Конкурсную комиссию' lf="5" ls="7">
                <input type="checkbox" id={'setCommission'} checked={this.isCommission}
                       onChange={e => this.onCommissionSet(e)}/>
              </FGI>
              {isCommission &&
              <ComissionMembersForm selecteds={this.onMembersHandler.bind(this)}
                                    chairmanSet={this.chairmanSet.bind(this)}/>}*/}

              {error &&
              <Alert color="danger" key={error} className="mt-2">
                {t(error, {minDLDays})}
              </Alert>
              }

              <Row>
                <Col>
                  <Button className="m-2" to={`/purchaser/announce/preview/${announce._id}`}
                          color="secondary">{t('Назад')}</Button>

                  <Button disabled={!canSubmit} onClick={sumbit}>
                    {t('Сохранить в “Мои объявления”')}
                  </Button>
                </Col>
              </Row>

            </Col>
          </Row>
        </CardBody>
      </Card>
    )
  }

  // bug wa: https://github.com/tannerlinsley/react-table/issues/1346#issuecomment-533811901
  renderCommMemberInputFullname = ({index}) =>
    <Input model={this.commMembers[index]} name="fullname" callback={this.updateError}/>
  renderCommMemberInputInn = ({index}) =>
    <Input model={this.commMembers[index]} name="inn" callback={this.updateError}/>
  renderCommMemberInputOrg = ({index}) =>
    <Input model={this.commMembers[index]} name="org" callback={this.updateError}/>
  renderCommMemberInputPos = ({index}) =>
    <Input model={this.commMembers[index]} name="position" callback={this.updateError}/>
}

/*

const ComissionMembersForm = ({selecteds, chairmanSet}) => {
  const [inn, setInn] = useState(''),
    [members, setMembers] = useState([]),
    [modal, setModal] = useState(false),
    [modalDBList, setModalDBList] = useState([]),
    [modalSelected, setModalSelected] = useState([]),
    [showForm, setShowForm] = useState(false),
    [newMember, setNewMember] = useState(''),
    [notif, setNotif] = useState({type: '', message: "", isNotif: false});

  useEffect(() => {
    (async () => {
      await request.post("employee/all_comm_member").then(r => {
        setModalDBList(r.docs)
      })
    })()
  }, []);

  const onModalCheckboxClick = (selected, event) => {
    if (event.target.id === 'modalMembersCheck' && selected === null && members.length === 0) {
      event.target.checked ? setModalSelected(Object.assign(modalSelected, modalDBList)) : modalSelected.length = 0;
    } else {
      const index = modalSelected.indexOf(selected);
      index < 0 ? modalSelected.push(selected) : modalSelected.splice(index, 1);
    }
    setModalSelected([...modalSelected]);
  };

  const getNewMember = async (inn) => {
    setNotif({});
    let newMem = inn.length === 14
      ? await request.post("user/get_by_inn", {'inn': inn}).then(r => r.doc)
      : setNotif({isNotif: true, message: 'Необходимо ввести 14 значный ИНН', type: 'warning'});
    setNewMember(newMem);
  };

  const editMember = async (inn) => {
    getNewMember(inn);
    setShowForm(true);
  };

  // const removeFromMembers = async (item, {members} = this.state) => {
  //   let res = await request.post("user/delete_comm_member", {'inn': item.inn});
  //   if (res){
  //     members.splice(members.indexOf(item), 1);
  //     this.setState({members: [...members]});
  //     this.toggle();
  //   }
  // };

  const saveNewMember = async () => {
    let res = await request.post("user/save_comm_member", {
      'inn': newMember.inn, 'fullname': newMember.fullname,
      'position': newMember.position, 'email': newMember.email,
      'company': newMember.cm_company,
    });
    setModalDBList(state => [...state, newMember]);
  };

  let addToModalDBList = () => {
    let status = true;
    modalDBList.forEach(item => {
      if (item.inn === newMember.inn) return status = false;
    });
    if (status === false) return setNotif({isNotif: true, message: 'Вы уже добавили этого человека', type: 'warning'});
    newMember && status ? saveNewMember() : null;
    setNotif({isNotif: true, message: 'Успешно добавлен', type: 'success'});
  };

  const toggle = () => setModal(state => !state);
  // const toggle = () => remModal(state=>!state);

  return (<>
    <h4 align="center">Конкурсная комиссия</h4>
    <Row>
      <Col>
        <FGI lf="12" ls="12">
          <Button color="primary" onClick={() => {
            setModalSelected([]);
            toggle();
          }}>Выбрать из списка</Button>
        </FGI>
      </Col>
    </Row>

    <Modal isOpen={modal} toggle={toggle} size={'lg'}>
      <ModalHeader toggle={toggle}>
        <b>Список сотрудников в моей организации для включения в конкурсную комиссию</b>
      </ModalHeader>
      <ModalBody>
        <Button onClick={() => setShowForm(show => !show)} size={'default'} style={{marginBottom: '10px'}}>
          Добавить сотрудников
        </Button>
        {showForm && <>
          <Row>
            <Col cssModule={{marginTop: '20px'}}>
              <InputGroup style={{marginBottom: '20px'}}>
                <Input type="number" placeholder={"Поиск по ПИН"} value={inn}
                       onChange={(e) => setInn(e.target.value)}/>
                <InputGroupAddon addonType="append">
                  <Button color="secondary" onClick={() => getNewMember(inn)}>Найти</Button>
                </InputGroupAddon>
              </InputGroup>
            </Col>
          </Row>

          <Row cssModule={{marginBottom: '15px'}}>
            <Col>
              <FGI l={'ПИН'} required={true} lf="12" ls="12">
                <Input type="number" value={newMember ? newMember.inn : null} disabled/>
              </FGI>
              <FGI l={'ФИО'} lf="12" ls="12">
                <Input type="text" value={newMember ? newMember.fullname : null} disabled/>
              </FGI>
            </Col>
            <Col>
              <FGI l={'Место Работы'} lf="12" ls="12">
                <Input type="text" placeholder={"Укажите место работы"}
                       value={newMember ? newMember.cm_company : null}
                       onChange={(e) => setNewMember({...newMember, cm_company: e.target.value})}/>
              </FGI>
              <FGI l={'Должность'} lf="12" ls="12">
                <Input type="text" placeholder={"Укажите должность"}
                       value={newMember ? newMember.position : null}
                       onChange={(e) => setNewMember({...newMember, position: e.target.value})}/>
              </FGI>
            </Col>
            <Col>
              <FGI l={'Электронная почта'} lf="12" ls="12">
                <Input type="text" placeholder={"E-mail"}
                       value={newMember ? newMember.email : null}
                       onChange={(e) => setNewMember({...newMember, email: e.target.value})}/>
              </FGI>
              <FGI l={<span>&nbsp;</span>} lf="12" ls="12">
                <Button color="primary" onClick={addToModalDBList}>Добавить</Button>{'  '}
                <Button color="secondary" onClick={() => {
                  setNewMember('');
                  setInn('');
                  setNotif({})
                }}> Новый </Button>
              </FGI>
            </Col>
          </Row>

          <Row>
            <Col>
              {notif.isNotif && <Alert color={notif.type || 'warning'}>{notif.message}</Alert>}
            </Col>
          </Row>
        </>}

        <Table striped hover>
          <thead>
          <tr>
            <th>
              <input type="checkbox" disabled={members.length > 0} id={'modalMembersCheck'}
                     onChange={e => onModalCheckboxClick(null, e)}
                     checked={modalSelected.length === modalDBList.length}/>
            </th>
            <th>№</th>
            <th>ПИН</th>
            <th>Наименование</th>
            <th>Место работы</th>
            <th>Должность</th>
            <th>E-mail</th>
            <th>Действия</th>
          </tr>
          </thead>
          <tbody>

          {modalDBList.map((item, ind) => {
            return members.includes(item)
              ? <tr key={ind * 3 + 1 + 102}>
                <th scope="row">&nbsp;</th>
                <th scope="row">{ind + 1}</th>
                <td colSpan={3}>Добавлен - {item.fullname}</td>
              </tr>
              : <tr key={ind * 3 + 1 + 102}>
                <th>
                  <input type="checkbox" disabled={members.includes(item)} checked={modalSelected.includes(item)}
                         onChange={e => onModalCheckboxClick(item, e)}/>
                </th>
                <th scope="row">{ind + 1}</th>
                <td>{item.inn}</td>
                <td>{item.fullname}</td>
                <td>{item.cm_company}</td>
                <td>{item.position}</td>
                <td>{item.email}</td>
                <td className="text-nowrap">
                  <Button color="link" size="sm" onClick={() => editMember(item.inn)} title="Изменить" className="mr-1">
                    <i className="fa fa-lg fa-edit"/>
                  </Button>
                  {/!*<ConfirmButton color="link" size="sm"  title="Удалить"
                                 onConfirm={() => this.removeFromMembers(item)}
                                 question={`Вы уверены что хотите удалить ${item.fullname}?`}>
                    <i className="fa fa-lg fa-trash"/>
                  </ConfirmButton>*!/}
                </td>
              </tr>
          })}
          </tbody>
        </Table>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>Закрыть</Button>{' '}
        <Button color="primary" disabled={!modalSelected.length}
                onClick={() => {
                  setMembers([...members, ...modalSelected]);
                  toggle();
                  selecteds([...members, ...modalSelected])
                }}
        >Добавить в список</Button>
      </ModalFooter>
    </Modal>

    {members.length > 0 && <>
      <Table striped hover>
        <thead>
        <tr>
          <th>Председатель</th>
          <th>№</th>
          <th>Наименование</th>
          <th>Должность</th>
          <th>E-mail</th>
          <th>Удалить</th>
        </tr>
        </thead>
        <tbody>
        {members.map((item, ind) => (
          <tr key={ind * 3 + 1 + 102}>
            <th style={{textAlign: 'center'}}>
              <input type="radio" name="memItem" value={item.id}
                     style={{position: 'static', border: 0, width: '20%', height: '2em'}}
                     onChange={(e) => {
                       // setChairman(e.target.value);
                       chairmanSet(e.target.value);
                       const indexi = members.indexOf(item);
                       members.forEach((forItem, forInd) => {
                         forItem['chairman'] = (indexi === forInd)
                       });
                       setMembers([...members]);
                       selecteds([...members]);
                     }}/>
            </th>
            <th scope="row">{ind + 1}</th>
            <td>{item.fullname}</td>
            <td>{item.position}</td>
            <td>{item.email}</td>
            <td>
              <RButton color="secondary" close style={{width: '100%', outline: 'none'}}
                       onClick={() => {
                         members.splice(members.indexOf(item), 1);
                         setMembers([...members]);
                         selecteds([...members]);
                       }}/>
            </td>
          </tr>
        ))}
        </tbody>
      </Table>
    </>}

    <hr/>
  </>);
};
*/

/*

// кастомный useForm hook
const useFormHook = initialValues => {
  const [values, setValues] = useState(initialValues);
  return [
    values,
    e => {
      setValues({
        ...values,
        [e.target.name]: e.target.value
      })
    }
  ];
};
*/

