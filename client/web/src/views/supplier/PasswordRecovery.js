import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import {Card, CardBody, Col, Container, Collapse, Row} from "reactstrap";
import Input, {FGI} from "components/AppInput";
import Button from "components/AppButton";
import SmsCodeInput from "components/SmsCodeInput";
import {withRouter} from "react-router-dom";

@inject('authStore') @withRouter @observer
export default class PasswordRecovery extends Component {

  constructor(props) {
    super(props);
    this.state = {email: null, phoneNumber: null, smsCode: null, isCountingDown: false, toggle: false};
  }

  toggle() {
    this.setState({toggle: !this.state.toggle})
  }

  render() {
    return (
      <Container>
        <Row className={"justify-content-center"}>
          <Col md={"6"}>
            <Card>
              <CardBody className="p-4">
                <h4 className="mb-4">Восстановление пароля</h4>
                <FGI l={"Введите email"} lf={"4"} ls={"6"}>
                  <Input className="mb-2"
                         value={this.state.email}
                         onChange={(elem) => {
                           this.setState({email: elem.target.value})
                         }}/>
                </FGI>
                <FGI l={"Введите мобильный номер"} lf={"4"} ls={"6"}>
                  <Input className="mb-2"
                         value={this.state.phoneNumber}
                         onChange={(elem) => {
                           this.setState({phoneNumber: elem.target.value})
                         }}/>
                </FGI>

                <Row>
                  <Col md="6" className="mt-2">
                    <Button block>Отправить на email</Button>
                  </Col>

                  <Col md="6" className="mt-2">
                    <Button block onClick={() => {
                      if (!this.state.toggle)
                        this.toggle();
                      if (!this.state.isCountingDown)
                        this.setState({isCountingDown: true});
                    }}>Отправить код на номер</Button>
                  </Col>
                </Row>

                <Collapse isOpen={this.state.toggle} className={"mt-4"}>
                  <SmsCodeInput lf="7" ls="5"
                                callback={(value) => {
                                  this.setState({smsCode: value}, () => {
                                    let valid = this.props.authStore.validateSmsCode(this.state.smsCode);
                                    if (valid)
                                      this.props.history.push('/home')
                                  });
                                }}
                                disabled={!this.state.isCountingDown}
                                isCountingDown={this.state.isCountingDown}
                                onTimerComplete={() => {
                                  // TODO : Countdown has competed, what should we do?
                                  window.location.reload()
                                }}/>
                </Collapse>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }
};
