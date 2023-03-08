import React, {Component} from 'react';
import {DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown} from 'reactstrap';
import {NavLink, withRouter} from "react-router-dom";
import {translate} from "react-i18next";
import {withKeycloak} from '@react-keycloak/web'
import {observer} from "mobx-react";

@translate(['common', 'settings', ''])
@withRouter
@withKeycloak
@observer
export default class UserDropdown extends Component {
  render() {
    const {t, authStore, history, user, keycloak} = this.props;
    if (!user) return null;
    return (
      <UncontrolledDropdown>
        <DropdownToggle tag="div" className="px-1" style={{cursor: 'pointer'}}>
          {user.inn} <i className="fa fa-chevron-down"/>
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header tag="div" className="text-center">
            <strong>{user.fullname || user.email || user.phone}</strong>
            <br/>
            {user.email}
          </DropdownItem>
          <DropdownItem tag={NavLink} to="/myaccount">
            <i className="fa fa-user"/> {t('Мой аккаунт')}
          </DropdownItem>
          <DropdownItem>
            <i className="fa fa-wrench"/> {t('Настройки')}
          </DropdownItem>
          <DropdownItem onClick={() => {
            authStore.logout();
            keycloak.logout();
            history.push('/');
          }}>
            <i className="fa fa-lock"/>
            {t('Выйти')}
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }
}
