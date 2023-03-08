import React, {Component} from 'react'
import {inject, observer} from "mobx-react"
import {Col, Row, Card, CardBody, Table} from 'reactstrap';
import {withRouter} from 'react-router-dom';
import {translate} from "react-i18next";
import {showSuccess} from "utils/messages";
import {Loading, Button} from "components";
import {formatDate, formatMoney, getStatusTr} from "utils/helpers";
import {repeat} from "lodash-es";
import {moneyToWords, numberToWords} from "utils/locales/number-to-words";


@translate(['common', 'settings', ''])
@inject('conViewCtrl') @withRouter @observer
export default class ConsignmentView extends Component {
  componentDidMount() {
    this.ctrl = this.props.conViewCtrl;
    this.load(this.props.match.params.id);
  }

  load(id) {
    this.id = id;
    this.ctrl.load(id);
  }

  componentWillUnmount() {
    this.id = null;
    this.ctrl.reset();
  }

  componentDidUpdate() {
    let {id} = this.props.match.params;

    if (this.id !== id) {
      this.load(id)
    }
  }

  finish = async () => {
    await this.ctrl.finish(this.id);
    showSuccess(this.props.t('Успешно завершен'));
    this.load(this.id);
  };

  render() {
    if (!(this.ctrl && this.ctrl.ready))
      return <Loading/>;

    const {t} = this.props;
    let {
      consignment: con,
      contract,
      isOwner,
      isVendor,
      countAll,
      totalAll,
      nds,
      NDS_VALUE,
    } = this.ctrl;

    return (
      <Card>
        <CardBody>
          <Row className="mb-2">
            <Col>
              <h3 className="text-center">
                {t('Накладная № {{code}} от {{date}}', {code: con.id, date: formatDate()})}
              </h3>
            </Col>
          </Row>

          <Row className="mb-2 no-padding-paragraph">
            <Col>
              <div className="ml-2">
                <p>
                  <strong>{t('Покупатель') + ': '}</strong>
                  {contract.pur_company.short_name}
                </p>
                <p>
                  <strong>{t('Продавец') + ': '}</strong>
                  {contract.sup_company.short_name}
                </p>
                <p>
                  <strong>{t('Основание для отпуска') + ': '}</strong>
                  {t('Договор № {{code}} от {{date}}', {code: contract.code, date: formatDate()})}
                </p>
                {/*<p>
                  <strong>{t('Доверенность №') + ': '}</strong>
                  <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>
                  &nbsp;от&nbsp;
                  <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>
                </p>

                <p>
                  <strong>{t('ИНН') + ': '}</strong>
                  {contract.pur_company.inn}
                </p>

                <p>
                  <strong>{t('Форма собственности') + ': '}</strong>
                  {getCompanyOwnership(contract.pur_company, typeofOwnerships)}
                </p>
                <p>
                  <strong>{t('Банк') + ': '}</strong>
                  {contract.pur_company.bank && contract.pur_company.bank.dirbank.name}
                </p>
                <p>
                  <strong>{t('БИК') + ': '}</strong>
                  {contract.pur_company.bank && contract.pur_company.bank.bik}
                </p>
                <p>
                  <strong>{t('Лицевой счет') + ': '}</strong>
                  {contract.pur_company.bank && contract.pur_company.bank.account_number}
                </p>
                <p>
                  <strong>{t('ФИО руководителя') + ': '}</strong>
                  {getCompanyFio(contract.pur_company)}
                </p>*/}
              </div>
            </Col>
          </Row>

          {/*<Row>
            <Col sm={3} md={3}>

              <span>
                {t('Кому')}:
              </span>
              <h6>
                <span><strong>{contract.pur_company.name}</strong></span><br/>
                <span>{contract.pur_company.inn}</span><br/>
                <span>{contract.pur_company.data.phone}</span><br/>
                <span>{contract.pur_company.data.email}</span><br/>
                <span>Бишкек, Кыргызская Республика</span><br/>
              </h6>
            </Col>
            <Col sm={3} md={3}>
              <span>{t('От')}:
              </span>
              <h6>
                <span><strong>{contract.sup_company.name}</strong></span><br/>
                <span>{contract.sup_company.inn}</span><br/>
                <span>{contract.sup_company.data.phone}</span><br/>
                <span>{contract.sup_company.data.email}</span><br/>
                <span>Бишкек, Кыргызская Республика</span><br/>
              </h6>
            </Col>
            <Col sm={6} md={6}>
              <span>{t('Детали')}:
              </span>
              <h6>
                <span><strong>{t('№ объявления')}: {contract.announce && contract.announce.code} </strong></span><br/>
                <span>{t('Метод закупок')}: {contract.announce && contract.announce.dirprocurement_name}</span><br/>
                <span>{t('Дата публикации')}: {contract.announce && formatDateTime(contract.announce.created_date)}</span><br/>
                <span>{t('Срок подачи предложения')}: {contract.announce && formatDateTime(contract.announce.deadline)}</span><br/>
                <span>{t('Дата создания договора')}: {formatDateTime(contract.created_date)}</span><br/>
              </h6>
            </Col>
          </Row>*/}

          <Row className="mb-2">
            <Col>
              <Table bordered size="sm" className="table-invoice">
                <thead>
                <tr>
                  <th>{t('№ п/п')}</th>
                  <th>Наименование</th>
                  <th>Ед. изм.</th>
                  <th>Кол-во</th>
                  <th>Цена</th>
                  <th>Сумма</th>
                </tr>
                </thead>

                <tbody>
                {con.lots.map((lot, i) =>
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{lot.dircategory_name}</td>
                    <td>Шт</td>
                    <td>{lot.quantity}</td>
                    <td>{formatMoney(lot.data.unit_price)}</td>
                    <td>{formatMoney(lot.total)}</td>
                  </tr>)
                }
                </tbody>
              </Table>
            </Col>
          </Row>

          <Row className="mb-2 text-nowrap">
            <Col className="no-padding-paragraph">
              <p className="">
                {t('Всего отпущено')}&nbsp;
                {/*<u dangerouslySetInnerHTML={{__html: repeat('&nbsp;', 50)}}/>*/}
                <u>{countAll} ({numberToWords(countAll)})</u>
                &nbsp;
                {/*{t('наименование')}*/}
                {t('Шт')}
              </p>
              {/*<p>*/}
                {/*<sup style={{marginLeft: 180}}>{t('прописью')}</sup>*/}
              {/*</p>*/}
              <p className="">
                {t('На сумму')}&nbsp;
                {/*<u dangerouslySetInnerHTML={{__html: repeat('&nbsp;', 50)}}/>*/}
                <u>{formatMoney(totalAll, {currency: false})} ({moneyToWords(totalAll)})</u>
                &nbsp;
                {/*{t('сом')}*/}
              </p>
              {/*<p>&nbsp;</p>*/}
              <p>
                {t('В том числе НДС')} ({NDS_VALUE}%)&nbsp;
                {/*<u dangerouslySetInnerHTML={{__html: repeat('&nbsp;', 50)}}/>*/}
                <u>{formatMoney(nds, {currency: false})} ({moneyToWords(nds)})</u>
                &nbsp;
                {/*{t('сом')}*/}
              </p>
              {/*<p>*/}
                {/*<sup style={{marginLeft: 180}}>{t('прописью')}</sup>*/}
              {/*</p>*/}
            </Col>
          </Row>

          <Row className="mb-2 text-nowrap">
            <Col className="no-padding-paragraph">
              <p>
                {t('Отпуск разрешил')}&nbsp;
                <u dangerouslySetInnerHTML={{__html: repeat('&nbsp;', 50)}}/>
                &nbsp;&nbsp;&nbsp;
                <u dangerouslySetInnerHTML={{__html: repeat('&nbsp;', 30)}}/>
                &nbsp;&nbsp;&nbsp;
                <u dangerouslySetInnerHTML={{__html: repeat('&nbsp;', 50)}}/>
              </p>
              <p>
                <sup style={{marginLeft: 180}}>{t('должность')}</sup>
                <sup style={{marginLeft: 130}}>{t('подпись')}</sup>
                <sup style={{marginLeft: 90}}>{t('расшифровка подписи')}</sup>
              </p>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col className="ml-5">
              <strong>{t('МП')}</strong>
            </Col>
          </Row>

          <Row className="mb-2 text-nowrap">
            <Col className="no-padding-paragraph">
              <p>
                {t('Отпустил')}&nbsp;
                <u dangerouslySetInnerHTML={{__html: repeat('&nbsp;', 50)}}/>
                &nbsp;&nbsp;&nbsp;
                <u dangerouslySetInnerHTML={{__html: repeat('&nbsp;', 30)}}/>
                &nbsp;&nbsp;&nbsp;
                <u dangerouslySetInnerHTML={{__html: repeat('&nbsp;', 50)}}/>
              </p>
              <p>
                <sup style={{marginLeft: 120}}>{t('должность')}</sup>
                <sup style={{marginLeft: 130}}>{t('подпись')}</sup>
                <sup style={{marginLeft: 90}}>{t('расшифровка подписи')}</sup>
              </p>
            </Col>
          </Row>

          <Row className="mb-2 text-nowrap">
            <Col className="no-padding-paragraph">
              <p>
                {t('Получил')}&nbsp;
                <u dangerouslySetInnerHTML={{__html: repeat('&nbsp;', 50)}}/>
                &nbsp;&nbsp;&nbsp;
                <u dangerouslySetInnerHTML={{__html: repeat('&nbsp;', 30)}}/>
                &nbsp;&nbsp;&nbsp;
                <u dangerouslySetInnerHTML={{__html: repeat('&nbsp;', 50)}}/>
              </p>
              <p>
                <sup style={{marginLeft: 120}}>{t('должность')}</sup>
                <sup style={{marginLeft: 130}}>{t('подпись')}</sup>
                <sup style={{marginLeft: 90}}>{t('расшифровка подписи')}</sup>
              </p>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col className="ml-5">
              <strong>{t('МП')}</strong>
            </Col>
          </Row>

          {con.got_status !== null &&
          <Row>
            <Col>
              <strong>{t('Статус')}: </strong>
              <span className="text-success">
                {getStatusTr('con', con.got_status ? 'Finished' : 'Pending')}
              </span>
            </Col>
          </Row>}

          <Row className="d-print-none">
            <Col>
              {isOwner && con.got_status !== true &&
              <Button color="primary" className="mr-2" onClick={this.finish}>{t('Завершить')}</Button>}

              <Button to={`/contracts/view/${contract.id}`} color="secondary" className="mr-2">{t('Назад')}</Button>
              <Button color="info" onClick={() => print()} className="mr-2">{t('На печать')}</Button>
            </Col>
          </Row>
        </CardBody>
      </Card>
    )
  }
}
