import React, {Component} from 'react';
import {Col} from "reactstrap";
import {translate} from "react-i18next";
import {Link} from "react-router-dom";
import {formatDateTime} from "../../../../../utils/helpers";
import {inject} from "mobx-react";

@translate(['common', 'settings', ''])  @inject('mainStore')
export default class AnnounceInfo extends Component {
  render() {
    let {t, announce, contract} = this.props;
    const {mainStore} = this.props;
    const {language} = mainStore;

    let label = 'name';
    if (language && language.code === 'en') {
      label = 'name_en';
    }
    if (language && language.code === 'kg') {
      label = 'name_kg';
    }

    return (
      <Col xs={12}>
        <h4>{t('Информация об объявлении')}</h4>

        <div className="ml-2">
          <p>
            <strong>{t('№ объявления') + ': '}</strong>
            <Link to={`/announce/view/${announce._id}`}>{announce.code}</Link>
          </p>
          <p>
            <strong>{t('Метод закупок') + ': '}</strong>
            {announce.dirprocurement && announce.dirprocurement[label]}
          </p>
          <p>
            <strong>{t('Дата публикации') + ': '}</strong>
            {formatDateTime(announce.created_date)}
          </p>
          <p>
            <strong>{t('Срок подачи предложения') + ': '}</strong>
            {formatDateTime(announce.deadline)}
          </p>
          {contract &&
          <p>
            <strong>{t('Дата создания договора') + ': '}</strong>
            {formatDateTime(contract.created_date)}
          </p>}
        </div>
      </Col>
    )
  }
}
