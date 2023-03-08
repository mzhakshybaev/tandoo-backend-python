import React, {Component} from 'react';
import {Col, Row} from "reactstrap";
import Button from 'components/AppButton';
import {formatMoney} from "utils/helpers";
import {Table as AppTable} from "components";
import {translate} from "react-i18next";
import {inject, observer} from "mobx-react";

@translate(['common', 'settings', ''])
@inject('mainStore')@observer
export default class AnnounceMyAppDetail extends Component {
  state = {
    tableMode: true
  };
  rejectDisplayKeys = ['image', '_id', 'product_id', 'unit_price', 'quantity', 'date_add', 'date_update', 'status', 'total', 'company_id', 'code'];

  render() {

    const {t} = this.props;
    return (
      <div>
        {/*<Card className={'mt-2'}>*/}
          {this.state.tableMode ? this.renderTable() : this.renderList()}
        {/*</Card>*/}
      </div>
    )
  }

  renderTable() {
    const {t, apps, app_lots} = this.props;
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
      // {accessor: 'lot._id', show: false},
      // {accessor: 'app._id', show: false},
      // {Header: t('Категория'), accessor: 'name', Cell: row => row.lot.dircategory[0][label]},
      {Header: t('Категория'), accessor: 'lot.dircategory'},
      {
        Header: t('Кол-во'),
        id: 'type',
        accessor: row => row.lot.products[0]["quantity"]
      },
      {
        Header: t('Цена за единицу'),
        id: 'pack',
        accessor: row => formatMoney(row.lot.applications[0]["unit_price"])
      },
      {
        Header: t('Сумма'),
        id: 'unit',
        accessor: row => formatMoney(row.lot.applications[0]["total"])
      },
      // {Header: t('Статус'),  accessor: row =>
      //      row.lot.products[0]["status"]}
    ];
    return (
      <AppTable data={apps}
                  columns={columns}
                  showPagination={apps.length > 25}
                  minRows={1}
                  className="-striped -highlight"
                  SubComponent={this.renderExpandTable}/>
    );
  }

  renderExpandTable = ({original: lot}) => {
    const {t} = this.props;
    console.log("lot");
    console.log(lot.lot.products[0]);
    let displayKeys = Object.keys(lot.lot.products[0]).withoutArr(this.rejectDisplayKeys);
    // console.log(lot.lot.products[0]);
    return (
      <Row noGutters className="p-2 border">
        <Col md={12}>
          <div className="card">
            <h4 className="card-title">{lot.lot.products[0]["Товарные знаки(марка, бренд)"]}</h4>
            {displayKeys.map((key, i) =>
              <div key={i}>
                <h6>{t((key == 'barcode') ? t("Штрих код") : (key == 'dircategory') ? t("Категория") : key)}: {lot.lot.products[0][key]}</h6>
              </div>
            )}

          </div>
        </Col>

      </Row>
    )
  };

}
