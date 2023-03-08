import React, {Component} from 'react';
import {UncontrolledDropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import {withRouter} from "react-router-dom";
import {inject, observer} from 'mobx-react';
import {showError} from "utils/messages";
import {translate} from "react-i18next";

@translate(['common', 'settings', '']) @inject('authStore') @withRouter @observer
export default class CompanyDropdown extends Component {
  render() {
    const {user} = this.props;
    if (!user) return null;
    let {valid, company, companies} = this.props.authStore;

    if (!valid)
      return null;

    if (!company && !companies) {
      return null;
    } else if (companies) {
      if (!company || companies.length > 1) {
        return this.renderDropdown(company, companies);
      } else {
        return this.renderName(company);
      }
    } else {
      return this.renderName(company);
    }
  }

  renderName(company) {
    const {t} = this.props;
    let title = t('Организация') +': ' + company.name +
      (company.roles ? ` (${company.roles.name})` : '');
    return (
      <div className="nav-text px-2" title={title}>
        <strong>{company.short_name || company.name}</strong>
      </div>
    )
  }

  renderDropdown(company, companies) {
    const {t} = this.props;
    let title = company ? (t('Организация') + ': ' +
      company.name +
      (company.roles ? ` (${company.roles.name})` : '')
    ) : t('Организация не выбрана');

    return (
      <UncontrolledDropdown>
        <DropdownToggle nav className="px-2" caret title={title}>
          <strong>
            {company ? (company.short_name || company.name) : t('Не выбрано')}
          </strong>
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header tag="div" className="text-center">
            <strong>{t('Выберите организацию')}</strong>
          </DropdownItem>

          {companies.map(c => (
            <DropdownItem key={c._id} title={c.name} active={company && (company._id === c._id)}
                          onClick={() => this.setCompany(c)}>
              {c.short_name || c.name}
              {c.roles ? ` (${c.roles.name})` : null}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  async setCompany(company) {
    const {t} = this.props;
    try {
      await this.props.authStore.setCompany(company._id);
      this.props.history.push('/');

    } catch (e) {
      showError(e.message || t('Ошибка'));
    }
  }
}
