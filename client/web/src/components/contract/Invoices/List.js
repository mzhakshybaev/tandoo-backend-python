import React, {Component, Fragment} from 'react';
import {observer} from "mobx-react";
import {toJS} from "mobx";
import {translate} from "react-i18next";
import ReactTable from "react-table";
import {formatDate, formatMoney, getPayTypeTr, getStatusTr} from "utils/helpers";
import {Col} from "reactstrap";
import {Link} from "react-router-dom";

@translate(['common', 'settings', '']) @observer
export default class ConsListEdit extends Component {
  render() {
    let {t, items, showLink} = this.props;


    let tableProps = {
      data: toJS(items),
      columns: [
        {
          Header: '№',
          id: 'index',
          Cell: ({index}) => (index + 1),
          width: 50,
        },
        {
          Header: t('Дата платежа'),
          accessor: 'date',
          Cell: ({value}) => formatDate(value)
        },
        {
          Header: t('Вид платежа'),
          accessor: 'type',
          Cell: ({value}) => getPayTypeTr(value)
        },
        {
          Header: t('%'),
          accessor: 'percent',
          width: 80,
        },
        {
          Header: t('Сумма платежа'),
          accessor: 'amount',
          width: 120,
          Cell: ({value}) => formatMoney(value)
        },
        // {
        //   Header: t('Остаток платежа'),
        //   accessor: 'rest',
        //   Cell: ({value}) => formatMoney(value),
        // },
        {
          Header: t('Условия оплаты'),
          accessor: 'conditions',
        },
        {
          Header: t('Статус'),
          id: 'status',
          accessor: inv => inv.status || 'Pending',
          Cell: ({value}) => getStatusTr('inv', value)
        },
        // {
        //   Header:
        //     <Button className="btn-sm" title={t('Добавить платёж')} onClick={() => ctrl.addInv()}>
        //       <i className="fa fa-plus"/>
        //     </Button>
        //   ,
        //   width: 50,
        //   Cell: ({index, original}) => {
        //     if (!original.editable)
        //       return null;
        //
        //     return (
        //       <Button color="danger" className="btn-sm" title={t('Удалить платёж')} onClick={() => ctrl.removeInv(index)}>
        //         <i className="fa fa-minus"/>
        //       </Button>
        //     )
        //   }
        // }
      ],
      showPagination: false,
      minRows: 1,
      className: "-striped -highlight"
    };

    if (showLink) {
      tableProps.columns.push({
        Header: '',
        width: 50,
        accessor: 'id',
        Cell: ({value}) =>
          <Link to={`/invoice/view/${value}`}>
            <i className="fa fa-file"/>
          </Link>
      })
    }

    return (
      <Col xs={12}>
        <h4>{t('График платежей')}</h4>
        <ReactTable {...tableProps}/>
      </Col>
    )
  }
}
