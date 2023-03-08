import React, {Component} from 'react'
import {Col, Collapse, Nav, Navbar, NavbarToggler, NavItem, NavLink, Row, TabContent, TabPane} from "reactstrap";
import Employees from "./Employees";
import DebtInfo from './DebtInfo';
import MyDocuments from './MyDocuments';
import BankDetails from './BankDetails'
import Prequalification from './Prequalification'
import CompanyGeneralInfo from './CompanyGeneralInfo'
import TenderCommission from './TenderCommission';
import Spinner from 'components/Loading';
import {inject, observer} from 'mobx-react'
import {translate} from "react-i18next";
import DebtData from "components/supplier/DebtData";

@translate(['common', 'settings', ''])
@inject('supplierStore', 'authStore') @observer
class CompanyProfile extends Component {
  state = {
    activeTab: '0',
    collapsed: true,
    company: null,
  };

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
    this.toggleNavbar();
  }

  toggleNavbar = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  renderNav(props) {
    const {t} = this.props;
    let {isSupplier, isPurchaser} = this.props.authStore;

    return (
      <Nav {...props}>
        {isSupplier &&
        <NavItem>
          <NavLink active={this.state.activeTab === '0'}
                   onClick={() => {
                     this.toggle('0');
                   }}>{t('Информация о задолжн.')}</NavLink>
        </NavItem>}
        <NavItem>
          <NavLink active={this.state.activeTab === '1'}
                   onClick={() => {
                     this.toggle('1');
                   }}>{t('Основные данные')}</NavLink>
        </NavItem>
        <NavItem>
          <NavLink active={this.state.activeTab === '2'}
                   onClick={() => {
                     this.toggle('2');
                   }}>{t('Банковские реквизиты')}</NavLink>
        </NavItem>
        {isSupplier &&
        <NavItem>
          <NavLink active={this.state.activeTab === '3'}
                   onClick={() => {
                     this.toggle('3');
                   }}>{t('Предквалификация')}</NavLink>
        </NavItem>}
        {isSupplier &&
        <NavItem>
          <NavLink active={this.state.activeTab === '4'}
                   onClick={() => {
                     this.toggle('4');
                   }}>{t('Реклама')}</NavLink>
        </NavItem>}
        <NavItem>
          <NavLink active={this.state.activeTab === '5'}
                   onClick={() => {
                     this.toggle('5');
                   }}>{t('Сотрудники')}</NavLink>
        </NavItem>
        {isPurchaser &&
        <NavItem>
          <NavLink active={this.state.activeTab === '6'}
                   onClick={() => {
                     this.toggle('6');
                   }}>{t('Конкурсная Комиссия')}</NavLink>
        </NavItem>}
        <NavItem>
          <NavLink active={this.state.activeTab === '7'}
                   onClick={() => {
                     this.toggle('7');
                   }}>{t('Мои документы')}</NavLink>
        </NavItem>
        <NavItem>
          <NavLink active={this.state.activeTab === '8'}
                   onClick={() => {
                     this.toggle('8');
                   }}>{t('Архив')}</NavLink>
        </NavItem>
      </Nav>
    )
  }

  componentDidMount() {
    this.props.supplierStore.getCompanies({
      current: true,
      with_related: true
    }).then(companies => {
      this.setState({company: companies[0]});
      if (!this.props.authStore.isSupplier) {
        this.setState({activeTab: '1'})
      }
    })
  }

  render() {
    const {t} = this.props;
    let {company} = this.state;
    let {isSupplier, isPurchaser} = this.props.authStore;

    if (!company)
      return <Spinner/>;

    return (
      <div className="arsenal">
        <Row>
          <Col sm={5} className="toggle-sidebar">
            <Navbar color="faded" light>
              <NavbarToggler onClick={this.toggleNavbar} className="mr-2"/>
              <Collapse isOpen={!this.state.collapsed} navbar>
                {this.renderNav({navbar: true})}
              </Collapse>
            </Navbar>
          </Col>
        </Row>
        <Row noGutters>
          <Col md={3} sm={2}>
            {this.renderNav({tabs: true, className: "flex-column SideDrawer"})}
          </Col>
          <Col md={9} sm={12}>
            <TabContent activeTab={this.state.activeTab}>
              {isSupplier &&
              <TabPane tabId="0">
                <Row>
                  <Col sm="12">
                    {this.state.activeTab === '0' &&
                    <DebtData showPagination={true}/>}
                  </Col>
                </Row>
              </TabPane>}
              <TabPane tabId="1">
                <Row className="  d-flex align-items-baseline">
                  <Col xs="12">
                    {this.state.activeTab === '1' &&
                    <CompanyGeneralInfo company={company}/>}
                  </Col>
                </Row>
              </TabPane>
              <TabPane tabId="2">
                <Row>
                  <Col sm="12">
                    {this.state.activeTab === '2' &&
                    <BankDetails company={company}/>}
                  </Col>
                </Row>
              </TabPane>

              {isSupplier &&
              <TabPane tabId="3">
                <Row>
                  <Col sm="12">
                    {this.state.activeTab === '3' &&
                    <Prequalification company={company}/>}
                  </Col>
                </Row>
              </TabPane>}

              {isSupplier &&
              <TabPane tabId="4">
                <Row>
                  <Col sm="12">
                    {this.state.activeTab === '4' &&
                    <h2>{t('Реклама')}</h2>}
                  </Col>
                </Row>
              </TabPane>}
              <TabPane tabId="5">
                <Row>
                  <Col sm="12">
                    {this.state.activeTab === '5' &&
                    <Employees company={company}/>}
                  </Col>
                </Row>
              </TabPane>
              {isPurchaser &&
              <TabPane tabId="6">
                <Row>
                  <Col sm="12">
                    {this.state.activeTab === '6' &&
                    <TenderCommission />}
                  </Col>
                </Row>
              </TabPane>}
              <TabPane tabId="7">
                <Row>
                  <Col sm="12">
                    {this.state.activeTab === '7' &&
                    <MyDocuments company={company}/>}
                  </Col>
                </Row>
              </TabPane>
              <TabPane tabId="8">
                <Row>
                  <Col sm="12">
                    {this.state.activeTab === '8' &&
                    <h2>{t('Архив')}</h2>}
                  </Col>
                </Row>
              </TabPane>
            </TabContent>
          </Col>
        </Row>
      </div>
    )
  }
}

export default CompanyProfile
