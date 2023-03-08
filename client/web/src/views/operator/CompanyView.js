import React, {Fragment} from "react"
import {Card, CardBody, CardHeader, CardTitle, Col, FormGroup, Input, Label, Row, Table} from "reactstrap";
import {FGI} from "components/AppInput";
// import Table from "components/AppTable";
import {inject} from "mobx-react";
import Button from "components/AppButton";
import {showError, showSuccess} from "utils/messages";
import AppTable from "../../components/AppTable";
import {toJS} from "mobx";
import AppGallery from "../../components/AppGallery";

export const MainInfo = (props) => {
  let c = props.company;
  if (!c.dircoate_id) c.dircoate_id = {};
  if (!c.data) c.data = {address: {}};

  return <Fragment>
    <CardTitle>Основные данные</CardTitle>
    <FGI l={"Индивидуальный налоговый номер (ИНН)"} lf={4} ls={8} className="mt-2">
      <Input readOnly value={c.inn}/>
    </FGI>

    {c.isIP &&
    <Fragment>
      <FGI l={"ФИО"} lf={4} ls={8} className="mt-2">
        <Input readOnly value={c.user.fullname}/>
      </FGI>
      <FGI l={"E-mail"} lf={4} ls={8} className="mt-2">
        <Input readOnly value={c.user.email}/>
      </FGI>
    </Fragment>
    }

    {!c.isIP &&
    <FGI l={"Наименование организации"} lf={4} ls={8} className="mt-2">
      <Input readOnly value={c.name}/>
    </FGI>}

    <FGI l={"Сокращенное наименование"} lf={4} ls={8} className="mt-2">
      <Input readOnly value={c.short_name}/>
    </FGI>

    <FGI l={"Документ определяющий юридический статус и место регистрации"} lf={7}>
      <AppGallery images={c.main_doc_img}/>
    </FGI>

    {!c.isIP &&
    <FGI l={"Устав"} lf={7}>
      <AppGallery images={c.main_doc_regulations}/>
    </FGI>
    }

    <FGI l={"Населенный пункт"} lf={4} className="mt-2">
      <Input readOnly value={c.dircoate_id.name}/>
    </FGI>
    <FGI l="Контактный телефон" lf={4} ls={8}>
      <Input readOnly value={c.data.phone}/>
    </FGI>
    <FormGroup row className="mt-2">
      <Col sm={4}>
        <Label>
          Улица
        </Label>
        <Input readOnly value={c.data ? c.data.address.street : ''}/>
      </Col>

      <Col sm={4}>
        <Label>
          № дома
        </Label>
        <Input readOnly value={c.data ? c.data.address.house : ''}/>
      </Col>

      <Col sm={4}>
        <Label>
          Квартира
        </Label>
        <Input readOnly value={c.data ? c.data.address.apt : ''}/>
      </Col>
    </FormGroup>
  </Fragment>
};

export const OwnerInfo = (props) => {
  let o = props.owner;
  return <Fragment>
    <CardTitle>Сведения о руководителе</CardTitle>
    <FGI l={"ИНН"} lf={4} ls={6} className="mt-2">
      <Input readOnly value={o.inn}/>
    </FGI>
    <FGI l={"ФИО"} lf={4} ls={6} className="mt-2">
      <Input readOnly value={o.fio}/>
    </FGI>
    <FGI l={"Должность"} lf={4} ls={6} className="mt-2">
      <Input readOnly value={o.pos}/>
    </FGI>
    <FGI l={"E-mail"} lf={4} ls={6} className="mt-2">
      <Input readOnly value={o.email}/>
    </FGI>
    <FGI l={"Номер моб. телефона"} lf={4} ls={6} className="mt-2">
      <Input readOnly value={o.phone}/>
    </FGI>

    {!props.isResident &&
    <FGI l={"Вид экономической деятельности"} lf={4} ls={6} className="mt-2">
      <Input readOnly value={o.businessType}/>
    </FGI>
    }
  </Fragment>
};

export const BankInfo = (props) => {
  let bank = props.bank;
  return <Fragment>
    <CardTitle>Банковские реквизиты</CardTitle>
    <FGI l={"Банк"} lf={4} ls={8} className="mt-2">
      <Input readOnly value={props.bankName}/>
    </FGI>
    <FGI l={"Номер расчетного счета"} lf={4} ls={6} className="mt-2">
      <Input readOnly value={bank.account_number}/>
    </FGI>

    <FGI l={"БИК"} lf={4} ls={6} className="mt-2">
      <Input readOnly value={bank.bik}/>
    </FGI>

    <FGI l={"Код ОКПО"} lf={4} ls={6} className="mt-2">
      <Input readOnly value={bank.okpo}/>
    </FGI>
  </Fragment>
};

export const QualificationInfo = (props) => {
  let q = props.qualification;
  return <Fragment>
    <FGI l={"Вид экономической деятельности"} lf={2} className="mt-2">
      <Input readOnly value={props.businessType}/>
    </FGI>
    <Card className={"mt-4"}>
      <CardHeader>
        Свидетельство о регистрации
      </CardHeader>
      <CardBody>
        <Table bordered size="sm" className="table-invoice">
          <thead>
          <tr>
            <th>Серия и номер</th>
            <th>Дата выдачи</th>
            <th>Орган выдавший</th>
            <th>Файл</th>
          </tr>
          </thead>

          <tbody>
          {q.data && q.data.certificates && q.data.certificates.map((c, i) =>
            <tr key={i}>
              <td>{c.number}</td>
              <td>{c.issueDate}</td>
              <td>{c.certIssuer}</td>
              <td>
                <AppGallery images={c.cert_file}/>
              </td>
            </tr>)
          }
          </tbody>
        </Table>
      </CardBody>
    </Card>

    <Card className={"mt-4"}>
      <CardHeader>
        Сведения о выполненных поставках товаров
      </CardHeader>
      <CardBody>
        <Table bordered size="sm" className="table-invoice">
          <thead>
          <tr>
            <th>Наименование товара</th>
            <th>Дата выполнения договора</th>
            <th>Покупатель (наименование,адрес,контактные телефоны)</th>
            <th>Стоимость договора, сом</th>
            <th>Договор</th>
          </tr>
          </thead>

          <tbody>
          {q.data && q.data.supplies && q.data.supplies.map((lot, i) =>
            <tr key={i}>
              <td>{lot.goods_type}</td>
              <td>{lot.date_contract}</td>
              <td>{lot.buyer_info}</td>
              <td>{lot.cost}</td>
              <td>
                <AppGallery images={lot.report}/>
              </td>
            </tr>)
          }
          </tbody>
        </Table>
      </CardBody>
    </Card>

    {!props.isIP &&
    <Card>
      <CardHeader>
        Квалификация и опыт работников ключевых должностей Поставщика
      </CardHeader>
      <CardBody>
        <AppTable data={toJS(q.data.experiences)}
                  minRows={1}
                  pageSize={10}
                  filterable={false}
                  showPagination={q.data.experiences && q.data.experiences.length > 10}
                  showRowNumbers={true}
                  columns={[
                    {Header: "Должность", accessor: "office"},
                    {Header: "ФИО", accessor: "fio"},
                    {Header: "Общий опыт работы(лет)", accessor: "gen_expr",},
                    {Header: "Опыт работы в качестве Поставщика (лет)", accessor: "sup_expr"},
                  ]}/>
      </CardBody>
    </Card>
    }

    <Card className={"mt-4"}>
      <CardHeader>
        Бухгалтерский баланс и ЕНД
      </CardHeader>
      <CardBody>
        <Table bordered size="sm" className="table-invoice">
          <thead>
          <tr>
            <th>Наименование документа</th>
            <th>Файл</th>
          </tr>
          </thead>

          <tbody>
          {q.data && q.data.finances && q.data.finances.map((f, i) =>
            <tr key={i}>
              <td>{f.fin_name}</td>
              <td>
                <AppGallery images={f.fin_file}/>
              </td>
            </tr>)
          }
          </tbody>
        </Table>
      </CardBody>
    </Card>

  </Fragment>
};

@inject("adminStore", "dictStore")
export default class CompanyView extends React.Component {

  state = {
    id: '',
  };

  componentDidMount() {
    let query = this.props.location.query;
    if (query && query.id) {
      this.setState({id: query.id});

      let param = {
        filter: {_id: query.id},
        with_related: true
      };
      this.props.adminStore.getCompanies(param).then(companies => {
        let company = this.normalize(companies[0]);
        this.setState({company});
        this.getCompanyData(company);
      })
    } else this.props.history.goBack();
  }

  normalize(company) {
    company.bank = company.companybank[0];
    company.qualification = company.companuqualifications[0];
    delete company.companybank;
    delete company.companuqualifications;
    return company;
  }

  getCompanyData(company) {
    let store = this.props.adminStore;

    if (company.bank.dirbank_id)
      store.getData({type: "DirBank", _id: company.bank.dirbank_id}).then(bank => this.update("dirBank", bank));

    if (company.qualification.dirtypesofeconomicactivity_id)
      store.getData({
        type: "DirTypesofeconomicactivity",
        id: company.qualification.dirtypesofeconomicactivity_id
      }).then(activityType => this.update("dirActivityType", activityType));


    if (company.dircountry_id)
      store.getData({
        type: "DirCountry",
        id: company.dircountry_id
      }).then(country => this.update("dirCountry", country));
  }

  update(propName, value) {
    this.state.company[propName] = value;
    this.setState({company: this.state.company});
  }

  cancelReason = () => {
    let {adminStore} = this.props;
    if (this.state.displayReason) {
      if (!this.state.reason) {
        showError('Введите причину');
        return;
      }

      let params = {
        id: this.state.id,
        reason: this.state.reason,
      };
      adminStore.statusRejected(params).then(r => {
        showSuccess('Данные сохранены');
        this.props.history.push("/suppliers");
      });
    } else {
      this.setState({displayReason: true});
    }
  };

  render() {
    let c = this.state.company;
    let {adminStore} = this.props;

    if (!c) return null;
    c.isResident = c.typeofownership.type_owner === "resident";
    c.isIP = c.typeofownership.data.type === "ip";
    return <Card className={"animated fadeIn"}>
      <CardBody className={"p-3"}>
        <Row>
          <Col md={12}>
            <h5>{c.isResident ? "Резидент КР" : "Не резидент КР"}</h5>
            {c.isResident && <h6>{c.isIP ? "Индивидуальный предприниматель" : "Организация (юридическое лицо)"}</h6>}
          </Col>
          <Col md={6}>
            <MainInfo company={c}/>
          </Col>
          {!c.isIP && c.owner_data &&
          <Col md={6}>
            <OwnerInfo owner={c.owner_data} isResident={c.isResident}/>
          </Col>
          }
          <Col md={6} xs={12} className={"mt-3"}>
            <BankInfo bank={c.bank} bankName={c.dirBank && c.dirBank.name}/>
          </Col>

          {c.isResident &&
          <Col md={12}>
            <QualificationInfo qualification={c.qualification} isIP={c.isIP}
                               businessType={c.dirActivityType && c.dirActivityType.name}/>
          </Col>
          }
        </Row>
        {
          c.company_status === 'waiting' && this.state.id &&
          <Row>
            <Col md="2">
              <Button onClick={() => {
                adminStore.statusConfirmed({id: this.state.id}).then(r => {
                  showSuccess('Данные сохранены');
                  this.props.history.push("/suppliers");
                });
              }}>
                Подтвердить
              </Button>
            </Col>
            <Col md="1">
              <Button onClick={() => {
                this.cancelReason()

              }}>
                Отклонить
              </Button>

            </Col>
            <Col md="8">
              {this.state.displayReason &&
              <Input className="w-25"
                     placeholder={('Укажите причину')}
                     autoFocus
                     value={this.state.reason}
                     onChange={e => this.setState({reason: e.target.value})}/>
              }</Col>
          </Row>
        }

        {
          c.company_status === 'confirmed' && this.state.id &&
          <Row>
            {/*<Col md="2">*/}
            {/*<Button onClick={() => {*/}
            {/*adminStore.statusRejected({id: this.state.id}).then(r => {*/}
            {/*showSuccess('Данные сохранены');*/}
            {/*this.props.history.push("/suppliers");*/}
            {/*});*/}
            {/*}}>*/}
            {/*Отклонить*/}
            {/*</Button>*/}
            {/*</Col>*/}
            <Col md="2">
              <Button onClick={() => {
                adminStore.statusBlacklist({id: this.state.id}).then(r => {
                  showSuccess('Данные сохранены');
                  this.props.history.push("/suppliers");
                });
              }}>
                Черный список
              </Button>
            </Col>
            <Col md="2">
              <Button onClick={() => {
                adminStore.statusBlocked({id: this.state.id}).then(r => {
                  showSuccess('Данные сохранены');
                  this.props.history.push("/suppliers");
                });
              }}>
                Заблокировать
              </Button>
            </Col>
          </Row>
        }

        {
          (c.company_status === 'rejected' || c.company_status === 'blacklist' || c.company_status === 'blocked') &&
          this.state.id && <Row>
            <Col md="2">
              <Button onClick={() => {
                adminStore.statusConfirmed({id: this.state.id}).then(r => {
                  showSuccess('Данные сохранены');
                  this.props.history.push("/suppliers");
                });
              }}>
                Действующий
              </Button>
            </Col>
          </Row>
        }


      </CardBody>
    </Card>
  }
}
