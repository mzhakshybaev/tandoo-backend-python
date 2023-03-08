import React, {Component} from "react";
import {Card, CardBody, Col, Row} from "reactstrap";
import {inject, observer} from "mobx-react";
import Attributes from "./Attributes";
import Spinner from "components/Loading";
import List from "./List";

@inject("specStoreV2") @observer
export default class Specifications extends Component {

  componentDidMount() {
    this.props.specStoreV2.load();
  }

  componentWillUnmount() {
    this.props.specStoreV2.reset();
  }

  render() {
    let {ready, specification} = this.props.specStoreV2;

    if (!ready)
      return <Spinner/>;

    return (
      <Card className={"animated fadeIn"}>
        <CardBody>
          <Row>
            <Col xs="12" sm="12" lg={4}>
              <List/>
            </Col>
            <Col xs="12" sm="12" md="12" lg="8">
              {specification && <Attributes/>}
            </Col>
          </Row>
        </CardBody>
      </Card>
    )
  }
}
