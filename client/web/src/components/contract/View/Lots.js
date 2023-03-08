import React, {Component} from 'react';
import {CardText, Col, Row} from "reactstrap";
import {translate} from "react-i18next";
import {formatMoney} from "utils/helpers";
import {Table, Button} from "components";
import {toJS} from "mobx";
import {inject} from "mobx-react";

@translate(['common', 'settings', '']) @inject('mainStore')
export default class LotsList extends Component {
  render() {
    let {t, columns, lots, accessorTotal = 'budget'} = this.props;
    const {mainStore} = this.props;
    const {language} = mainStore;

    let label = 'name';
    if (language && language.code === 'en') {
      label = 'name_en';
    }
    if (language && language.code === 'kg') {
      label = 'name_kg';
    }
    if (!columns) {
      // default columns
      columns = [
        {
          Header: '',
          expander: true,
          width: 50,
          Expander: ({isExpanded, ...rest}) => (
            <Button size={'sm'} outline color="default">
              {isExpanded
                ? <i className="fa fa-minus"/>
                : <i className="fa fa-plus"/>
              }
            </Button>
          )
        },
        {Header: '№', width: 70, Cell: props => props.index + 1},
        {Header: t('Категория'), accessor: "name", Cell: row=> row.original.dircategory[0][label]},
        {
          Header: t('Ед.изм', {
            keySeparator: '>',
            nsSeparator: '|',
          }), id: "unit", accessor: 'name', Cell:  row=> row.original.dirunit[label],
        },
        {Header: t('Количество'), accessor: "quantity"},
        {
          Header: t('Цена за ед.', {keySeparator: '>', nsSeparator: '|',}),
          accessor: "unit_price",
          Cell: ({value}) => formatMoney(value)
        },
        {
          Header: t('Сумма'),
          accessor: accessorTotal, //"budget",
          Cell: ({value}) => formatMoney(value)
        },
        {Header: t('Сроки поставки'), accessor: "estimated_delivery_time"},
      ];
    }

    return (
      <Col xs={12}>
        <h4>{t('Предметы закупки')} - {lots.length}</h4>

        {lots &&
        <Table data={toJS(lots)}
               minRows={1}
               filterable={false}
               showPagination={lots > 10}
               columns={columns}
               SubComponent={this.renderExpandLotsList}/>
        }
      </Col>
    )
  }

  renderExpandLotsList = ({original: lot}) => {
    const {t} = this.props;
    const {mainStore} = this.props;
    const {language} = mainStore;

    let label = 'name';
    let units = "name";
    if (language && language.code === 'en') {
      label = 'name_en';
      units = "dirname";
    }
    if (language && language.code === 'kg') {
      label = 'name_kg';
    }
    return (
      <Row noGutters className="p-2 ">
        <Col md={3}>
          {lot.dictionaries && lot.dictionaries.map((s, i) =>
            <CardText key={i}> {s[units]}: </CardText>
          )}

          {lot.specifications && lot.specifications.map((s, i) =>
            <CardText key={i}> {s.property[label]}: </CardText>
          )}

          <CardText>{t('Адрес и место поставки')}:</CardText>
          <CardText> {t('Сроки поставки')}:</CardText>
        </Col>

        <Col md={4}>
          {lot.dictionaries && lot.dictionaries.map((s, i) =>
            <CardText key={i}> {s.values[0][label]} </CardText>
          )}

          {lot.specifications && lot.specifications.map((s, i) =>
            <CardText key={i}> {s.value[label]} </CardText>
          )}

          <CardText>{lot.delivery_place}</CardText>
          <CardText>{lot.estimated_delivery_time} {t('дней')}</CardText>
        </Col>
      </Row>
    )
  };
}
