import React, {Component} from 'react'
import {inject, observer} from "mobx-react"
import {Col, Row, Card, CardBody, Table} from 'reactstrap';
import {Button} from 'components';
import {withRouter} from 'react-router-dom';
import {translate} from "react-i18next";
import {showSuccess} from "../../../../utils/messages";
import Loading from "../../components/Loading";
import {formatDate, formatMoney, getPayTypeTr, getStatusTr} from "../../../../utils/helpers";
import {repeat} from "lodash-es";
import {moneyToWords} from "utils/locales/number-to-words";


@translate(['common', 'settings', ''])
@inject('invViewCtrl') @withRouter @observer
export default class InvoiceView extends Component {
  componentDidMount() {
    this.ctrl = this.props.invViewCtrl;
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

  finish = async () =>{
    await this.ctrl.finish(this.id);
    showSuccess(this.props.t('Успешно завершен'));
    this.load(this.id);
  };

  render() {
    if (!(this.ctrl && this.ctrl.ready))
      return <Loading/>;

    const {t} = this.props;
    let {
      invoice: inv,
      contract,
      isOwner,
      isVendor,
      nds,
      amount_free,
      NDS_VALUE,
    } = this.ctrl;


    return (
      <Card>
        <CardBody>

          <Row className="mb-2 no-padding-paragraph">
            <Col>
              {/*<h4>{t('Поставщик')}</h4>*/}

              <div className="ml-2">
                <p>
                  <strong>{t('Продавец') + ': '}</strong>
                  {contract.sup_company.short_name}</p>
                <p>
                  <strong>{t('ИНН') + ': '}</strong>
                  {contract.sup_company.inn}
                </p>
                {/*<p>
                  <strong>{t('Форма собственности') + ': '}</strong>
                  {getCompanyOwnership(contract.sup_company, typeofOwnerships)}
                </p>*/}
                <p>
                  <strong>{t('Банк') + ': '}</strong>
                  {contract.sup_company.bank && contract.sup_company.bank.dirbank.name}
                </p>
                <p>
                  <strong>{t('Лицевой счет') + ': '}</strong>
                  {contract.sup_company.bank && contract.sup_company.bank.account_number}
                </p>
                <p>
                  <strong>{t('БИК') + ': '}</strong>
                  {contract.sup_company.bank && contract.sup_company.bank.bik}
                </p>
                {/*<p>
                  <strong>{t('ФИО руководителя') + ': '}</strong>
                  {getCompanyFio(contract.sup_company)}
                </p>*/}
              </div>
            </Col>
          </Row>

          <Row className="mb-2">
            <Col>
              <h3 className="text-center">
                {t('Счет № {{code}} от {{date}}', {code: inv.id, date: formatDate()})}
              </h3>
            </Col>
          </Row>

          <Row className="mb-2 no-padding-paragraph">
            <Col>
              {/*<h4>{t('Закупщик')}</h4>*/}

              <div className="ml-2">
                <p>
                  <strong>{t('Покупатель') + ': '}</strong>
                  {contract.pur_company.short_name}
                </p>
                <p>
                  <strong>{t('ИНН') + ': '}</strong>
                  {contract.pur_company.inn}
                </p>

                {/*<p>
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
                  <th rowSpan={2}>{t('№ п/п')}</th>
                  <th rowSpan={2}>Наименование</th>
                  {/*<th rowSpan={2}>Ед. изм.</th>*/}
                  {/*<th rowSpan={2}>Кол-во</th>*/}
                  {/*<th rowSpan={2}>Цена</th>*/}
                  <th rowSpan={2}>Сумма без учета НДС</th>
                  <th colSpan={2}>НДС</th>
                  <th rowSpan={2}>Сумма с учетом НДС</th>
                </tr>
                <tr>
                  <th>ставка</th>
                  <th>сумма</th>
                </tr>
                </thead>

                <tbody>
                <tr>
                  <td>1</td>
                  <td>{getPayTypeTr(inv.type)}</td>
                  {/*<td></td>*/}
                  {/*<td>{d.quantity}</td>*/}
                  {/*<td>{formatMoney(d.unit_price)}</td>*/}
                  {/*<td>{formatMoney(d.total)}</td>*/}
                  <td>{formatMoney(amount_free)}</td>
                  <td>{NDS_VALUE}%</td>
                  <td>{formatMoney(nds)}</td>
                  <td>{formatMoney(inv.amount)}</td>
                </tr>
                {/*{contract.lots.map((d, i) =>*/}
                  {/*<tr key={i}>*/}
                    {/*<td>{i + 1}</td>*/}
                    {/*<td>{d.dircategory_name}</td>*/}
                    {/*<td></td>*/}
                    {/*<td>{d.quantity}</td>*/}
                    {/*<td>{formatMoney(d.unit_price)}</td>*/}
                    {/*<td>{formatMoney(d.total)}</td>*/}
                    {/*<td></td>*/}
                    {/*<td></td>*/}
                    {/*<td></td>*/}
                  {/*</tr>*/}
                {/*)}*/}
                <tr>
                  <th colSpan={5} className="text-right">{t('Всего по счету')}</th>
                  <td>{formatMoney(inv.amount)}</td>
                  {/*<td></td>*/}
                </tr>
                </tbody>
              </Table>
            </Col>
          </Row>

          <Row className="mb-5">
            <Col>
              {t('Всего к оплате на сумму')}:
              {' '}
              {formatMoney(inv.amount, {currency: false})}
              {' '}
              ({moneyToWords(inv.amount)})
            </Col>
          </Row>

          <Row className="mb-2 text-nowrap">
            <Col xs={12} md={6} className="no-padding-paragraph mb-5">
              <p className="ml-2">
                {t('Руководитель')}
                &nbsp;&nbsp;&nbsp;
                <u dangerouslySetInnerHTML={{__html: repeat('&nbsp;', 25)}}/>
                &nbsp;&nbsp;&nbsp;
                <u dangerouslySetInnerHTML={{__html: repeat('&nbsp;', 50)}}/>
              </p>
              <p>
                <sup style={{marginLeft: 130, marginRight: 120}}>{t('подпись')}</sup>
                <sup>{t('Ф.И.О.')}</sup>
              </p>
            </Col>

            <Col xs={12} md={6} className="no-padding-paragraph">
              <p className="ml-2">
                {t('Главный бухгалтер')}
                &nbsp;&nbsp;&nbsp;
                <u dangerouslySetInnerHTML={{__html: repeat('&nbsp;', 25)}}/>
                &nbsp;&nbsp;&nbsp;
                <u dangerouslySetInnerHTML={{__html: repeat('&nbsp;', 50)}}/>
              </p>
              <p>
                <sup style={{marginLeft: 170, marginRight: 120}}>{t('подпись')}</sup>
                <sup>{t('Ф.И.О.')}</sup>
              </p>
            </Col>
          </Row>

          {inv.status !== null &&
          <Row>
            <Col>
              <strong>{t('Статус')}: </strong>
              <span className="text-success">
                {getStatusTr('inv', inv.status)}
              </span>
            </Col>
          </Row>}

          <Row className="d-print-none">
            <Col>
              {isOwner && inv.status === null &&
              <Button color="primary" className="mr-2" onClick={this.finish}>{t('Завершить')}</Button>}

              <Button to={`/contracts/view/${contract.id}`} color="secondary" className="mr-2">{t('Назад')}</Button>
              <Button color="info" className="mr-2" onClick={() => print()}>{t('На печать')}</Button>
            </Col>
          </Row>
        </CardBody>
      </Card>
    )
  }
}
