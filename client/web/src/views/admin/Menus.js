import React, {Component} from 'react';
import {Card, CardBody, CardFooter, CardHeader, Col, ListGroup, ListGroupItem, Row} from "reactstrap";
import Button from "components/AppButton";
import {inject, observer} from "mobx-react";
import Input, {FormInput} from "components/AppInput";
import Selector from "components/Select";
import MDSpinner from "react-md-spinner";
import Switcher from "components/Switcher";
import {translate} from "react-i18next";
import Swal from "sweetalert2";

@translate(['common', 'settings', '']) @inject('adminStore') @observer
export default class Menus extends Component {

  state = {parent_id: null};

  componentDidMount() {
    this.props.adminStore.getMenus();
    this.props.adminStore.getRoles();
  }

  async confirmDeleteMenu(index) {
    let res = await Swal({
      title: 'Вы действительно хотите удалить меню?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Да',
      cancelButtonText: 'Отмена'
    });

    if (res.value) {
      this.props.adminStore.removeMenu();
    }
  };

  render() {
    const {t, adminStore} = this.props;
    const {menus, menu, roles} = adminStore;
    if (adminStore.menus.length === 0) return <MDSpinner/>;
    const parents = menus.filter(m => !m.parent_id).sort((a, b) => a.order > b.order);
    return (
      <div className="animated fadeIn">
        <Card>
          <CardBody>
            <Row>
              <Col md={3}>
                <ListGroup>
                  {parents.map(p =>
                    <ListGroupItem onClick={() => {
                      adminStore.setMenu(p);
                      this.setState({parent: null});
                    }} key={p._id}>
                      {p.name}
                    </ListGroupItem>
                  )}
                </ListGroup>
              </Col>
              <Col md={9}>
                <Card>
                  <CardHeader>
                    {menu.id ? menu.name : 'Создать'}
                    <div className="card-actions">
                      <Button onClick={() => adminStore.setMenu()}>
                        <i className="fa fa-plus"/>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <FormInput label={'Parent'}>
                      <Selector options={parents.slice()}
                                value={menu.parent_id}
                                labelKey='name'
                                valueKey='_id'
                                simpleValue
                                onChange={(val) => menu.parent_id = val}/>
                    </FormInput>
                    <FormInput label={'Name'}> <Input model={menu} name={'name'}/> </FormInput>
                    <FormInput label={'Order'}> <Input type='number' model={menu} name={'order'}/> </FormInput>
                    <FormInput label={'роль'}> <Input type='number' model={menu} name={'role'}/> </FormInput>
                    <FormInput label={'Url'}> <Input model={menu} name={'url'}/> </FormInput>
                    <FormInput label={'Active'}> <Switcher model={menu} name={'active'}/> </FormInput>
                  </CardBody>
                  <CardFooter>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <Button onClick={() => adminStore.saveMenu()} disabled={!adminStore.canSaveMenu}>Сохранить</Button>
                      <Button color="danger" outline onClick={() => this.confirmDeleteMenu()} disabled={!adminStore.canSaveMenu}>
                        <i className="fa fa-close"/> {' '} {t('Удалить')}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    )
  }
}
