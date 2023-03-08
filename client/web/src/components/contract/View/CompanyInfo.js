import React, {Component} from 'react';
import {Col} from "reactstrap";
import {translate} from "react-i18next";
import {inject} from "mobx-react";
import {Link} from "react-router-dom";

@translate(['common', 'settings', '']) @inject('mainStore')
export default class CompanyInfo extends Component {
  getCompanyFio(company) {
    if (company.ceo)
      return company.ceo.fullname;
    return company.owner_data && company.owner_data.fio || company.name
  }


  render() {
    let {t, title, company} = this.props;
    const {mainStore} = this.props;
    const {language} = mainStore;

    let label = 'name';
    if (language && language.code === 'en') {
      label = 'name_en';
    }
    if (language && language.code === 'kg') {
      label = 'name_kg';
    }
    let companyName = <Link to={`/supplier/info/${company._id}`}>{company.name}</Link>
    if (company.company_type === 'purchaser') {
      companyName = company.name
    }
    return (
      <Col md={6} xs={12}>
        <h4>{t(title)}</h4>

        {company ?
          <div className="ml-2">
            <p>
              <strong>{t('Наименование') + ': '}</strong>
              {companyName}
            </p>
            <p>
              <strong>{t('ИНН') + ': '}</strong>
              {company.inn}
            </p>
            <p>
              <strong>{t('Форма собственности') + ': '}</strong>
              {company.ownership && company.ownership[label]}
            </p>
            <p>
              <strong>{t('Банк') + ': '}</strong>
              {company.bank && company.bank.dirbank && company.bank.dirbank[label]}
            </p>
            <p>
              <strong>{t('БИК') + ': '}</strong>
              {company.bank && company.bank.bik}
            </p>
            <p>
              <strong>{t('Лицевой счет') + ': '}</strong>
              {company.bank && company.bank.account_number}
            </p>
            <p>
              <strong>{t('ФИО руководителя') + ': '}</strong>
              {this.getCompanyFio(company)}
            </p>
          </div>
          : 'Нет информации'
        }
      </Col>
    )
  }
}
