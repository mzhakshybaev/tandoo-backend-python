import React from 'react';
import Table from "components/AppTable"
import {inject} from "mobx-react"
import Button from 'components/AppButton';
@inject("adminStore")
export default class Purchasers extends React.Component {

  state = {};

  componentDidMount() {
    this.props.adminStore.getCompanies().then(purchasers => {
      purchasers = purchasers.filter(p => p.roles_id[0] === '0b3620f3-5d63-46c6-95a6-08f0882e2d08'); // TODO: hardcode, Закупщик
      this.setState({purchasers})
    })
  }

  render() {
    let columns = [];
    columns.push({
      Header: "Список закупщиков", columns: [
        {Header: "ИНН", accessor: "inn"},
        {Header: "Наименование", accessor: "name"},
        {Header: "Короткое название", accessor: "short_name"},
        {Header: "Статус", accessor: "status"},
        {Header: "Дата регистрации", accessor: "_created"}]
    });

    return (
      <div className="animated fadeIn">
        <Button to="/purchaser/add">Добавить</Button>
        <Table data={this.state.purchasers}
               columns={columns}/>
      </div>
    )
  }
}
