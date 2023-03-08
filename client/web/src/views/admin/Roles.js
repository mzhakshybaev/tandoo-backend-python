import React, {Component} from 'react';
import {Card, CardBody, CardFooter, CardHeader, Col, ListGroup, ListGroupItem, Row} from "reactstrap";
import Table from "components/AppTable";
import Button from "components/AppButton";
import {inject, observer} from "mobx-react";
import {FormInput} from "components/AppInput";
import Input from "components/AppInput";
import Select from "components/Select";
import Selector from "components/Select";
import Switcher from "components/Switcher";
import {translate} from "react-i18next";


@inject('adminStore') @translate(["common", "settings", '']) @observer
export default class Roles extends Component {

  componentDidMount() {
    this.props.adminStore.getRoles();
    this.props.adminStore.getMenus();
    this.props.adminStore.getApis();
  }

  render() {
    const {adminStore,t} = this.props;
    const {role, roles, apis, api, menus} = adminStore;

    return (
      <div className="animated fadeIn">
        <Card>
          <CardHeader>
            Roles
          </CardHeader>
          <CardBody>
            <Row>
              <Col xs="12" sm="6" lg="6">
                {roles.filter(m => m.parent_id === null).map(p =>
                  <Card key={p._id}>
                    <CardHeader onClick={() => {
                      adminStore.setRole(p);
                      this.setState({parent: null});
                    }}>
                      {p.name}
                    </CardHeader>
                    <CardBody>
                      <ListGroup>
                        {roles.filter(m => m.parent_id === p._id).map(m =>
                          <ListGroupItem color="info" key={m._id} tag="button" action
                                         onClick={() => adminStore.setRole(m)}>
                            {m.name}
                          </ListGroupItem>
                        )}
                      </ListGroup>

                    </CardBody>
                  </Card>
                )}
              </Col>
              <Col xs="12" sm="6" lg="6">
                <Card>
                  <CardHeader>
                    {t('Роль')}
                    <div className="card-actions">
                      <Button onClick={() => adminStore.setRole()}>
                        <i className="fa fa-plus"/>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <FormInput label='parent'>
                      <Selector options={roles.slice()}
                              value={role.parent_id && role.parent_id.toString()}
                              labelKey='name'
                              valueKey='_id'
                              simpleValue
                              onChange={(val) => role.parent_id = val}/>
                    </FormInput>
                    <FormInput label={t('Меню')}>
                      <Selector options={menus.slice()}
                                value={role.menus_id && role.menus_id.toString()}
                                labelKey='name'
                                valueKey='_id'
                                multi
                                simpleValue
                                onChange={(val) => role.menus_id = val}/>
                    </FormInput>
                    <FormInput label={t('Название')}><Input model={role} name='name'/></FormInput>
                  </CardBody>
                  <CardFooter>
                    <Button onClick={() => adminStore.saveRole()} disabled={!adminStore.canSaveRole}>Save</Button>
                  </CardFooter>
                </Card>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            Api
          </CardHeader>
          <CardBody>
            <Row>
              <Col xs="12" sm="6" lg="6">
                <Table data={apis.slice()}
                       columns={[
                         {Header: t('Название'), accessor: 'name'},
                         {
                           Header: 'Active',
                           accessor: 'active',
                           Cell: props => <div className='text-center'>{props.value ? 'true' : 'false'}</div>,
                         },
                         {
                           Header: 'Log', accessor: 'log',
                           Cell: props => <div className='text-center'>{props.value ? 'true' : 'false'}</div>
                         }
                       ]}
                       pageSize={5}
                       onClick={api => adminStore.setApi(api)}/>
              </Col>
              <Col xs="12" sm="6" lg="6">
                <Card>
                  <CardHeader>
                    {t('Роль')}
                    <div className="card-actions">
                      <Button onClick={() => adminStore.setApi()}>
                        <i className="fa fa-plus"/>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <FormInput label={t('Название')}><Input model={api} name='name'/></FormInput>
                    <FormInput label={t('Роли')}>
                      <Select options={roles.slice()}
                              value={api.roles_id && api.roles_id.toString()}
                              labelKey='name'
                              valueKey='_id'
                              multi
                              simpleValue
                              onChange={(val) => api.roles_id = val}/>
                    </FormInput>
                    <FormInput label='Active'><Switcher model={api} name={'active'}/></FormInput>
                    <FormInput label='Log'><Switcher model={api} name={'log'}/></FormInput>
                  </CardBody>
                  <CardFooter>
                    <Button onClick={() => adminStore.saveApi()} disabled={!adminStore.canSaveApi}>Save</Button>
                  </CardFooter>
                </Card>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    );
  }
}
