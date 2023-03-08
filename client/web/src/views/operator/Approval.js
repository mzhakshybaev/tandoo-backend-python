import React from "react";
import {Card, CardBody} from "reactstrap";
import Table from "components/AppTable";

export default class Approval extends React.Component {

  render() {
    let companies = [];
    let columns = [
      {Header: "ИНН", accessor: "", minWidth: 50},
      {Header: "Название", accessor: "", minWidth: 150},
      {Header: "Форма собственности", accessor: ""},
      {Header: "Статус", accessor: ""}];
    return (
      <Card>
        <CardBody>
          <Table data={companies}
                 columns={columns}/>
        </CardBody>
      </Card>)
  }
}
