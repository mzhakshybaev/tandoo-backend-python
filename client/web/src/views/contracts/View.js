import React, {Component, Fragment} from 'react';
import {Col, Row, Card, CardBody} from 'reactstrap';
import {inject, observer} from 'mobx-react';
import {withRouter} from 'react-router-dom';
import {translate} from 'react-i18next';
import {Input, Button, Loading, ContractView as ContractDetails} from 'components';
import {ConfirmButton} from 'components/AppButton';
import {showError, showSuccess} from "utils/messages";

@translate(['common', 'settings', ''])
@withRouter @inject('contractViewCtrl', 'authStore') @observer
export default class ContractView extends Component {
  componentDidMount() {
    this.ctrl = this.props.contractViewCtrl;
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

  sendOTP = async () => {
    try {
      await this.ctrl.sendSignOTP();

    } catch (e) {
      console.warn(e);
      showError(e && e.message || 'Ошибка. Попробуйте позже.');
    }
  };

  setOTP = value => {
    this.ctrl.setOTP(value)
  };

  sup_submit = async () => {
    try {
      let {user} = this.props.authStore;
      let errMsg = 'У Вас нет полномочий для этой подписи.Необходим учетная запись Руководителя организации.'

      if (user.roleType.roleType === 1) {
        if (user.roleType.id !== 8) {
          showError(errMsg);
          return;
        }
      } else if (user.roleType.roleType === 2) {
        if (user.roleType.id !== 5) {
          showError(errMsg);
          return;
        }
      }

      await this.ctrl.sup_submit();
      showSuccess('Успешно подписан');

    } catch (e) {
      console.warn(e);
      showError(e && e.message || 'Ошибка. Попробуйте позже.');
    }
  };

  sup_decline = async () => {
    try {
      await this.ctrl.sup_decline();
      showSuccess('Успешно отклонён');

    } catch (e) {
      console.warn(e);
      showError(e && e.message || 'Ошибка. Попробуйте позже.');
    }
  };

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
      contract, consignments, invoices, isOwner, isVendor,
      otpStatus, otpCode, canSubmitSign,
      OTP_INIT, OTP_SENDING, OTP_SENT
    } = this.ctrl;

    let consFinished = consignments && consignments.every(con => con.got_status === true);
    let invsFinished = invoices && invoices.every(inv => inv.status === 'Finished');
    let canFinish = consFinished && invsFinished;

    return (
      <div>
        <Card>
          <CardBody>

            <ContractDetails contract={contract} showLots consignments={consignments} invoices={invoices}/>

            <Row className="d-print-none mt-2">
              <Col>

                {isOwner && (
                  <Fragment>
                    {contract.status.in_('Schedule', 'Review') &&
                    <Fragment>
                      <Button className="mt-2 ml-2" to={`/purchaser/contracts/schedule_edit/${contract.id}`}>
                        {t('Графики поставок и платежей')}
                      </Button>
                      <Button className="mt-2 ml-2" color="danger">
                        {t('Отменить')}
                      </Button>
                    </Fragment>
                    }

                    {contract.status === 'Active' &&
                    <Fragment>
                      {canFinish &&
                      <Button color="primary" className="mt-2 ml-2" onClick={this.finish}>{t('Завершить')}</Button>}
                    </Fragment>
                    }
                  </Fragment>
                )}

                {isVendor && (() => {
                  // if (contract.status === 'Pending') {
                  //   if (otpStatus === OTP_INIT) {
                  //     return (
                  //       <Fragment>
                  //         <Button className="mt-2 ml-2" onClick={this.sendOTP}>{t('Подписать Договор')}</Button>
                  //       </Fragment>
                  //     );
                  //
                  //   } else if (otpStatus === OTP_SENDING) {
                  //     return <Loading/>
                  //
                  //   } else if (otpStatus === OTP_SENT) {
                  //     return (
                  //       <Row>
                  //         <Col md={6} className="mt-2">
                  //           {t('Код подтверждения отправлен Вам в СМС. Введите его в поле ниже.')}
                  //           <Input placeholder="Код OTP" autoFocus value={otpCode}
                  //                  onChange={e => this.setOTP(e.target.value)}/>
                  //           <Button className="mt-2" onClick={this.sup_submit}
                  //                   disabled={!canSubmitSign}>{t('Отправить')}</Button>
                  //         </Col>
                  //       </Row>
                  //     )
                  //   }
                  // }

                  if (contract.status === 'Pending') {
                    return (
                      <Fragment>
                        <Button className="mt-2 ml-2" onClick={this.sup_submit}>{t('Подписать Договор')}</Button>

                        <ConfirmButton title={t('Вы уверены, что хотите отклонить договор?')}
                                       onConfirm={this.sup_decline}
                                       className="mt-2 ml-2" color="danger">{t('Отклонить')}</ConfirmButton>
                      </Fragment>
                    )
                  }
                })()}

                <Button color="info" className="ml-2 mt-2" onClick={() => print()}>{t('На печать')}</Button>

                <Button className="ml-2 mt-2" color="secondary" onClick={e => history.back()}>
                  {t('Назад')}
                </Button>
              </Col>
            </Row>

          </CardBody>
        </Card>
      </div>
    )
  }
}
