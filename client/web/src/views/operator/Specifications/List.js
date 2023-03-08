import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import Table from "components/AppTable";
import {Card} from "reactstrap";
import Select from "components/Select";
import AppButton from "components/AppButton";
import {translate} from "react-i18next";


@translate(['common', 'settings', ''])
@inject("specStoreV2", "mainStore") @observer
class List extends Component {

  render() {
    const {t, mainStore} = this.props;
    let {
      sections, section, specifications,
      onSectionSelect, onTableClick, onNewSpecClick
    } = this.props.specStoreV2;
    const {language} = mainStore;
    let label = 'name';
    if (language && language.code === 'en')
      label = 'name_en';
    if (language && language.code === 'kg')
      label = 'name_kg';
    return (
      <Card body>
        <AppButton onClick={onNewSpecClick} disabled={!section} className={"mb-3"}>{t('Добавить категорию')}</AppButton>
        <Select simpleValue
                valueKey={"_id"}
                labelKey={label}
                placeholder={t('Выберите раздел')}
                options={sections}
                value={section}
                onChange={onSectionSelect}/>
        <Table className={"my-2"}
               data={specifications}
               showRowNumbers={true}
               columns={[{
                 Header: t('Список категорий'), accessor: 'dircategory.name', Filter: ({filter, onChange}) => (
                   <input type='text'
                          placeholder={t('Поиск')}
                          value={filter ? filter.value : ''}
                          onChange={event => onChange(event.target.value)}
                          style={{
                            width: '100%',
                          }}
                   />
                 ),
               }]}
               onClick={onTableClick}/>
      </Card>
    )
      ;
  }
}

export default List;
