/**
 * Created by asylbek on 5.26.18
 */

import React, {Component} from 'react';
import {Button, Card, CardBody, Col, Container, Row} from 'reactstrap';
import {inject, observer} from "mobx-react";
import {withRouter} from "react-router-dom";

@inject("mainStore") @withRouter @observer
class Register extends Component {
  render() {
    return (
      <div className="app flex-row align-items-center animated fadeIn"
           style={{minHeight: "60vh"}}>
        <Container>
          <Row className="justify-content-center">
            <Col md="9">
              <Card className="mx-4">
                <CardBody className="p-4" style={{textAlign: "center"}}>
                  <h2>Для регистрации выберите роль</h2>
                  <Row>
                    <Col xs="12" sm="5" className="m-4">
                      <Button size="lg" color="success" block>Закупающая организация</Button>
                    </Col>
                    <Col xs="12" sm="5" className="m-4">
                      <Button size="lg" color="success" block
                              onClick={() => {
                                let userData = {role_type: 2};
                                this.props.authStore.setUser(userData);  // 2 Supplier
                                this.props.history.push("/registration/supplier")
                              }}>Поставщик (Продавец)</Button>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Register;
