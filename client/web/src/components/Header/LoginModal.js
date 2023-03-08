import React, {Component} from 'react';
import {
  Col,
  Form,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader, Row
} from "reactstrap";
import Input from "../AppInput";
import Button from "../AppButton";
import {inject, observer} from "mobx-react";
import {Link, withRouter} from 'react-router-dom'
import {translate} from "react-i18next";

@translate(['common', 'settings', '']) @inject('authStore') @observer @withRouter
class LoginModal extends Component {
  constructor(props) {
    super(props);
    this.state = {login: null, password: null};
  }

  onSubmitLoginForm = async ev => {
    ev.preventDefault();
    let {authStore, toggle} = this.props;
    this.props.history.push("/");
    let r = await authStore.login(this.state.login, this.state.password);
    if (r)
      toggle();
  };

  render() {
    let {t, isOpen, toggle, className} = this.props;

    return (
      <Modal isOpen={isOpen} toggle={toggle} className={className} backdrop="static">
        <Form onSubmit={this.onSubmitLoginForm}>
          <ModalHeader toggle={toggle}>{t('Авторизация')}</ModalHeader>
          <ModalBody>
            <InputGroup className="mb-3">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="fa fa-user"/>
                </InputGroupText>
              </InputGroupAddon>
              <Input type="text" placeholder={t('Введите Email или телефон (996XXXXXXXXX)')} value={this.state.login}
                     onChange={(e) => this.setState({login: e.target.value})}/>
            </InputGroup>
            <InputGroup className="mb-4">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="fa fa-lock"/>
                </InputGroupText>
              </InputGroupAddon>
              <Input type="password" placeholder={t('Пароль')} value={this.state.password}
                     onChange={(e) => this.setState({password: e.target.value})}/>
            </InputGroup>
          </ModalBody>

          {/*<ModalFooter style1={{'justify-content': 'center'}}>*/}
          <Row className="pb-3">
            <Col md={6}>
              <Button color="link" to="/registration/supplier" className="" onClick={toggle}>
                {t('Регистрация')}
              </Button>
            </Col>
            <Col md={6}>
              <Button color="link" to="/recovery" className="" onClick={toggle}>
                {t('Забыли пароль?')}
              </Button>
              <Button color="primary" type="submit" className="px-4">
                {t('Вход')}
              </Button>
            </Col>
          </Row>
          {/*</ModalFooter>*/}
        </Form>
      </Modal>
    )
  }
}

export default LoginModal
