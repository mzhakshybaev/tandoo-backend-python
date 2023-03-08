import React, {Component} from 'react';
import {Nav, NavItem, NavLink} from "reactstrap";
import {NavLink as NavLinkD} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import {translate} from "react-i18next";

@translate(['common', 'settings', ''])
@withRouter
export default class SupAppTabs extends Component {
  isActive(tab) {
    if (tab === 1) {
      // /supplier/proposal/
      if ((/^\/supplier\/proposal\//).test(this.props.match.path)) {
        return true;
      }
      // debugger
    }
  }

  render() {
    const { t } = this.props;
    return (
      <Nav tabs>
        <NavItem>
          <NavLink tag={NavLinkD} to="/supplier/applications" exact active={this.isActive(0)}>
            {t('Предложения')}/{t('Заявки')}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={NavLinkD} to="/supplier/applications/drafts"  active={this.isActive(1)}>
            {t('Проекты')}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={NavLinkD} to="/supplier/applications/requests" active={this.isActive(2)}>
            {t('Запросы')}
          </NavLink>
        </NavItem>
        {/*<NavItem>*/}
          {/*<NavLink tag={NavLinkD} to="/supplier/contracts" exact active={this.isActive(3)}>*/}
            {/*{t('Договора')}*/}
          {/*</NavLink>*/}
        {/*</NavItem>*/}
      </Nav>
    );
  }
}
