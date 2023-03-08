import React, {Component, Fragment} from "react"
import {inject, observer} from "mobx-react"
import Button from "components/AppButton";
import {ADD_IMG, DEFAULT_AVA} from 'utils/common';
import {Col, Row, CustomInput, TabContent, TabPane, NavItem, NavLink, Nav} from "reactstrap";
import {withRouter} from "react-router-dom";
import Img from 'components/Image';
import {showError, showSuccess} from "utils/messages";
import {translate} from "react-i18next";
import {action, observable, runInAction} from "mobx";
import * as request from "utils/requester";
import Loading from "components/Loading";
import {getStatusTr} from "utils/helpers";

@translate(['common', 'settings', ''])
@inject("authStore") @withRouter @observer
export default class Companies extends Component {
  @observable ready = true;
  @observable companies = null;
  @observable activeTab = 'active';

  componentDidMount() {
    this.load();
  }

  componentWillUnmount() {
    this.reset();
  }

  async load() {
    this.ready = false;

    let params = {
      with_roles: true,
    };

    this.allCompanies = await request.postAsync('company/listing', 'docs', params);

    runInAction(() => {
      this.filterCompanies();
      this.ready = true;
    })
  }

  @action
  filterCompanies() {
    let filter;

    if (this.activeTab === 'active') {
      filter = {company_status: 'confirmed'}
    } else if (this.activeTab === 'inactive') {
      filter = (c) => c.company_status !== 'confirmed'
    }

    this.companies = this.allCompanies.filter(filter)
  }

  @action
  reset() {
    this.ready = false;
    this.companies = null;
    this.activeTab = 'active';
  }

  async handleSwitch(id) {
    try {
      await this.props.authStore.setCompany(id);
      this.props.history.push('/');

    } catch (e) {
      showError(e.message || 'Ошибка');
    }
  }

  async handleSetDefault(id) {
    try {
      await this.props.authStore.setDefaultCompany(id);
      showSuccess('Успешно изменено');

    } catch (e) {
      showError(e.message || 'Ошибка');
    }
  }

  @action
  setTab(tab) {
    this.activeTab = tab;
    this.filterCompanies();
  }

  render() {
    const {t} = this.props;
    let {valid, user, company} = this.props.authStore;

    let {companies, ready} = this;

    if (!valid)
      return null;

    return (
      <div className="animated fadeIn">
        <h3>{t('Мои организации')}</h3>

        <Nav tabs>
          <NavItem>
            <NavLink onClick={() => this.setTab('active')} active={this.activeTab === 'active'}>
              {t('Активные')}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink onClick={() => this.setTab('inactive')} active={this.activeTab === 'inactive'}>
              {t('Неактивные')}
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent>
          <TabPane>
            <Row>

              {!ready ?
                <Col>
                  <Loading/>
                </Col> :

                <Fragment>
                  <Col xs={6} sm={4} md={4} xl={2}>
                    <div className="product cat">
                      <div className="img ">
                        <Img className="Ellipse_1" src={ADD_IMG}/>
                      </div>

                      <div className="mt-1">
                        <Button to="/companies/add"><i className="fa fa-plus"/>{t('Добавить')}</Button>
                      </div>
                    </div>
                  </Col>

                  {companies && companies.map(c =>
                    <Col key={c._id} xs={6} sm={4} md={4} xl={2}>
                      <div className="product cat" title={c.name}>
                        <div className="img">
                          <Img className="Ellipse_1" src={DEFAULT_AVA}/>
                        </div>
                        <p>
                          {c.short_name || c.name}
                          {c.roles && ` (${c.roles.name})`}
                        </p>
                        <p>
                          <b>{t('Статус')}: </b>
                          <span className={`text-${c.company_status === 'waiting' ? 'warning' :
                            c.company_status === 'confirmed' ? 'success' : 'danger'}`}>
                            {getStatusTr('company', c.company_status)}
                          </span>
                        </p>
                        {c.company_status === 'draft' &&
                        <Button to={'/supplier/company/qualification'}>{t('Проект')}</Button>
                        }
                        {c.company_status === 'rejected' &&
                        <div>
                          <b>{t('Причина')}: </b>
                          <span className="text-danger">{c.reason}</span>
                          <Button to={'/companies/edit/' + c._id}>{t('Редактировать')}</Button>
                        </div>
                        }

                        {c.company_status === 'confirmed' &&
                        <Fragment>
                          <div className="mt-1">
                            <Button onClick={() => this.handleSwitch(c._id)}
                                    disabled={company && company._id === c._id}>{t('Открыть')}</Button>
                          </div>

                          <div className="mt-1">
                            <CustomInput type="radio" id={`company-${c._id}`} label={t('По умолчанию')}
                                         checked={user.default_company === c._id}
                                         onChange={e => this.handleSetDefault(c._id)}/>
                          </div>
                        </Fragment>}
                      </div>
                    </Col>
                  )}
                </Fragment>
              }


            </Row>
          </TabPane>
        </TabContent>
      </div>
    )

    /*return (
      <Row>
        <Col xs={12} sm={9} md={9} xl={10}>
          <Row>
            <Col xs={6} sm={4} md={4} xl={2}>
              <div className="product cat">
                <div className="img ">
                  <Img className="Ellipse_1" src={ADD_IMG}/>
                </div>

                <div className="mt-1">
                  <Button to="/companies/add"><i className="fa fa-plus"/>{t('Добавить')}</Button>
                </div>
              </div>
            </Col>

            {companies && companies.map(c =>
              <Col key={c._id} xs={6} sm={4} md={4} xl={2}>
                <div className="product cat" title={c.name}>
                  <div className="img">
                    <Img className="Ellipse_1" src={DEFAULT_AVA}/>
                  </div>
                  <p>
                    {c.short_name || c.name}
                    {c.roles ? ` (${c.roles.name})` : null}
                  </p>

                  <div className="mt-1">
                    <Button onClick={() => this.handleSwitch(c._id)}
                            disabled={company && company._id === c._id}>{t('Открыть')}</Button>
                  </div>
                  <div className="mt-1">
                    <CustomInput type="radio" id={`company-${c._id}`} label={t('По умолчанию')}
                                 checked={user.default_company === c._id}
                                 onChange={e => this.handleSetDefault(c._id)}/>
                  </div>
                </div>
              </Col>
            )}

          </Row>
        </Col>
      </Row>
    )*/
  }
}
