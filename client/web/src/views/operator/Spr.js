import React, {Component} from 'react';
import {Card, CardBody, CardFooter, CardHeader, Col, FormGroup, Label, ListGroup, ListGroupItem, Row} from "reactstrap";
import {inject, observer} from "mobx-react";
import AppTable from "components/AppTable";
import Button, {ConfirmButton} from "components/AppButton";
import AppInput from "components/AppInput";
import {withRouter} from "react-router-dom";
import {translate} from "react-i18next";

@translate(['common', 'settings', '']) @inject('dictStore') @withRouter @observer

export default class Spr extends Component {
  state = {page: 0, data: [], dict: null, item: null};
  register = [
    {name: "ОКГЗ", path: "/category"},
    {name: "Пользователи", path: "/users"},
    {name: "Поставщики", path: "/suppliers"},
    {name: "Закупщики", path: "/purchasers"},
    {name: "Территориальные единицы КР", path: "/coate"},
    {name: 'Филиалы', path: '/branch'},
    {name: 'Спр. документы', path: '/operator/dirdocs'}
  ];

  componentDidMount() {
    this.props.dictStore.getList();
  }

  render() {
    const {t, dictStore} = this.props;
    const {dicts} = dictStore;
    const {dict} = this.state;


    return (
      <div className="animated fadeIn">
        <Row>
          <Col md={4}>
            <AppInput placeholder='поиск'/>
            <br/>
            <Card>
              <CardHeader>
                {t('Перечень справочников')}
              </CardHeader>
              <CardBody>
                <ListGroup>
                  {dicts.map(d =>
                    <ListGroupItem key={d.name} tag="button" action
                                   active={dict ? d.table === dict.table : false}
                                   onClick={() => this.getData(d, 0)}>
                      {t("" + d.name + "")}
                    </ListGroupItem>)}
                </ListGroup>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                {t('Реестры')}
              </CardHeader>
              <CardBody>
                <ListGroup>
                  {this.register.map(r =>
                    <ListGroupItem key={r.name} tag="button" action
                                   onClick={() => this.props.history.push(r.path)}>
                      {t("" + r.name + "")}</ListGroupItem>)}
                </ListGroup>
              </CardBody>
            </Card>
          </Col>
          <Col md={8}>
            {this.renderDict()}
          </Col>
        </Row>
      </div>
    )
  }

  renderForm = () => {
    const {t} = this.props;
    const {dict, item} = this.state;
    if (!item) return;
    const makeValue = (c) => {
      if (c.name.includes('.')) {
        if (!item[c.name.split('.')[0]]) {
          item[c.name.split('.')[0]] = {};
        }
        return item[c.name.split('.')[0]][c.name.split('.')[1]] || '';
      }
      return item[c.name] || '';
    };

    return (
      <div className="animated fadeIn">
        <Card>
          <CardBody>
            <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around'}}>
              {dict.columns.map(c =>
                <Fg key={c.name} label={t(c.displayName)}>
                  <AppInput type={c.type}
                            value={makeValue(c)}
                            onChange={(e) => {
                              let val =  c.type === 'number' ? parseInt(e.target.value) : e.target.value;
                              if (c.name.includes('.')) {
                                if (!item[c.name.split('.')[0]])
                                  item[c.name.split('.')[0]] = {};
                                item[c.name.split('.')[0]][c.name.split('.')[1]] = val;
                              }
                              else {
                                item[c.name] = val;
                              }
                              this.setState({item});
                            }}/>
                </Fg>
              )}
            </div>
          </CardBody>
          <CardFooter>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <Button onClick={() => this.props.dictStore.saveDictData(dict.table, this.state.item).then(r => {
                this.getData(dict, 0);
              })}>
                <i className="fa fa-save"/> {' '} {t('Сохранить')}
              </Button>
              <Button outline onClick={() => this.setState({item: null})}>
                <i className="fa fa-close"/> {' '} {t('Отмена')}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  };

  renderDict = () => {
    const {t} = this.props;
    const {dict} = this.state;
    if (!dict) return null;

    let col = [];
    if (dict) {

      dict.columns.map(c => {
        if (c.visible)
          col.push({Header: t(c.displayName), accessor: c.name})
      });

      col.push({
        Header: '', accessor: '', width: 70,
        Cell: props => [<Button size={'sm'} color={'primary'}
                                onClick={() => this.setState({item: props.original})}>
          <i className="fa fa-edit"/>
        </Button>, ' ',
          <ConfirmButton size={'sm'} color={'danger'} onConfirm={() => this.props.dictStore.deleteDictData(dict.table, props.original).then(r => {
            this.getData(dict, 0);
          })}>
            <i className="fa fa-trash"/>
          </ConfirmButton>
        ]
      })
    }

    return (
      <Card>
        <CardHeader>{t("" +dict.name + "")}
          <div className="card-actions">
            <Button onClick={() => this.setState({item: {}})}>
              <i className="fa fa-plus"/>
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {this.renderForm()}
          <AppTable columns={col} data={this.state.data} page={this.state.page}
                    onPageChange={(idx) => {
                      this.getData(dict, idx);
                    }}/>
        </CardBody>
      </Card>
    )
  };

  getData = (dict, page) => {
    page = page || 0;
    this.props.dictStore.getDictData(dict.table, page).then(r => {
      if (page === 0) {
        this.setState({page: page, data: r, dict: dict, item: null});
      }
      else {
        this.setState({data: this.state.data.concat(r), page: page})
      }
    })
  }
}

class Fg extends Component {
  render() {
    const {label, children} = this.props;
    return (
      <FormGroup>
        <Label>{label}</Label>
        {children}
      </FormGroup>
    )
  }

}
