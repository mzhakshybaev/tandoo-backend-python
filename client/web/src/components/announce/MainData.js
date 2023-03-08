import React, {Component} from 'react';
import {Col, Row} from "reactstrap";
import {formatDateTime, formatMoney, getStatusTr} from "utils/helpers";
import {translate} from "react-i18next";
import {Link} from "react-router-dom";
import {inject} from "mobx-react";
@translate(['common', 'settings', ''])  @inject('mainStore')
export default class MainData extends Component{
  render(){
  const {t} = this.props;
  let {announce, title, showLink} = this.props;
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
    <div>
      <Row>
        <Col md={6} xs={12}>
          <h4>{title || t('Общие Данные')}</h4>
        </Col>
      </Row>

      <Row className="no-padding-paragraph mb-2">
        <Col md={6} xs={12}>
          <div className="ml-2">
            <p>
              <strong>{t('№ Объявления') + ': '}</strong>
              {showLink ?
                <Link to={`/announce/view/${announce._id}`}>{announce.code}</Link> :
                announce.code
              }
            </p>
            <p>
              <strong>{t('Закупающая организация') + ': '}</strong>
              {announce.company && announce.company.name}</p>
            <p>
              <strong>{t('Метод закупок') + ': '}</strong>
              {announce.dirprocurement && announce.dirprocurement[label]}
            </p>
            {announce.dirprocurement && announce.dirprocurement.with_concession &&
            <p>
              <strong>{t('Льгота для внутренних поставщиков') + ': '}</strong>
              {announce.concession} %
            </p>}
            <p>
              <strong>{t('Наименование закупки') + ': '}</strong>
              {announce.dirsection && announce.dirsection[label]}
            </p>
          </div>
        </Col>
        <Col md={6} xs={12}>
          <div className="ml-2">
            <p>
              <strong>{t('Статус') + ': '}</strong>
              {getStatusTr('announce', announce.status)}</p>
            {announce.hide !== true && <p>
              <strong>{t('Планируемая сумма') + ': '}</strong>
              {formatMoney(announce.budget)}
            </p>}
            <p>
              <strong>{t('Дата публикации') + ': '}</strong>
              {announce.published_date && formatDateTime(announce.published_date)}
            </p>
            <p>
              <strong>{t('Срок подачи предложения') + ': '}</strong>
              {announce.deadline && formatDateTime(announce.deadline)}
            </p>
            { announce.guarantee && announce.guarantee > 0 &&
              <p>
                <strong>{t('Сумма гарантийного обеспечения исполнения Договора') + ': '}</strong>
                {announce.guarantee} %
              </p>
            }
          </div>
        </Col>
      </Row>
      {announce.data.tehadress &&
        <Row className="no-padding-paragraph mb-2">
          <Col>
            <div>
              {t('Технический контроль испытаний: ')} {announce.data.tehadress}

            </div>
          </Col>
        </Row>
      }
      <Row className="no-padding-paragraph mb-2">
        <Col>
          <div>
            {t('Гарантия')} <br/>
            {t('Гарантийный период на товар не менее ')}
            {announce.data.guarant_day}
            {t(' дней с момента поставки')}
          </div>
           <div>
            {t('Замена бракованного товара производится в течении ')}
             {announce.data.defect_day}
            {t(' рабочих дней с момента получения уведомления с покупателя')}
          </div>
        </Col>
      </Row>
    </div>
  )
}
}
