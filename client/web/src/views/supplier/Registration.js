import React from 'react';
import {Row, Col, Container} from "reactstrap";
import form from 'components/register/RegForm';
import RegFormView from 'components/register/RegFormView';

export default () => (
  <Container>
    <Row className="justify-content-center">
      <Col md="9">
        <RegFormView form={form}/>
      </Col>
    </Row>
  </Container>
)
