import React, {Fragment} from "react"
import {Card, CardBody, Col, Row} from "reactstrap";
import {inject} from "mobx-react";
import {translate} from "react-i18next";
import Loading from "../../components/Loading";
import AppGallery from "components/AppGallery";

@translate(['common', 'settings', '']) @inject("adminStore", "dictStore")
export default class ViewSupplierInfo extends React.Component {

  state = {
    id: '',
    ready: false,
    company: null
  };

  componentDidMount() {
    this.load(this.props.match.params.id);
  }

  componentWillUnmount() {
    this.id = null;
    this.reset();
  }

  componentDidUpdate() {
    let {id} = this.props.match.params;

    if (this.id !== id) {
      this.load(id)
    }
  }

  async load(id) {
    this.id = id;
    this.setState({ready: false});

    let company = await this.props.adminStore.getCompanyInfo(id);

    company.isResident = company.resident_state === "resident";
    company.isIP = company.typeofownership === "ip";
    company.isOrg = company.typeofownership === "org";
    company.isSupplier = company.roles && company.roles.data && company.roles.data.code === 'supplier';
    company.isPurchaser = company.roles && company.roles.data && company.roles.data.code === 'purchaser';

    // debugger
    this.setState({
      company,
      ready: true
    })
  }

  reset() {
  }

  render() {
    let {t} = this.props;

    if (!this.state.ready) {
      return <Loading/>
    }

    let c = this.state.company;

    return (
      <Card>
        <CardBody>
          <h3 className="text-center">
            {t('Профиль организации')}
          </h3>

          <Row className="mb-2 no-padding-paragraph">
            <Col md={6} xs={12}>
              <h4>{t('Тип организации')}</h4>
              <div className="ml-2 mb-2">
                <p>
                  <strong>
                    {c.isPurchaser && t("Закупщик")}
                    {c.isSupplier && t("Поставщик")}
                  </strong>
                </p>
                <p>
                  <strong>
                    {c.isResident ? t("Резидент КР") : t("Не резидент КР")}
                  </strong>
                </p>
                {c.isResident &&
                <p>
                  <strong>
                    {c.isIP && t("Индивидуальный предприниматель")}
                    {c.isOrg && t("Организация (юридическое лицо)")}
                  </strong>
                </p>}
              </div>

              <h4>{t("Основные данные")}</h4>
              <div className="ml-2">
                <p>
                  <strong>{t("Форма собственности") + ': '}</strong>
                  {c.ownershipType && c.ownershipType.name}
                </p>
                <p>
                  <strong>{t("Индивидуальный налоговый номер (ИНН)") + ': '}</strong>
                  {c.inn}
                </p>
                <p>
                  <strong>
                    {c.isIP && t("ФИО") + ': '}
                    {c.isOrg && t("Наименование организации") + ': '}
                  </strong>
                  {c.name}
                </p>
                <p>
                  <strong>{t("Сокращенное наименование") + ': '}</strong>
                  {c.short_name}
                </p>
                <p>
                  <strong>{t("Email") + ': '}</strong>
                  {c.data && c.data.email}
                </p>
                <p>
                  <strong>{t("Контактный телефон") + ': '}</strong>
                  {c.data && c.data.phone}
                </p>

                <p>
                  <strong>{t("Документ определяющий юридический статус и место регистрации") + ': '}</strong>
                </p>
                <div className="clearfix">
                  <AppGallery images={c.main_doc_img}/>
                </div>

                {c.isOrg &&
                <Fragment>
                  <p>
                    <strong>{t("Устав") + ': '}</strong>
                  </p>
                  <div className="clearfix">
                    <AppGallery images={c.main_doc_regulations}/>
                  </div>
                </Fragment>
                }

                <p>
                  <strong>{t("Населенный пункт") + ': '}</strong>
                  {c.dircoate_id && c.dircoate_id.name}
                </p>
                <p>
                  <strong>{t("Адрес") + ': '}</strong>
                  {c.data && c.data.address && `${c.data.address.street}, ${c.data.address.house}, ${c.data.address.apt}`}
                </p>

              </div>
            </Col>

            <Col md={6} xs={12}>
              {c.isOrg && <Fragment>
                <h4>{t('Сведения о руководителе')}</h4>
                <div className="ml-2 mb-2">
                  <p>
                    <strong>{t("ИНН") + ': '}</strong>
                    {c.owner_data && c.owner_data.inn}
                  </p>
                  <p>
                    <strong>{t("ФИО") + ': '}</strong>
                    {c.owner_data && c.owner_data.fio}
                  </p>
                  <p>
                    <strong>{t("Должность") + ': '}</strong>
                    {c.owner_data && c.owner_data.pos}
                  </p>
                  <p>
                    <strong>{t("Email") + ': '}</strong>
                    {c.owner_data && c.owner_data.email}
                  </p>
                  <p>
                    <strong>{t("Номер моб. телефона") + ': '}</strong>
                    {c.owner_data && c.owner_data.phone}
                  </p>
                </div>
              </Fragment>}

              <h4>{t('Предквалификационные данные')}</h4>
              <div className="ml-2 mb-2">
                <p>
                  <strong>{t("Вид экономической деятельности") + ': '}</strong>
                  {c.dirActivityType && c.dirActivityType.name}
                </p>
                <p>
                  <strong>{t('Сведения о выполненных поставках товаров') + ': '}</strong>
                </p>
                {c.isOrg && <p>
                  <strong>{t('Квалификация и опыт работников ключевых должностей Поставщика') + ': '}</strong>
                </p>}
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    )
  }
}
