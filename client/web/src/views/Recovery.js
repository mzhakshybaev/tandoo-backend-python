import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import {Card, CardBody, Col, Container, Form, FormText, Row} from "reactstrap";
import Button from "components/AppButton";
import Input, {FGI} from "components/AppInput";
import SmsCodeInput from "components/SmsCodeInput";
import TelInput from "components/TelInput";
import {withRouter} from "react-router-dom";
import {showError, showInfo} from 'utils/messages';
import {computed, observable, runInAction} from "mobx";
import Countdown from "react-countdown-now";

@inject('authStore') @withRouter @observer
export default class Recovery extends Component {
  @observable email = '';
  @observable phone = '';
  @observable otp = '';
  @observable isCountingDown = false;

  componentWillUnmount() {
    this.email = '';
    this.phone = '';
    this.otp = '';
    this.isCountingDown = false;
  }

  render() {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col md="9">
            <Form onSubmit={this.submit}>
              <Card>
                <CardBody className="p-4">
                  <h2 className="mb-4">Восстановление</h2>
                  <Row className="mb-2">
                    <Col md="8">
                      <FGI l="Email" lf="5" ls="7">
                        <Input type="email" value={this.email} onChange={e => this.email = e.target.value}
                               autoFocus={!this.isCountingDown} disabled={this.isCountingDown}/>
                        <FormText color="muted">Укажите Электронную почту</FormText>
                      </FGI>
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col md="8">
                      <FGI l="Моб. телефон" lf="5" ls="7">
                        <TelInput value={this.phone} onChange={v => this.phone = v} disabled={this.isCountingDown}/>
                        <FormText color="muted">Укажите зарегистрированный на ваше имя номер</FormText>
                      </FGI>
                    </Col>

                    <Col md="4">
                      <Button size="sm" onClick={this.sendCode} disabled={!this.canSendSmsCode || this.isCountingDown}>
                        Прислать СМС с кодом
                      </Button>
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col md="8">
                      <SmsCodeInput lf="5" ls="7" value={this.otp}
                                    autoFocus={this.isCountingDown}
                                    disabled={!this.isCountingDown}
                                    callback={v => this.otp = v}>
                      </SmsCodeInput>
                    </Col>

                    {this.isCountingDown &&
                    <Col md="4">
                      Осталось времени:
                      {' '}
                      <Countdown date={this.countdownTime} daysInHours={true}
                                 onComplete={() => this.isCountingDown = false}/>
                    </Col>
                    }
                  </Row>

                  <Row className="mb-2 text-center">
                    <Col>
                      <Button type="submit" disabled={!this.canSubmit}>Подтвердить</Button>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Form>
          </Col>
        </Row>
      </Container>
    )
  }

  @computed
  get canSendSmsCode() {
    let {email, phone} = this;

    if (email && phone) {
      // TODO : is it done right ?
      phone = phone.replace(/[+ ]/g, '');
      return (/^\d+$/.test(phone))
    }

    return false
  }

  sendCode = async () => {
    if (this.isCountingDown)
      return;

    let {authStore} = this.props;

    let {email, phone} = this;

    try {
      await authStore.sendSmsCode({email, phone});

      showInfo('На Ваш мобильный телефон отправлено смс');

      runInAction(() => {
        this.isCountingDown = true;
        this.countdownTime = Date.now() + 3 * 60 * 1000;
      });

    } catch (e) {
      showError(e.message)
    }
  };

  @computed
  get canSubmit() {
    const {canSendSmsCode, otp} = this;

    return canSendSmsCode && otp && (otp.length >= 6) && (/^\d+$/.test(otp));
  }

  submit = async e => {
    e.preventDefault();

    let {authStore} = this.props;
    let {email, phone, otp} = this;

    try {
      await authStore.validateSmsCode(phone, otp);

      authStore.setRecoveryData({email, phone, otp}); // temp
      this.props.history.push('/recovery/confirm');

    } catch (e) {
      showError(e.message)
    }
  }
};
