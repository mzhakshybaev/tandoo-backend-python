import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavItem,
  NavLink as NavLinkRS,
  UncontrolledDropdown
} from 'reactstrap';
import {NavLink} from "react-router-dom";
import {translate} from "react-i18next";

@translate(['common', 'settings', ''])
export default class NavMenu extends Component {
  static propTypes = {
    items: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  };

  static defaultProps = {
    items: [],
  };

  render() {
    let {items, notifications, t, tReady, defaultNS, reportNS, i18n, i18nOptions, toggle, ...props} = this.props;
    items = items.filter(e => e.visible);
    let className = items.length === 0 ? 'pr-3 text-center' : 'pr-3 text-center vertical-line';
    return (
      <Nav {...props} navbar>
        <NavItem className="px-2 text-center" style={{color: 'red'}}>
          <NavLinkRS to={"/announcements"} onClick={toggle} tag={NavLink} className="p-1">
            {t("Объявления")}
          </NavLinkRS>
        </NavItem>
        <NavItem className={className}>
          <NavLinkRS to={"/purchaser/catalog"} onClick={toggle} tag={NavLink} className="p-1">
            {t("Каталог")}
          </NavLinkRS>
        </NavItem>
        {/*{items.length === 0 &&
        <NavItem className="pr-3 text-center vertical-line">
          <NavLinkRS to={"/local"} onClick={toggle} tag={NavLink} className="p-1">
            {t("Отечественная продукция")}
          </NavLinkRS>
        </NavItem>
        }*/}
        {items.map((m, i) =>
          m.items ?
            this.renderDropdown(m.name, m.items, i) :
            this.renderLink(m.name, m.url, i)
        )}
      </Nav>
    )
  }

  renderDropdown(name, items, i) {
    const {t} = this.props;
    return (
      <UncontrolledDropdown nav inNavbar key={i}>
        <DropdownToggle nav caret>
          {t("" + name + "")}
        </DropdownToggle>
        <DropdownMenu right>
          {items.map((mm, i) => (
            <DropdownItem key={i}>
              {this.renderLink(mm.name, mm.url)}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </UncontrolledDropdown>
    )
  }

  renderLink(name, url, i, exact) {
    let {notifications} = this.props;
    const {t, toggle} = this.props;

    if (url && url === '/notifications') {
      return (
        <NavItem className="d-flex" key={i}>
          <NavLinkRS to={url} tag={NavLink} onClick={toggle} exact={exact} className="p-1 d-flex">
            {t("" + name + "")}
            <span className={"fa fa-bell custom-notification-bell mx-1"} style={{fontSize: '20px'}}>
              {notifications > 0 &&
              <span className="badge badge-danger badge-pill">{notifications}</span>
              }
            </span>
          </NavLinkRS>
        </NavItem>
      )
    }

    return (
      <NavItem className="px-2 text-center" key={i} id="#main-nav-toggler">
        <NavLinkRS to={url} tag={NavLink} onClick={toggle} exact={exact} className="p-1">
          {t("" + name + "")}
        </NavLinkRS>
      </NavItem>
    )
  }
}
