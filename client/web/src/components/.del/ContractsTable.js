import React, {Component} from "react";
import {observer} from "mobx-react";
import {Link} from "react-router-dom";
import {formatMoney} from "utils/helpers";
import Table from "components/AppTable";

@observer
export default class AnnContractsTable extends Component {
  render() {
    let {contracts, isOwner} = this.props;

    let columns = [
      {accessor: 'id', show: false},
      {
        Header: '№ Договора',
        accessor: 'code',
        Cell: ({value, row}) => {
          if (isOwner && row.status === 'Schedule') {
            return <Link to={`/schedule/edit/${row.id}`}>{value}</Link> // `
          } else {
            return <Link to={`/supplier/contracts/view/${row.id}`}>{value}</Link> // `
          }
        }
      },
      // {Header: "Закуп. организация", accessor: "pur_company"},
      // {Header: "Предмет закупки", accessor: "dirsection"},
      {Header: "Поставщик", accessor: "sup_company"},
      {Header: "Статус", accessor: "status"},
      {
        Header: "Сумма",
        accessor: "total",
        Cell: ({value}) => formatMoney(value)
      },
    ];

    return (
      <Table columns={columns}
             data={contracts}
             minRows={1}
             filterable={false}
             showPagination={contracts.length > 10}
             showRowNumbers={true}
      />
    )
  }
}
