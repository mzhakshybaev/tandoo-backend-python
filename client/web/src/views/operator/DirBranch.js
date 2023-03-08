import React, {Component} from 'react'
import {translate} from "react-i18next";
import {withRouter} from "react-router-dom";
import {inject, observer} from "mobx-react";
import {showSuccess} from "utils/messages";
import {Card, CardBody, CardHeader, Col, Button, Input, Row} from "reactstrap";
import {FGI} from "components/AppInput";
import Select from "components/Select";

@translate(['common', 'settings', '']) @withRouter @inject('dictStore', 'adminStore') @observer
export default class DirBranch extends Component {
  state = {
    name: '',
    address: '',
    esp_id: '',
    contact: '',
    email: '',
    esps: [],
    esp: null
  };

  save = () => {
    let params = {
      name: this.state.name,
      address: this.state.address,
      esp_id: this.state.esp && this.state.esp._id,
      contact: this.state.contact,
      email: this.state.email
    };
    this.props.dictStore.saveDirBranch(params).then(
      r => {
        showSuccess('Данные сохранены')
      }
    )
  };
  componentDidMount(){
    this.props.dictStore.getDictData("ESP").then(r=> {
      this.setState({esps: r})
    })
  }

  render() {
    let {state} = this;
    return (

        <Card>
          <CardHeader>

          </CardHeader>

          <CardBody className="p-4">


            <Row className={"mb-2"}>
              <Col md="6">
                <FGI l='ЭЦП' lf="2" ls="8">
                  <Select options={state.esps}
                          placeholder="Выберите"
                          labelKey="name"
                          valueKey="_id"
                          value={state.esp}
                          onChange={(value) => this.setState({esp: value})}

                  />
                </FGI>
              </Col>
            </Row>
            <Row className={"mb-2"}>
              <Col md="6">
                <FGI l='Регион' lf="2" ls="8">
                  <Input value={this.state.name || ''}
                         onChange={e => this.setState({name: e.target.value})}/>
                </FGI>
              </Col>
            </Row>
            <Row className={"mb-2"}>
              <Col md="6">
                <FGI l='Адрес' lf="2" ls="8">
                  <Input value={this.state.address || ''}
                         onChange={e => this.setState({address: e.target.value})}/>
                </FGI>
              </Col>
            </Row>
            <Row className={"mb-2"}>
              <Col md="6">
                <FGI l='E-mail' lf="2" ls="8">
                  <Input value={this.state.email || ''}
                         onChange={e => this.setState({email: e.target.value})}/>
                </FGI>
              </Col>
            </Row>



            <Row className={"mb-2"}>
              <Col md="6">
                <FGI l='Ссылка' lf="2" ls="8">
                  <Input value={this.state.contact || ''} onChange={e => this.setState({contact: e.target.value})}/>
                </FGI>
              </Col>
            </Row>

            <Row>
              <Col md="6">
                <Button onClick={this.save}>
                  Сохранить
                </Button>
              </Col>
            </Row>


          </CardBody>
        </Card>
    );
  }

}
