import React, {Component} from 'react';
import ReactTable from 'react-table'
import AppButton from "components/AppButton";
import {translate} from "react-i18next";

@translate(['common', 'settings', ''])
export default class MyAnnouncement extends Component {

  render() {

    const {t} = this.props;
    return (
      <div>
        <div className=" justify-content-center"
             style={{textAlign: "center"}}
        ><h3>Мои объявления</h3></div>
        <ReactTable

          columns={[{Header: "№"},
            {Header: t('Наименование продукций')},
            {Header: t('Вид продукций')},
            {Header: t('Метод закупок')},
            {Header: t('Статус')},
            {Header: t('Срок подачи КЗ')},
            {Header: " "},


          ]}

          defaultPageSize={10}
          className="-striped -highlight"


        />
        <AppButton>{t('Добавить объявление')}</AppButton>
      </div>
    )
  }
}
