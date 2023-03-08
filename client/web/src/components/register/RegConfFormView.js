import React, {Component} from 'react';
import {observer} from 'mobx-react';
import {FormInput} from "../AppInput";
import {Col, Card, CardHeader, CardBody, CardFooter, Input, FormText} from "reactstrap";
import Button from "../AppButton";
import {translate} from "react-i18next";
import {Redirect, withRouter} from "react-router-dom";

@translate(['common', 'settings', '']) @withRouter @observer
export default class RegConfFormView extends Component {
  componentWillUnmount() {
    this.props.form.unmount()
  }

  render() {
    let {t, form} = this.props;

    if (form.isComplete) {
      return <Redirect to="/home"/>
    }

    let $password = form.$('password'),
      $password_confirmation = form.$('password_confirmation');

    return (
      <Card>
        <CardHeader>
          {t('Регистрация поставщика')}
        </CardHeader>

        <form onSubmit={form.onSubmit}>

          <CardBody className="p-4">
            <h4 className="mb-4">{t('Для завершения регистрации введите пароль')}</h4>

            <Col className="mb-2">
              <FormInput label={t('Пароль')} fb={$password.error}>
                <Input {...$password.bind()} className={$password.error ? 'is-invalid' : ''} autoFocus/>
                <FormText color="muted">{t('Не менее 6 символов (букв, цифр)')}</FormText>
              </FormInput>
            </Col>

            <Col className="mb-2">
              <FormInput label={t('Подтвердите пароль')} fb={$password_confirmation.error}>
                <Input {...$password_confirmation.bind()} className={$password_confirmation.error ? 'is-invalid' : ''}/>
              </FormInput>
            </Col>

          </CardBody>

          <CardFooter>
            <Button disabled={!form.canSubmit()}>
              {t('Зарегистрировать')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    )
  }
}
