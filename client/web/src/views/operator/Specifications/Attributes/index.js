import React, {Component} from 'react';
import {inject, observer} from "mobx-react"
import {Card, CardBody, CardFooter, CardHeader} from "reactstrap";
import CategorySelector from "components/CategorySelector";
import Values from "./Values";
import Dictionaries from "./Dictionaries";
import {translate} from "react-i18next";
import {toJS} from "mobx";
import {Fg} from "components/AppInput";
import {Button, Table, Switcher, Input} from "components";

@translate(['common', 'settings', ''])
@inject("specStoreV2") @observer
class Attributes extends Component {

  renderEditable = ({value, index, column}) => (
    <Input key={index + '_' + column.id} bsSize="sm"
           callback={val => this.props.specStoreV2.onAttributeChange(index, column.id, val)}
           value={value}/>
  );

  renderValues = props => (
    <Values values={props.original.values}
            attrIndex={props.index}
            onAddClick={this.props.specStoreV2.onAddValueClick}
            onRemoveClick={this.props.specStoreV2.onRemoveValueClick}
            onValueChange={this.props.specStoreV2.onValueChange}/>
  );

  render() {
    const {t} = this.props;
    let {
      specification, onSaveSpecification, onCancelSpecification, onNewAttributeClick, onCategorySelect,
      onSwitchVisibility, onRemoveAttributeClick, roles
    } = this.props.specStoreV2;

    this.columns = [
      {
        Header: t('Название'),
        columns: [
          {Header: "Порядок", accessor: "order", Cell: this.renderEditable},
          {Header: "RU", accessor: "name", Cell: this.renderEditable},
          {Header: "KG", accessor: "name_kg", Cell: this.renderEditable},
          {Header: "EN", accessor: "name_en", Cell: this.renderEditable}
        ]
      },
      {
        Header: t('Видимость'),
        columns: roles.map(role => ({
          Header: role.name,
          width: 100,
          filterable: false,
          sortable: false,
          className: "text-center",
          Cell: ({original, index}) =>
            <Switcher checked={original.roles_id.includes(role._id)}
                      onChange={value => onSwitchVisibility(index, value, role._id)}/>
        }))
      },
      {
        Cell: ({index}) => (
          <Button size={"sm"}
                  color={"danger"} outline
                  onClick={() => onRemoveAttributeClick(index)}>
            <i className={"fa fa-trash"}/>
          </Button>
        ),
        width: 40,
        filterable: false,
        sortable: false,
        className: "text-center"
      }
    ];

    return (
      <Card>
        <CardHeader>
          {t('Спецификация')}
        </CardHeader>
        <CardBody>
          <Fg label={t('Категория')}>
            <CategorySelector
              value={specification.category}
              onChange={onCategorySelect}/>
          </Fg>
          <Dictionaries/>
          <div className="attributesTitle">
            <h5>{t('Атрибуты')}</h5>
            <Button onClick={onNewAttributeClick}><i className={"fa fa-plus"}/></Button>
          </div>

          <Table data={toJS(specification.attr)}
                 columns={this.columns}
                 minRows={1}
                 collapseOnDataChange={false}
                 SubComponent={this.renderValues}/>
        </CardBody>
        <CardFooter>
          <Button className={"mx-1"} color="danger" onClick={onCancelSpecification}>{t('Отменить')}</Button>
          <Button className={"mx-1"} color="success" onClick={onSaveSpecification}>{t('Сохранить')}</Button>
        </CardFooter>
      </Card>
    );
  }
}

export default Attributes;
