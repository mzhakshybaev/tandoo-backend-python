import React, {Component} from 'react';
import {observer} from "mobx-react";
import {toJS} from "mobx";
import {translate} from "react-i18next";
import ReactTable from "react-table";
import moment from "moment";
import {DatePicker, Button, Input} from 'components';
import {formatMoney, getPayTypeTr} from "utils/helpers";

@translate(['common', 'settings', '']) @observer
export default class ConsListEdit extends Component {
  render() {
    let {t, items, ctrl} = this.props;


    let tableProps = {
      data: toJS(items),
      columns: [
        /*<th>{t('Дата платежа')}</th>
        <th>{t('Вид платежа')}</th>
        <th>{t('Сумма платежа')}</th>
        <th>{t('Остаток суммы платежа')}</th>
        <th>{t('Условия оплаты')}</th>*/

        {
          Header: '№',
          id: 'index',
          Cell: ({index}) => (index + 1),
          width: 50,
        },
        {
          Header: t('Дата платежа'),
          accessor: 'date',
          style: {overflow: 'visible'},
          Cell: this.renderDatePicker,
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
          Cell: cell => {
            let {original, value} = cell;

            if (!original.editable) {
              return value;

            } else {
              return this.renderEditable(cell)
            }
          }
        },
        {
          Header: t('Сумма платежа'),
          accessor: 'amount',
          width: 120,
          Cell: cell => {
            let {original, value} = cell;

            if (!original.editable) {
              return formatMoney(value);

            } else {
              return this.renderEditable(cell)
            }
          }
        },
        {
          Header: t('Остаток платежа'),
          accessor: 'rest',
          Cell: ({value}) => formatMoney(value),
        },
        {
          Header: t('Условия оплаты'),
          accessor: 'conditions',
          Cell: this.renderEditable,
        },
        {
          Header:
            <Button className="btn-sm" title={t('Добавить платёж')} onClick={() => ctrl.addInv()}>
              <i className="fa fa-plus"/>
            </Button>
          ,
          width: 50,
          Cell: ({index, original}) => {
            if (!original.editable)
              return null;

            return (
              <Button color="danger" className="btn-sm" title={t('Удалить платёж')} onClick={() => ctrl.removeInv(index)}>
                <i className="fa fa-minus"/>
              </Button>
            )
          }
        }
      ],
      sortable: false,
      showPagination: false,
      minRows: 1,
      className: "-striped -highlight"
    };

    return (
      <ReactTable {...tableProps}/>
    )
  }

  renderDatePicker = ({index, value}) => {
    let dpProps = {
      value: value,
      minDate: moment(), // today
      onChange: val => this.props.ctrl.updateInv(index, 'date', val),
      withPortal: true
    };

    return (
      <DatePicker {...dpProps}/>
    )
  };


  renderEditable = ({index, column, value}) => {
    let params = {
      value: value.toString(),
      onChange: e => this.props.ctrl.updateInv(index, column.id, e.target.value),
    };

    if (['percent', 'amount'].includes(column.id)) {
      params = {
        ...params,
        type: 'number',
        min: 0,
        step: 0.01,
        style: {
          textAlign: 'center'
        }
      };

      if (column.id === 'percent') {
        params.max = 100
      }
    }

    return <Input {...params}/>
  };

}
