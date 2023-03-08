import React from 'react';
import {inject} from "mobx-react"
import Table from "components/AppTable"

@inject("adminStore")
export default class BlackList extends React.Component {

  state = {};
  componentDidMount() {
    this.props.adminStore.getCompanies()
      .then(company => {
        company=company.filter(s => s.company_status === "blacklist");

        this.setState({company})
        console.log(company)
      })
  }


  render() {
    // TODO : Move out defaultColumns, all buttons from render function (causes performance issues)
    let defaultColumns = [
      {Header: "ИНН", accessor: "inn"},
      {Header: "Наименование", accessor: "name"},
      {Header: "Краткое наименование", accessor: "short_name"},
      {Header: "Статус", accessor: "company_status"},
      {Header: "Дата регистрации", accessor: "_created"},];


    return (<div className="animated fadeIn">
      <Table data={this.state.company}
              columns = {defaultColumns}
      />

      </div>

    )
  }
}
