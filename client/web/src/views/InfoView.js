import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {FGI} from "components/AppInput";
import {Row, Col, Card, CardHeader, CardBody, Input} from "reactstrap";
import {translate} from "react-i18next";
import {withRouter} from "react-router-dom";


@translate(['common', 'settings', '']) @withRouter @inject('dictStore') @observer
export default class InfoView extends Component {
  state = {
    infos: []
  };

  componentDidMount() {
    let id = this.props.match.params.id;
    this.props.dictStore.test().then(r => {
      r = r.filter(p => p.esp_id === id);
      this.setState({infos: r});
      console.log("the testing are " + this.state.infos)
    })
  }


  render() {
    let {infos} = this.state;
    const {t} = this.props;
    return (
      <div>
        <h3 className="text-center">{t('Филиалы')}</h3>
        <Row>
          {infos.map((r) => {

            return  <Col md={6}> <Card > <CardHeader  key={r._id}

            > {r.name}</CardHeader>
              <CardBody className="p-4">
                <Row className={"mb-2"}>
                  <Col md="12">
                    <FGI l={t('Адрес')} lf="6">
                      <p>{r.address} </p>
                    </FGI>
                  </Col>
                </Row>
                <Row className={"mb-2"}>
                  <Col md="12">
                    <FGI l='E-mail' lf="6">
                      <p>{r.email} </p>
                    </FGI>
                  </Col>
                </Row>
                <Row className={"mb-2"}>
                  <Col md="12">
                    <FGI l={t('Ссылка')} lf="6">
                      <a href={r.contact} target="_blank">{r.contact}</a>
                    </FGI>
                  </Col>
                </Row>
              </CardBody>
            </Card></Col>
          })}</Row>
      </div>
    )
  }

}
