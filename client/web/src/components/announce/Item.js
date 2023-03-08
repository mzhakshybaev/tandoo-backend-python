import {translate} from "react-i18next";
import {Card, CardBody, CardHeader, Col, Row} from "reactstrap";
import {Link} from "react-router-dom";
import {formatDateTime, formatMoney, getStatusTr} from "utils/helpers";
import React from "react";

@translate(['common', 'settings', ''])
export default class AnnounceItem extends React.Component {
  render() {
    const {t, announcement: a} = this.props;

    return (
      <Card className={"cardShadow"}>
        <CardHeader>
          <Row>
            <Col md={6}>
              <Link to={`/announce/view/${a._id}`}>
                <strong>№ {a.code}</strong>
              </Link>
            </Col>
            <Col md={6}>
              {t('Закупающая организация')}: {a.organization}
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          <Row>
            <Col md={6}>
              <h6>
                <strong>{t('Статус')}: </strong>
                <span>{getStatusTr('announce', a.status)}</span>
              </h6>
              <h6>
                <strong>{t('Наименование закупки')}: </strong>
                <Link to={`/announce/view/${a._id}` /* ` */}>{a.dirsection}</Link>
              </h6>
              <h6><strong>{t('Количество лотов')}: </strong><span>{a.count_lot}</span></h6>
              {a.hide !== true && <h6><strong>{t('Сумма закупок')}: </strong><span>{formatMoney(a.budget)}</span></h6>}
            </Col>

            <Col md={6}>
              <h6><strong>{t('Опубликовано')}: </strong><span>{formatDateTime(a.published_date)}</span></h6>
              <h6><strong>{t('Завершение')}: </strong><span>{formatDateTime(a.deadline)}</span></h6>
              <h6><strong>{t('Метод закупок')}: </strong><span>{a.dirprocurement}</span></h6>
            </Col>
          </Row>
        </CardBody>
      </Card>
    )
  }
}
