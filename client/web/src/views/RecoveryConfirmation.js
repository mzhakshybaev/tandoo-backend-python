import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import {Card, CardBody, CardFooter, Col, Container, Form, FormText, Row} from "reactstrap";
import Button from "components/AppButton";
import Input, {FormInput} from "components/AppInput";
import {Redirect, withRouter} from "react-router-dom";
import {observable} from "mobx";
import {showError, showSuccess} from "utils/messages";

@inject("authStore") @withRouter @observer
export default class RecoveryConfirmation extends Component {
  @observable password = '';
  @observable confirmPassword = '';

  componentWillUnmount() {
    this.password = '';
    this.confirmPassword = '';
  }

  submit = async e => {
    e.preventDefault();

    let {password, confirmPassword} = this;

    try {
      await this.props.authStore.recoveryPassword({password, confirmPassword});
      showSuccess('Ваш пароль успешно обновлён!');
      this.props.history.push('/home')
    } catch (e) {
      debugger
      showError(e.message);
    }
  };

  render() {
    if (!this.props.authStore.recoveryData)
      return <Redirect to="/recovery"/>;

    return (
      <Container>
        <Row className={"justify-content-center"}>
          <Col md={"6"}>
            <Form onSubmit={this.submit}>
              <Card>
                <CardBody className="p-4">
                  <h4 className="mb-4">Восстановление</h4>

                  <Col className="mb-2">
                    <FormInput label="Пароль">
                      <Input type="password" value={this.password} autoFocus
                             onChange={e => this.password = e.target.value}/>
                      <FormText color="muted">Пароль должен составлять из не меньше 8 символов (букв, цифр)</FormText>
                    </FormInput>
                  </Col>

                  <Col className="mb-2">
                    <FormInput label="Подтвердите пароль">
                      <Input type="password" value={this.confirmPassword}
                             onChange={e => this.confirmPassword = e.target.value}/>
                    </FormInput>
                  </Col>
                </CardBody>

                <CardFooter>
                  <Button type="submit">Изменить пароль</Button>
                </CardFooter>
              </Card>
            </Form>
          </Col>
        </Row>
      </Container>
    )
  }
};
