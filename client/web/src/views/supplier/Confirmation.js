import React from 'react';
import {Row, Col, Container} from "reactstrap";
import form from 'components/register/RegConfForm';
import RegConfFormView from 'components/register/RegConfFormView'

export default () => (
  <Container>
    <Row className="justify-content-center">
      <Col md="6">
        <RegConfFormView form={form}/>
      </Col>
    </Row>
  </Container>
)
