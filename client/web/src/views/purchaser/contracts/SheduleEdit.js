import React, {Component, Fragment} from 'react';
import {Card, CardBody, Col, Row} from 'reactstrap';
import {withRouter} from 'react-router-dom';
import {inject, observer} from 'mobx-react';
import {translate} from 'react-i18next';
import {Button, Loading, AnnouncePayments, ContractView} from 'components';
import ConsListEdit from 'components/contract/Consignments/Edit';
import InvoiceListEdit from 'components/contract/Invoices/Edit';
import {showError, showSuccess} from "utils/messages";


@translate(['common', 'settings', '']) @withRouter @inject('purScheduleEditCtrl') @observer
export default class ScheduleEdit extends Component {
  state = {statuses: ['Schedule', 'Review']};

  componentDidMount() {
    window.ctrl = this.props.purScheduleEditCtrl;
    this.load(this.props.match.params.id);
  }

  load(id) {
    this.id = id;
    this.props.purScheduleEditCtrl.load(id);
  }

  componentWillUnmount() {
    this.id = null;
    this.props.purScheduleEditCtrl.reset();
  }

  componentDidUpdate() {
    let {id} = this.props.match.params;

    if (this.id !== id) {
      this.load(id)
    }
  }

  onUpdate = async () => {
    try {
      await this.props.purScheduleEditCtrl.update();
      showSuccess(this.props.t('Успешно сохранено. Готово к подписанию!'));

    } catch (e) {
      showError(e.message || 'Ошибка')
    }
  };

  onSubmit = async () => {
    try {
      await this.props.purScheduleEditCtrl.submit();
      showSuccess(this.props.t('Успешно подписан!'));

    } catch (e) {
      showError(e.message || 'Ошибка')
    }
  };

  render() {
    let ctrl = this.props.purScheduleEditCtrl;
    let {ready, isOwner} = ctrl;
    if (!ready || !isOwner)
      return <Loading/>;

    let {t} = this.props;
    let {contract, consignments, invoices, canUpdate, canSubmit} = ctrl;
    let {announce} = contract;

    return (
      <div>
        <Card>
          <CardBody>

            <ContractView contract={contract} showLots preTitle={t('Графики поставок и платежей')}/>

            <Row className="mb-2">
              <Col md={6}>
                <AnnouncePayments payments={announce.data && announce.data.payments}/>
              </Col>
            </Row>

            <Row className="mb-2">
              <Col>
                <h4>{t('Сроки поставок')}</h4>
                <ConsListEdit items={consignments} ctrl={ctrl}/>
              </Col>
            </Row>

            <Row className="mb-2">
              <Col>
                <h4>{t('График платежей')}</h4>
                <InvoiceListEdit items={invoices} ctrl={ctrl}/>
              </Col>
            </Row>

            <Row className="d-print-none mt-4">
              <Col>
                <Button className="mr-2" color="secondary" to={`/purchaser/contracts/view/${contract.id}`}>
                  {t('Назад')}
                </Button>
                {this.state.statuses.includes(contract.status) &&
                <Fragment>
                  <Button className="mr-2" color="primary" disabled={!canUpdate} onClick={this.onUpdate}>
                    {t('Сохранить')}
                  </Button>
                  <Button className="mr-2" color="primary" onClick={this.onSubmit}>
                    {t('Подписать')}
                  </Button>
                </Fragment>
                }
                <Button color="info" className="mr-2" onClick={() => print()}>{t('На печать')}</Button>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    )
  }
}
