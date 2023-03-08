import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {FGI} from "components/AppInput";
import {Row, Col, Card, CardHeader, CardBody, Input} from "reactstrap";
import Button from "components/AppButton";
import {translate} from "react-i18next";
import {withRouter} from "react-router-dom";
import {showSuccess} from "utils/messages";
import Select from "../../components/Select";

@translate(['common', 'settings', '']) @withRouter @inject('dictStore') @observer
export default class CoateAdd extends Component {
  state = {
    code: '',
    name: '',
    center: '',
    name_en: '',
    name_kg: '',
    parent_id: ''
  };




  save = () => {
    let params = {
      code: this.state.code,
      name: this.state.name,
      center: this.state.center,
      name_en: this.state.name_en,
      name_kg: this.state.name_kg,
      parent_id: this.state.parent_id

    };

    this.props.dictStore.putCoate(params)
      .then(r => {
        showSuccess('Данные сохранены');
        this.props.history.push("/coate");
      })
  };



  render() {


    return (
      <Card>
        <CardHeader>
          Редактирование
        </CardHeader>

        <CardBody className="p-4">


          <Row className={"mb-2"}>
            <Col md="12">
              <FGI l='Наименование' lf="2" ls="8">
                <Input   value={this.state.name || ''}
                       onChange={e => this.setState({name: e.target.value})}/>
              </FGI>
            </Col>
          </Row>
          <Row className={"mb-2"}>
            <Col md="12">
              <FGI l='Наименование_EN' lf="2" ls="8">
                <Input   value={this.state.name_en || ''}
                       onChange={e => this.setState({name_en: e.target.value})}/>
              </FGI>
            </Col>
          </Row>
          <Row className={"mb-2"}>
            <Col md="12">
              <FGI l='Наименование_KG' lf="2" ls="8">
                <Input   value={this.state.name_kg || ''}
                       onChange={e => this.setState({name_kg: e.target.value})}/>
              </FGI>
            </Col>
          </Row>
          <Row className={"mb-2"}>
            <Col md="12">
              <FGI l='Родитель' lf="2" ls="8">
                <Input   value={this.state.parent_id || ''}
                       onChange={e => this.setState({parent_id: e.target.value})}/>
              </FGI>
            </Col>
          </Row>


          <Row className={"mb-2"}>
            <Col md="12">
              <FGI l='Центр' lf="2" ls="8">
                <Input value={this.state.center || ''} onChange={e => this.setState({center: e.target.value})}/>
              </FGI>
            </Col>
          </Row>

          <Row className={"mb-2"}>
            <Col md="12">
              <FGI l='Код' lf="2" ls="8">
                <Input value={this.state.code || ''} onChange={e => this.setState({code: e.target.value})}/>
              </FGI>
            </Col>
          </Row>



          <Row>
            <Col md="12">
              <Button onClick={this.save}>
                Сохранить
              </Button>
            </Col>
          </Row>

        </CardBody>
      </Card>
    )
  }
}
