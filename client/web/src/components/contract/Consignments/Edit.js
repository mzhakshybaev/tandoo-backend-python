import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import {observable, action, toJS} from "mobx";
import {translate} from "react-i18next";
import ReactTable from "react-table";
import moment from "moment";
import {Button, DatePicker, Input, Select} from "components";

@translate(['common', 'settings', '']) @inject('mainStore') @observer
export default class ConsListEdit extends Component {
  @observable ready = false;
  @observable items;

  render() {
    let {t, items, ctrl} = this.props;
    let tableProps = {
      data: toJS(items),
      columns: [
        {
          Header: '',
          width: 50,
          expFer: true,
          Expander: ({isExpanded, ...rest}) =>
            <Button size="sm" outline color="default">
              {isExpanded
                ? <i className="fa fa-minus" title={t('Свернуть')}/>
                : <i className="fa fa-plus" title={t('Раскрыть')}/>
              }
            </Button>
        },
        {
          Header: '№',
          id: 'index',
          Cell: ({index}) => index + 1,
          width: 50,
        },
        {
          Header: t('Дата начала поставки'),
          accessor: 'date_from',
          style: {overflow: 'visible'},
          width: 120,
          Cell: this.renderDatePicker,
        },
        {
          Header: t('Дата завершения поставки'),
          accessor: 'date_to',
          width: 120,
          Cell: this.renderDatePicker,
        },
        {
          Header: t('Кол-во позиций'),
          accessor: 'lots.length',
          width: 100,
        },
        {
          Header: t('Место поставки'),
          accessor: 'address',
          Cell: this.renderEditable,
        },
        {
          Header: t('Условия поставки'),
          accessor: 'conditions',
          Cell: this.renderEditable,
        },
        {
          Header: (
            <Button className="btn-sm" title={t('Добавить поставку')} onClick={() => ctrl.addCon()}>
              <i className="fa fa-plus"/>
            </Button>
          ),
          width: 50,
          Cell: ({index}) =>
            <Button color="danger" className="btn-sm" title={t('Удалить поставку')}
                    onClick={() => ctrl.removeCon(index)}>
              <i className="fa fa-minus"/>
            </Button>
        }
      ],
      sortable: false,
      showPagination: false,
      minRows: 1,
      className: "-striped -highlight border-tr",
      collapseOnDataChange: false,
      SubComponent: this.renderExpandTable,
    };

    return (
      <ReactTable {...tableProps}/>
    )
  }

  renderDatePicker = ({index, value, column, row}) => {
    let params = {
      value,
      minDate: (column.id === 'date_from') ? moment() : row.date_from,
      onChange: val => this.props.ctrl.updateCon(index, column.id, val),
      withPortal: true,
    };

    return (
      <DatePicker {...params}/>
    )
  };

  renderEditable = ({index, row, value, column}) => {
    return (
      <Input value={value} onChange={e => this.props.ctrl.updateCon(index, column.id, e.target.value)}/>
    )
  };

  renderLotSelect(cidx, index, row, curLot) {
    let {ctrl} = this.props;
    let lots = ctrl.getSelectLots(cidx, curLot);

    let selParams = {
      options: lots,
      value: curLot,
      valueRenderer: this.renderLotOption,
      optionRenderer: this.renderLotOption,
      clearable: false,
      onChange: val => ctrl.setConLot(cidx, index, val)
    };

    return (
      <Select {...selParams}/>
    )
  }

  renderLotOption = option => {
    const {mainStore} = this.props;
    let lang = mainStore.language.code;
    let name_key = (lang === 'ru') ? 'name' : ('name_' + lang);
    let index = this.props.ctrl.contract.lots.findIndexById(option._id);
    return `${index + 1}. ${option.dircategory[0][name_key]}`;
  };

  renderExpandTable = ({original, index}) => {
    const {mainStore} = this.props
    let lang = mainStore.language.code;
    let name_key = (lang === 'ru') ? 'name' : ('name_' + lang);
    const {t, ctrl} = this.props;
    let cidx = index;

    let tableProps = {
      data: toJS(original.lots),
      sortable: false,
      columns: [
        {
          Header: '№',
          id: 'index',
          Cell: ({index}) => index + 1,
          width: 50,
        },
        {
          Header: t('Категория'),
          accessor: 'advert_lot',
          style: {overflow: 'visible'},
          Cell: ({value, index, row}) => this.renderLotSelect(cidx, index, row, value)
        },
        {
          Header: t('Ед. изм'),
          id: 'units',
          accessor: row => row.advert_lot.dirunit[name_key],
          width: 100,
        },
        {
          Header: t('Кол-во'),
          accessor: 'quantity',
          width: 100,
          Cell: ({index, row, value, column}) =>
            <Input value={value.toString()} type="number" min="0"
                   onChange={e => ctrl.updateConLot(cidx, index, column.id, e.target.value)}/>
        },
        {
          Header: t('Остаток'),
          accessor: 'rest',
          width: 100,
        },
        // {
        //   Header: t('lot'),
        //   accessor: 'advert_lot.dircategory[0]',
        //   Cell: ({value}) => <pre className="text-left">{JSON.stringify(value, null, ' ')}</pre>
        // },
        // {
        //   Header: t('Цена за ед.'),
        //   accessor: 'unit_price',
        //   width: 130,
        //   Cell: ({value}) => formatMoney(value)
        // },
        // {
        //   Header: t('Сумма'),
        //   accessor: 'total',
        //   width: 130,
        //   Cell: ({value}) => formatMoney(value)
        // },
        // {
        //   Header: t('Место поставки'),
        //   // id: 'delivery_place',
        //   accessor: 'delivery_place',
        // }
        {
          Header: (
            <Button className="btn-sm" title={t('Добавить позицию')}
                    disabled={original.lots.length >= this.props.ctrl.contract.lots.length}
                    onClick={() => ctrl.addConLot(cidx)}>
              <i className="fa fa-plus"/>
            </Button>
          ),
          width: 50,
          Cell: ({index}) =>
            <Button color="danger" className="btn-sm" title={t('Удалить позицию')}
                    onClick={() => ctrl.removeConLot(cidx, index)}>
              <i className="fa fa-minus"/>
            </Button>
        }
      ],
      showPagination: false,
      minRows: 1,
      className: "-striped -highlight"
    };

    return (
      <div className="p-2 pb-4">
        <h5>{t('Предметы поставки')}</h5>
        <ReactTable {...tableProps}/>
      </div>
    )
  };

  @action
  setDate(index, name, value) {
    this.items[index][name] = value
  }
}
