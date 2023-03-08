import React, {Component} from 'react';
import {observer} from 'mobx-react';
import {FGI} from "../AppInput";
import SmsCodeInput from "../SmsCodeInput";
import Countdown from "react-countdown-now";
import {Row, Col, Card, CardHeader, CardBody, Input, FormText} from "reactstrap";
import Button from "../AppButton";
import {translate} from "react-i18next";
import {MaskedInput} from "../MaskedInput";
import {Redirect, withRouter} from "react-router-dom";

@translate(['common', 'settings', '']) @withRouter @observer
export default class RegFormView extends Component {
  onClickCancel = () => {
    this.props.history.push('/home')
  };

  componentWillUnmount() {
    this.props.form.unmount()
  }

  render() {
    let {t, form} = this.props;

    if (form.isComplete) {
      return <Redirect to="/registration/supplier/password"/>
    }

    let $fullname = form.$('fullname'),
        $email = form.$('email'),
        $phone = form.$('phone'),
        $otp = form.$('otp');

    return (
      <Card>
        <CardHeader>
          {t('Регистрация поставщика')}
        </CardHeader>

        <CardBody className="p-4">

          <form onSubmit={form.onSubmit}>

            <Row className={"mb-2"}>
              <Col md="12">
                <FGI l={t('ФИО')} lf="2" ls="8" f={$fullname.error}>
                  <Input {...$fullname.bind()}
                         className={$fullname.error ? 'is-invalid' : ''}
                         placeholder={t('Фамилия Имя Отчество')}
                         autoFocus
                  />
                  <FormText color="muted">{t('Укажите свою фамилию, имя и отчество')}</FormText>
                </FGI>
              </Col>
            </Row>

            <Row className={"mb-2"}>
              <Col md="12">
                <FGI l={t('Email')} lf="2" ls="8" f={$email.error}>
                  <Input {...$email.bind()} placeholder="xxxx@mail.ru" className={$email.error ? 'is-invalid' : ''}/>
                  <FormText color="muted">{t('Укажите действующую свою личную электронную почту')}</FormText>
                </FGI>
              </Col>
            </Row>

            <Row className={"mb-2"}>
              <Col md="7">
                <FGI l={t('Моб. телефон')} lf="4" ls="8" f={$phone.error}>
                  <MaskedInput type="phone"
                               mask="+\9\96 (999) 99 99 99"
                               {...$phone.bind()}
                               disabled={form.isCountingDown}
                               invalid={!!$phone.error}
                  />
                  <FormText color="muted">{t('Укажите зарегистрированный на ваше имя номер')}</FormText>
                </FGI>
              </Col>

              <Col md="5">
                <Button onClick={form.sendOTP} disabled={!form.canSendSmsCode()}>
                  {t('Прислать СМС с кодом')}
                </Button>
              </Col>
            </Row>

            <Row>
              <Col md="6">
                <SmsCodeInput lf="5" ls="7" f={$otp.error}
                              {...$otp.bind()}
                              disabled={!form.isCountingDown}
                              invalid={!!$otp.error}
                />
              </Col>
              <Col md="3">
                {form.isCountingDown &&
                <Countdown date={form.countdownTime}
                           daysInHours={true}
                           onComplete={form.onCountdownComplete}
                />}
              </Col>
            </Row>

            <Row>
              <Col md="12">
                <Button block disabled={!form.canConfirmCode()}>
                  {t('Подтвердить')}
                </Button>
                <Button type="button" active block color="secondary" aria-pressed="true" onClick={this.onClickCancel}>
                  {t('Отмена')}
                </Button>
              </Col>
            </Row>

          </form>

        </CardBody>
      </Card>
    )
  }
}
