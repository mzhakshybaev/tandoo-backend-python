import React, {Component, Fragment} from 'react';
import {Collapse, Navbar, NavbarBrand, NavbarToggler,} from 'reactstrap';
import UserDropdown from './UserDropdown';
import Button from "../AppButton";
import {inject, observer} from "mobx-react";
import {NavLink, withRouter} from 'react-router-dom';
import LoginModal from './LoginModal'
import NavMenu from './NavMenu';
import {LOGO_IMG} from 'utils/common';
import CompanyDropdown from './CompanyDropdown';
import LangDropdown from './LangDropdown';
import Basket from './Basket';
import {translate} from "react-i18next";

import {withKeycloak} from '@react-keycloak/web'

@translate(['common', 'settings', ''])
@inject('mainStore', 'authStore', 'menuStore', 'autoNotificationsCtrl')
@withRouter
@observer
@withKeycloak
export default class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {loginModal: false, isOpen: false};
  }

  toggleLoginModal = () => {
    this.setState({loginModal: !this.state.loginModal});
  };
  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    const {isOpen} = this.state
    const {t, authStore, menuStore, autoNotificationsCtrl, location, keycloak} = this.props;
    const {valid, user, company} = authStore;
    let {count} = autoNotificationsCtrl;

    // let headerStyle;
    // if (valid && company && company.roles && company.roles.data && company.roles.data.menu_style) {
    //   headerStyle = 'header-color-' + company.roles.data.menu_style; // pur / sup
    // }

    let login;
    if (location.pathname === "/admin/ugo") {
      login = <Button onClick={this.toggleLoginModal}>
        <i className="fa fa-fw fa-user"/>{t('Войти в Admin')}
      </Button>
    } else {
      // login = <Button onClick={() => history.push('keycloak')}>
      //   <i className="fa fa-fw fa-user"/>{t('Войти')}
      // </Button>
      login = <Button onClick={() => keycloak.login()}>
        <i className="fa fa-fw fa-user"/>{t('Войти')}
      </Button>
    }
    return (
      <Navbar color="primary" dark fixed="top" expand="md" className="shadow-sm">
        <NavbarBrand tag={NavLink} to="/" className="py-0">
          <img className="main-logo" src={LOGO_IMG} alt="E-Market.kg"/>
        </NavbarBrand>

        <NavbarToggler onClick={this.toggle}/>
        <Collapse isOpen={isOpen} navbar>

          <NavMenu items={menuStore.items} toggle={this.toggle} notifications={count}
                   className="align-items-center mr-auto vertical-line"/>

          {/*<Button onClick={()=>this.props.mainStore.setMessage('info', 'info')}>info</Button>*/}

          {/*{valid &&*/}
          {/*<Button color="secondary" className="btn-sm mx-2">*/}
          {/*<i className="fa fa-bell"/>*/}
          {/*<Badge pill color="danger">{notification ? notification.count : 0}</Badge>*/}
          {/*</Button>*/}
          {/*}*/}
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Basket user={user}/>

              <CompanyDropdown user={user}/>
            </div>
            <LangDropdown/>

            {valid ?
              <UserDropdown {...this.props} user={user}/>
              :
              <Fragment>
                {login}
              </Fragment>
            }

            <LoginModal isOpen={this.state.loginModal}
                        className={this.props.className}
                        toggle={this.toggleLoginModal}/>
          </div>

        </Collapse>
      </Navbar>
    );
  }
}

