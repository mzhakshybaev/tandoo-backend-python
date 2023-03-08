import React from 'react';
import {Col, Row, Table} from "reactstrap";
import {formatDateTime, formatMoney} from "utils/helpers";
import {translate} from "react-i18next";

export default translate(['common', 'settings', ''])(props => {
  const {t} = props;
  let {apps} = props;
  // debugger
  let app = apps[0].app;
  let total = apps.reduce((a, v) => {
    // debugger
    return a + v.app.total
  }, 0);

  // debugger

  return (
    <div>
      <Row className="mt-2">
        <Col>
          <h4>{t('Данные предложения')}</h4>
        </Col>
      </Row>
      <Row>
        <Col md={6} xs={12} className="no-padding-paragraph ml-2">
          <p><strong>{t('Статус') + ': '}</strong>{t(app.status)}</p>
          <p>
            <strong>{t('Дата публикации') + ': '}</strong>{app._created && formatDateTime(app._created)}
          </p>
          <p><strong>{t('Кол-во позиций') + ': '}</strong>{apps.length}</p>
          <p><strong>{t('Сумма') + ': '}</strong>{formatMoney(total)}</p>

          {/*<p><strong>{t('Планируемая сумма') + ': '}</strong>{formatMoney(announce.budget)}</p>*/}
          {/*<p><strong>{t('Срок подачи предложения') + ': '}</strong>{announce.deadline && formatDateTime(announce.deadline)}</p>*/}
        </Col>
      </Row>
    </div>
  )
})
