import React, {Component} from "react"
import {inject, observer} from "mobx-react"
import {Link} from "react-router-dom";
import {translate} from "react-i18next";

@translate(['common', 'settings', ''])
@inject("supplierStore", "mainStore") @observer
export default class SupplierHome extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {t} = this.props;
    return (
      <div className="app flex-row align-items-center justify-content-center"
           style={{minHeight: "60vh", textAlign: "center"}}>
        <Link to="/companies/add">{t('Добавить')}</Link>
        <h3>{t('Добро пожаловать в личный кабинет поставщика!')}</h3>
      </div>)
  }
}
