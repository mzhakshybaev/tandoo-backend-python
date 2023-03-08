import React, {Component} from "react";
import {translate} from "react-i18next";
import {inject, observer} from "mobx-react";
import Table from "components/AppTable";
import {Link} from "react-router-dom";
import {formatMoney, getStatusTr} from "utils/helpers";
import {toJS} from "mobx";

@translate(['common', 'settings', '']) @inject('mainStore') @observer
export default class ContractsListTable extends Component {


  render() {
    let {t, columns, contracts} = this.props;

    columns = columns || [
      // default columns
      {accessor: 'id', show: false},
      {
        Header: t('№ Договора'),
        accessor: 'code',
        Cell: ({value, row}) =>
          <Link to={`/contracts/view/${row.id}`}>{value}</Link>
      },
      {Header: t('Закупающая организация'), accessor: "pur_company"},
      {Header: t('Предмет закупки'), accessor: "dirsection"},
      {Header: t('Поставщик'), accessor: "sup_company"},
      {Header: t('Статус'), accessor: "status", Cell: ({value}) => getStatusTr('contract', value)},
      {Header: t('Сумма'), accessor: "total", Cell: ({value}) => formatMoney(value)},
    ];

    return (
      <Table data={toJS(contracts)}
             minRows={1}
             filterable={false}
             showPagination={contracts.length > 10}
             showRowNumbers={true}
             columns={columns}/>
    )
  }
}
