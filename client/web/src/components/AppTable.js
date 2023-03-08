import React, {Component} from 'react';
import ReactTable from 'react-table'
import {inject, observer} from "mobx-react";

const translations = {
  previousText: '<',
  nextText: '>',
  loadingText: 'ЗАГРУЗКА...',
  rowsText: 'строк',
  pageText: 'стр.',
  ofText: 'из',
  noDataText: 'нет данных',
};

@inject('mainStore') @observer
export default class AppTable extends Component {

  componentDidUpdate() {
    let lang = this.props.mainStore.language.code;

    if (lang === 'en') {
      translations.loadingText = 'LOADING....';
      translations.rowsText = 'rows';
      translations.pageText = 'page';
      translations.ofText = 'out of';
      translations.noDataText = 'no data';
    }
    if (lang === 'kg') {
      translations.loadingText = 'Жүктөлүүдө....';
      translations.rowsText = 'катарлар';
      translations.pageText = 'бет';
      translations.ofText = 'чейин';
      translations.noDataText = 'маалымат жок';
    }
  }

  render() {
    const {data, columns, pageSize, onClick, mainStore, busy, showRowNumbers, ...rest} = this.props;
    let c = [];
    if (showRowNumbers) {
      c.push({
        Header: "№",
        Cell: row => <div className="text-center">{row.index + 1}</div>, width: 70
      });
    }

    c.push(...columns);
    return <ReactTable
      {...translations}
      filterable
      defaultFilterMethod={(filter, row) =>
        String(row[filter.id]).toLocaleLowerCase().includes(filter.value.toLocaleLowerCase())}
      data={data}
      columns={c}
      loading={busy || mainStore.isBusy}
      placeholder={'выбор'}
      defaultPageSize={pageSize || 25}
      className="-striped -highlight"
      showRowNumbers={true}
      getTdProps={(state, rowInfo, column, instance) => ({
        onClick: (e, handleOriginal) => {
          if (column.expander)
            handleOriginal();

          else if (onClick && rowInfo) {
            onClick({...rowInfo.row._original}, column, handleOriginal);
          }
        }
      })}
      {...rest}
    />
  }
}
