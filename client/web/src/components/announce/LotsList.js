import React, {Component} from 'react';
import Switcher from "components/Switcher";
import {CardText, Col, Row, Table, CustomInput} from "reactstrap";
import Button from 'components/AppButton';
import {formatMoney} from "utils/helpers";
import ReactTable from "components/AppTable";
import {translate} from "react-i18next";
import {toJS} from "mobx";
import {inject} from "mobx-react";


@translate(['common', 'settings', '']) @inject('mainStore')
export default class AnnounceLotsList extends Component {
  state = {
    tableMode: true
  };

  render() {
    const {t, onToggleAll} = this.props;

    return (
      <div className="mb-2">
        <Row>
          <Col>
            <div className="d-flex float-right d-print-none mb-1">
              <span className={'mr-2'}>{t('Список')}/{t('Таблица')}</span>
              <Switcher checked={this.state.tableMode}
                        onChange={tableMode => this.setState({tableMode})}/>

              {this.props.selectable &&
              <Button size="sm ml-2" onClick={onToggleAll}>
                <i className="fa mr-1 fa-check-double"/>
                {t('Выбрать все')}
              </Button>}
            </div>

            <h4>{t('Перечень закупаемых товаров')}</h4>

          </Col>
        </Row>
        {this.state.tableMode ? this.renderTable() : this.renderList()}
      </div>
    )
  }

  renderTable() {
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


    const columns = [
      {
        Header: '', expander: true, width: 50,
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
      {Header: t('Категория'), accessor: 'name', Cell: row => row.original.dircategory[0][label]},
      {
        Header: t('Единицы измерения'),
        accessor: 'name', Cell: row => row.original.dirunit[label]
      },
      {Header: t('Количество'), accessor: 'quantity'},
      {
        Header: t('Цена за единицу'), accessor: 'unit_price',
        Cell: ({value}) => formatMoney(value)
      },

    ];

    if (!this.props.hide_total) {
      columns.push(
        {
          Header: t('План сумма'),
          accessor: 'budget',
          Cell: ({value}) => formatMoney(value)
        },
      )

    }

    if (this.props.app_lots) {
      columns.push({
        Header: t('Наличие подобного товара'),
        Cell: ({original}) => {
          let id = original._id;
          let app_lot = this.props.app_lots.find(lot => lot._id === id);

          if (app_lot && app_lot.products && app_lot.products.length) {
            return (
              <span>
                <i className="fa fa-lg fa-check-circle-o text-success"/>
                {' '}
                {app_lot.products.length}
                {' '}
                {t('продукт(ов)')}
              </span>
            );
          }

          return '-';
        }
      });

      if (this.props.selectable) {
        columns.push({
          Header: t('Выбор'), id: 'checkbox',
          Cell: ({original}) => {
            let id = original._id;
            let app_lot = this.props.app_lots.find(lot => lot._id === id);

            if (app_lot && app_lot.products && app_lot.products.length) {
              return <CustomInput type="checkbox" label={t('Выбрать')} id={`check-lot-${id}`} // `
                                  checked={this.props.selected.includes(id)}
                                  onChange={e => this.props.onSelect(id, e.target.checked)}/>;
            }
            return null;
          }
        })
      }

    }

    return (
      <ReactTable data={toJS(this.props.lots)}
                  filterable = {false}
                  columns={columns}
                  showPagination={this.props.lots.length > 20}
                  defaultPageSize={20}
                  minRows={1}
                  className="-striped -highlight"
                  SubComponent={this.renderExpandTable}/>
    );
  }

  renderExpandTable = ({original: lot}) => {
    const {mainStore} = this.props;
    const {language} = mainStore;

    let label = 'name';
    let unit = 'name';
    if (language && language.code === 'en') {
      label = 'name_en';
      unit = "dirname"
    }
    if (language && language.code === 'kg') {
      label = 'name_kg';
      unit = "name"
    }
    const {t} = this.props;
    return (
      <Row noGutters className="p-2 border">
        <Col md={3}>
          {lot.dictionaries.map((s, i) =>
            <CardText key={i}> {s[unit]}: </CardText>
          )}

          {lot.specifications.map((s, i) =>
            <CardText key={i}> {s.property[label]}: </CardText>
          )}

          <CardText>{t('Адрес и место поставки')}:</CardText>
          <CardText> {t('Сроки поставки с момента заключения договора')}:</CardText>
        </Col>

        <Col md={4}>
          {lot.dictionaries.map((s, i) =>
            <CardText key={i}> {s.values[0][label]} </CardText>
          )}

          {lot.specifications.map((s, i) =>
            <CardText key={i}> {s.value[label]} </CardText>
          )}

          <CardText>{lot.delivery_place}</CardText>
          <CardText>{lot.estimated_delivery_time} {t('дней')}</CardText>
        </Col>
      </Row>
    )
  };

  renderList() {
    const {mainStore} = this.props;
    const {language} = mainStore;

    let label = 'name';
    let unit = 'name';
    if (language && language.code === 'en') {
      label = 'name_en';
      unit = "dirname"
    }
    if (language && language.code === 'kg') {
      label = 'name_kg';
      unit = "name"
    }
    const {t} = this.props;
    return (
      <div>
        <Row>
          {this.props.lots.map((lot, i) => (
            <Col md={6} key={lot._id}>
              <Table bordered>
                <tbody>
                <tr>
                  <td>{t('Позиция №')} {i + 1}</td>
                  <td>{lot.dircategory[0][label]}</td>
                </tr>

                {lot.dictionaries.map((d, i) =>
                  <tr key={i}>
                    <td>{d[unit]}</td>
                    <td>{d.values[0][label]}</td>
                  </tr>
                )}
                {lot.specifications.map((s, i) =>
                  <tr key={i}>
                    <td>{s.property[label]}</td>
                    <td>{s.value[label]}</td>
                  </tr>
                )}

                <tr>
                  <td>{t('Количество')}</td>
                  <td>{lot.quantity}</td>
                </tr>
                <tr>
                  <td>{t('Цена за единицу')}</td>
                  <td>{formatMoney(lot.unit_price)}</td>
                </tr>
                {lot.hide !== true && <tr>
                  <td>{t('Планируемая сумма')}</td>
                  <td>{formatMoney(lot.budget)}</td>
                </tr>}
                <tr>
                  <td>{t('Адрес и место поставки')}</td>
                  <td>{lot.delivery_place}</td>
                </tr>
                <tr>
                  <td>{t('Сроки поставки')}</td>
                  <td>{lot.estimated_delivery_time} {t('дней')}</td>
                </tr>

                {this.props.app_lots &&
                <tr>
                  <td>{t('Наличие подобного товара')}</td>
                  <td>
                    {(() => {
                      let id = lot._id;
                      let app_lot = this.props.app_lots.find(lot => lot._id === id);

                      if (app_lot && app_lot.products && app_lot.products.length) {
                        return (
                          <span>
                            <i className="fa fa-lg fa-check-circle-o text-success"/>
                            {' '}
                            {app_lot.products.length}
                            {' '}
                            {t('продукт(ов)')}
                          </span>
                        );
                      }

                      return '-';
                    })()}
                  </td>
                </tr>}

                {(() => {
                  if (this.props.selectable) {
                    let id = lot._id;
                    let app_lot = this.props.app_lots.find(lot => lot._id === id);

                    if (app_lot && app_lot.products && app_lot.products.length) {
                      return (
                        <tr>
                          <td>{t('Выбор')}</td>
                          <td>
                            <CustomInput type="checkbox" label="Выбрать" id={`check-lot-${lot._id}`} // `
                                         checked={this.props.selected[lot._id] || false}
                                         onChange={e => this.props.onSelect(lot._id, e.target.checked)}/>
                          </td>
                        </tr>
                      )
                    }
                  }

                  return null
                })()}

                </tbody>
              </Table>

            </Col>
          ))}
        </Row>
      </div>
    )
  }
}
