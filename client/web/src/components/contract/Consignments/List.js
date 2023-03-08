import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import {observable, action, toJS} from "mobx";
import {translate} from "react-i18next";
import ReactTable from "react-table";
import {Button} from "components";
import {formatDate, getStatusTr} from "utils/helpers";
import {Col} from "reactstrap";
import {Link} from "react-router-dom";

@inject('mainStore') @translate(['common', 'settings', '']) @observer
export default class ConsList extends Component {
  @observable ready = false;
  @observable items;

  render() {
    let {t, items, showLink} = this.props;

    let tableProps = {
      data: toJS(items),
      columns: [
        {
          Header: '',
          width: 50,
          expander: true,
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
          Cell: ({value}) => formatDate(value),
        },
        {
          Header: t('Дата завершения поставки'),
          accessor: 'date_to',
          width: 120,
          Cell: ({value}) => formatDate(value),
        },
        {
          Header: t('Кол-во позиций'),
          accessor: 'lots.length',
          width: 100,
        },
        {
          Header: t('Место поставки'),
          accessor: 'address',
        },
        {
          Header: t('Условия поставки'),
          accessor: 'conditions',
        },
        {
          Header: t('Статус'),
          id: 'status',
          accessor: con => con.got_status ? 'Finished' : 'Pending',
          Cell: ({value}) => getStatusTr('con', value)
        },
        // {
        //   Header: (
        //     <Button className="btn-sm" title={t('Добавить поставку')} onClick={() => ctrl.addCon()}>
        //       <i className="fa fa-plus"/>
        //     </Button>
        //   ),
        //   width: 50,
        //   Cell: ({index}) =>
        //     <Button color="danger" className="btn-sm" title={t('Удалить поставку')}
        //             onClick={() => ctrl.removeCon(index)}>
        //       <i className="fa fa-minus"/>
        //     </Button>
        // }
      ],
      showPagination: false,
      minRows: 1,
      className: "-striped -highlight border-tr",
      collapseOnDataChange: false,
      SubComponent: this.renderExpandTable,
    };

    if (showLink) {
      tableProps.columns.push({
        Header: '',
        width: 50,
        accessor: 'id',
        Cell: ({value}) =>
          <Link to={`/consignment/view/${value}`}>
            <i className="fa fa-file"/>
          </Link>
      })
    }

    return (
      <Col xs={12}>
        <h4>{t('График поставок')}</h4>
        <ReactTable {...tableProps}/>
      </Col>
    )
  }

  renderExpandTable = ({original, index}) => {
    const {t} = this.props;
    const {mainStore} = this.props;
    const {language} = mainStore;

    let label = 'name';
    if (language && language.code === 'en') {
      label = 'name_en';
    }
    if (language && language.code === 'kg') {
      label = 'name_kg';
    }

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
          className: 'text-left',
          Cell: ({value}) => `${value.index + 1}. ${value.dircategory[0][label]}`
        },
        {
          Header: t('Ед.изм', {
            keySeparator: '>',
            nsSeparator: '|',
          }),
          id: 'units',
          accessor: () => 'Шт',
          width: 100,
        },
        {
          Header: t('Кол-во'),
          accessor: 'quantity',
          width: 100,
        },
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
        //   Header: (
        //     <Button className="btn-sm" title={t('Добавить позицию')}
        //             disabled={original.lots.length >= this.props.ctrl.contract.lots.length}
        //             onClick={() => ctrl.addConLot(cidx)}>
        //       <i className="fa fa-plus"/>
        //     </Button>
        //   ),
        //   width: 50,
        //   Cell: ({index}) =>
        //     <Button color="danger" className="btn-sm" title={t('Удалить позицию')}
        //             onClick={() => ctrl.removeConLot(cidx, index)}>
        //       <i className="fa fa-minus"/>
        //     </Button>
        // }
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
