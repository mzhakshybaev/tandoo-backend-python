import React from 'react';
import {inject} from "mobx-react"
import {Button, ButtonGroup, Card, CardBody, CardTitle, Nav, NavItem, NavLink, TabContent, TabPane} from "reactstrap";
import Table from "components/AppTable"
import classnames from 'classnames';
import {showError, showInfo} from "utils/messages";
import {ConfirmButton} from "components/AppButton";
import {formatDate} from "../../../../utils/helpers";

@inject("adminStore")
export default class Suppliers extends React.Component {

  state = {roles: [], activeTab: 0, tabsData: []};
  tabs = [
    {index: 0, name: "Заявки", status: "waiting"},
    {index: 1, name: "Действующие", status: "confirmed"},
    {index: 2, name: "Отклоненные", status: "rejected"},
    {index: 3, name: "Черный список", status: "blacklist"},
    {index: 4, name: "Заблокированные", status: "blocked"}];

  componentDidMount() {
    this.props.adminStore.getCompanyRoles()
      .then(roles => this.setState({roles}));
    this.getData(this.tabs[0]);
  }

  getData = ({index, status}) => {
    this.props.adminStore.getCompanies({filter: {company_status: status}})
      .then(companies => {
        companies.forEach(c => c.role = null);
        this.state.tabsData[index] = companies;
        this.setState({tabsData: this.state.tabsData})
      })
  };

  toggle = (id) => {
    if (id !== this.state.activeTab)
      this.setState({activeTab: id})
  };

  onTabClick = (tab) => {
    this.toggle(tab.index);
    if (!this.state.tabsData[tab.index])
      this.getData(tab)
  };

  onRoleClick = (company, role) => {
    company.role = role;
    this.setState({tabsData: this.state.tabsData});
  };

  onBlockActivateClick = (company, status) => {
    let {_id, roles_id} = company;
    this.props.adminStore.changeCompanyStatus({
      id: _id,
      roles_id,
      company_status: status
    })
      .then(r => showError("Организация заблокирована"))
      .catch(e => showError(e && e.message || "Произошла ошибка при блокировке"))
  };

  updateStatus(company, status) {
    // if (!company.role)
    //   showInfo("Выберите роль организации");
    // else {
    let param = {
      id: company._id,
      roles_id: [company.role],
      company_status: status
    };
    this.props.adminStore.changeCompanyStatus(param)
      .then(r => {
        this.setState({tabsData: []}, () => this.getData(this.tabs[0]));
      });
    // }
  }

  render() {
    // TODO : Move out defaultColumns, all buttons from render function (causes performance issues)
    let defaultColumns = [
      {Header: "ИНН", accessor: "inn"},
      {Header: "Наименование", accessor: "name"},
      {Header: "Краткое наименование", accessor: "short_name"},
      {Header: "Статус", accessor: "company_status"},
      {Header: "Дата регистрации", accessor: "_created", Cell: ({value}) => formatDate(value),},];

    let viewButton = {
      width: 40,
      filterable: false,
      Cell: props => <Button size={"sm"} color={'primary'} title={"Просмотр"}
                             onClick={() => this.props.history.push({
                               pathname: "/operator/company/view",
                               query: {id: props.original._id}
                             })}>
        <i className={"fa fa-eye"}/></Button>
    };

    let blockButton = {
      width: 40,
      filterable: false,
      Cell: props => <ConfirmButton size={'sm'} color={'danger'} title={'Вы действительно хотите заблокировать?'}
                                    onConfirm={() => this.onBlockActivateClick(props.original, "blocked")}>
        <i className="fa fa-ban"/>
      </ConfirmButton>
    };

    let [role1, role2] = this.state.roles;
    let roleButtons = {
      Header: "Роль", width: 163, filterable: false,
      Cell: props => {
        return (role1 && role2 &&
          <ButtonGroup>
            <Button size={"sm"} color="success" outline onClick={() => this.onRoleClick(props.original, role1._id)}
                    active={props.original.role === role1._id}>{role1.name}</Button>
            <Button size={"sm"} color="primary" outline onClick={() => this.onRoleClick(props.original, role2._id)}
                    active={props.original.role === role2._id}>{role2.name}</Button>
          </ButtonGroup>)

      }
    };

    let endDate = {
      Header: "Дата блокировки",
      width: 163,
      filterable: false,
      accessor: "end_date",
      Cell: ({value}) => value ? formatDate(value) : ''
    };

    let actionButtons = {
      width: 110, filterable: false,
      Cell: props => [
        <ConfirmButton key={1} size={'sm'} color={'success'}
                       onConfirm={() => this.updateStatus(props.original, "confirmed")}
                       title="Подтвердить?">
          <i className="fa fa-check"/>
        </ConfirmButton>, ' ',
        <ConfirmButton key={2} size={'sm'} color={'danger'}
                       onConfirm={() => this.updateStatus(props.original, "rejected")}
                       title="Отклонить?">
          <i className="fa fa-minus"/>
        </ConfirmButton>, ' ',
        <ConfirmButton key={3} size={'sm'} color={'danger'}
                       onConfirm={() => this.updateStatus(props.original, 'blacklist')}
                       title="Добавить в черный список?">
          <i className="fa fa-close"/>
        </ConfirmButton>, ' ',
      ]
    };
    return (
      <div className="animated fadeIn">
        <Card>
          <CardBody>
            <CardTitle>Реестр организаций поставщиков</CardTitle>
            <Nav tabs>
              {this.tabs.map((tab, i) => (
                <NavItem key={i}>
                  <NavLink className={classnames({active: this.state.activeTab === tab.index})}
                           onClick={() => this.onTabClick(tab)}>{tab.name}</NavLink>
                </NavItem>
              ))}
            </Nav>
            <TabContent activeTab={this.state.activeTab}>
              {
                this.tabs.map(tab => {
                  let columns = defaultColumns.slice();
                  if (tab.index === 0)
                    columns.push(actionButtons);
                  if (tab.index === 1)
                    columns.push(endDate);
                  columns.push(viewButton);
                  columns.push(blockButton);
                  return (
                    <TabPane key={tab.index} tabId={tab.index}>
                      <Table data={this.state.tabsData[tab.index]}
                             showRowNumbers={true}
                             columns={columns}/>
                    </TabPane>)
                })
              }
            </TabContent>
          </CardBody>
        </Card>
      </div>
    )
  }
}
