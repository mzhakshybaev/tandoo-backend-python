import React, {Component} from 'react';
import {Nav, NavItem, NavLink} from "reactstrap";
import {NavLink as NavLinkD} from 'react-router-dom';
import {translate} from "react-i18next";

@translate(['common', 'settings', ''])
export default class PurAppTabs extends Component {
  render() {
    const {t} = this.props;
    return (
      <Nav tabs>
        <NavItem>
          <NavLink tag={NavLinkD} to="/purchaser/announce/listing">
            {t('Все объявления')}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={NavLinkD} to="/purchaser/announce/draft">
            {t('Проекты')}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={NavLinkD} to="/purchaser/announce/published">
            {t('Опубликовано')}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={NavLinkD} to="/purchaser/announce/evaluate">
            {t('Оценка')}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={NavLinkD} to="/purchaser/announce/result">
            {t('Итоги')}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={NavLinkD} to="/purchaser/contracts">
            {t('Договора')}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={NavLinkD} to="/purchaser/budget">
            <span style={{color: 'tomato', fontWeight:'bold'}}>{t('Бюджет')}</span>
          </NavLink>
        </NavItem>
      </Nav>
    )
  }
}
