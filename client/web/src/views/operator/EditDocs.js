import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {FGI} from "components/AppInput";
import {Row, Col, Card, CardHeader, CardBody, Input} from "reactstrap";
import Button from "components/AppButton";
import {translate} from "react-i18next";
import {withRouter} from "react-router-dom";
import {showSuccess} from "utils/messages";
import Select from "components/Select";

@translate(['common', 'settings', '']) @withRouter @inject('adminStore') @observer
export default class EditDocs extends Component {
  state = {
    username: '',
    email: '',
    fullname: '',
    inn: '',
    phone: '',
    roles_id: []
  };

  componentDidMount() {
    this.props.adminStore.getRoles();
    this.getDirdoc();
  }

  async getUser() {
    let id = this.props.match.params.id; // from route

    let doc = await this.props.adminStore.getDirdoc(id);
    this.setState({
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      inn: user.inn,
      phone: user.phone,
      roles_id: user.roles_id
    });
  }

  save = () => {
    let params = {
      id: this.props.match.params.id,
      username: this.state.username,
      email: this.state.email,
      fullname: this.state.fullname,
      inn: this.state.inn,
      phone: this.state.phone,
      roles_id: this.state.roles_id
    };

    this.props.adminStore.saveUser(params)
      .then(r => {
        showSuccess('Данные сохранены');
        this.props.history.push("/users");
      })
  };

  updateRoles(roles_id) {
    this.setState({roles_id})
  }

  render() {
    let {adminStore, t} = this.props;
    const {roles} = adminStore;

    return (
      <Card>
        <CardHeader>
          Редактирование пользователя
        </CardHeader>

        <CardBody className="p-4">

          <Row className={"mb-2"}>
            <Col md="12">
              <FGI l='Логин' lf="2" ls="8">
                <Input value={this.state.username || ''} onChange={e => this.setState({email: e.target.value})}/>
              </FGI>
            </Col>
          </Row>

          <Row className={"mb-2"}>
            <Col md="12">
              <FGI l={t('Email')} lf="2" ls="8">
                <Input placeholder={'xxxx@mail.ru'} autoFocus value={this.state.email || ''}
                       onChange={e => this.setState({email: e.target.value})}/>
              </FGI>
            </Col>
          </Row>

          <Row className={"mb-2"}>
            <Col md="12">
              <FGI l={t('ФИО')} lf="2" ls="8">
                <Input placeholder={t('Фамилия Имя Отчество')} value={this.state.fullname || ''}
                       onChange={e => this.setState({fullname: e.target.value})}/>
              </FGI>
            </Col>
          </Row>

          <Row className={"mb-2"}>
            <Col md="12">
              <FGI l={t('ИНН')} lf="2" ls="8">
                <Input value={this.state.inn || ''} onChange={e => this.setState({inn: e.target.value})}/>
              </FGI>
            </Col>
          </Row>

          <Row className={"mb-2"}>
            <Col md="12">
              <FGI l={t('Моб. телефон')} lf="2" ls="8">
                <Input value={this.state.phone || ''} onChange={e => this.setState({phone: e.target.value})}/>
              </FGI>
            </Col>
          </Row>

          <Row className={"mb-2"}>
            <Col md="12">
              <FGI l='Роли' lf="2" ls="8">
                <Select options={roles.slice()}
                        value={this.state.roles_id && this.state.roles_id.toString()}
                        labelKey='name'
                        valueKey='_id'
                        multi
                        simpleValue
                        onChange={(val) => this.updateRoles(val)}/>
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
