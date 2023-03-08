import React, {Component} from 'react'
import {inject, observer} from "mobx-react"
import {Col, Row} from 'reactstrap';
import Button from "components/AppButton";
import Table from 'components/AppTable';
import {IMAGES_URL} from "utils/common";
import {formatMoney, formatDateTime} from "utils/helpers";
import {withRouter} from 'react-router-dom';
import Img from 'components/Image';
import Loading from "components/Loading";
import {toJS} from "mobx";
import {translate} from "react-i18next";
import Select from "components/Select";
import {showError} from "../../../../utils/messages";

@translate(['common', 'settings', ''])
@inject('supMyProductsCtrl', 'catalogStore', 'authStore') @withRouter @observer
export default class MyProducts extends Component {
  componentDidMount() {
    this.props.supMyProductsCtrl.load();
  }

  componentWillUnmount() {
    this.props.supMyProductsCtrl.reset();
  }

  handleEdit(product) {
    this.props.catalogStore.selectedProduct = product;
    this.props.history.push('/supplier/products/add');
  };

  setCategory = category => {
    this.props.supMyProductsCtrl.setCategory(category)
  };

  check = (url) => {
    let {company} = this.props.authStore;
    let msg = 'Вы еще не получили доступ, просим открыть “Мои организации” и в этой странице заполнить все необходимые поля для получения доступа';
    if (company.company_status === 'confirmed') {
      this.props.history.push(url);
    } else {
      showError(msg);
      setTimeout(() => {
        this.props.history.push('/supplier/company/qualification');
      }, 5000);
    }
  };

  render() {
    const {t} = this.props;
    let {ready, products, categories, category} = this.props.supMyProductsCtrl;

    if (!ready) return <Loading/>;
    return (
      <div className="custom-product-list">
        <Col sm="12" md={{size: 6, offset: 5}}>
          <h3>{t('Мой каталог')}</h3>
        </Col>

        <Row>
          <Col>
            <Button onClick={() => this.check("/supplier/products/add")}>
              <i className="fa fa-plus"/> {t('Добавить товар')}
            </Button>
            <Button className="float-right" onClick={() => this.check("/supplier/products/request")}>
              <i className={"fa fa-plus"}/> {t('Создать запрос')}
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Select options={toJS(categories)}
                    valueKey={"id"}
                    value={category}
                    placeholder={t('Выберите категорию')}
                    optionRenderer={c => `${c.name}`} /*`*/
                    valueRenderer={c => `${c.name}`} /*`*/
                    filterOption={(option, filter) => !filter ? true : (
                      (option.name.toLowerCase().indexOf(filter) !== -1)
                    )}
                    clearable={false}
                    onChange={this.setCategory}/>
          </Col>
        </Row>

        <Row className="mt-2">
          <Col md={12}>
            <Table
              data={toJS(products)}
              columns={[
                {
                  Header: t('Категория'),
                  accessor: 'dircategory',
                },
                {
                  Header: t('Товар (Торг.знак-Страна)'),
                  id: 'name',
                  accessor: row => row['Товарные знаки(марка, бренд)'] + (row['Страны'] ? (' - ' + row['Страны']) : '')
                },
                {
                  Header: t('Ед.изм', {
                    keySeparator: '>',
                    nsSeparator: '|',
                  }),
                  accessor: 'Единицы измерения',
                },
                {
                  Header: t('Внешний вид'),
                  accessor: 'image',
                  Cell: ({value}) => <Img height={50} src={IMAGES_URL + value}/>
                },
                {
                  Header: t('Цена за ед.', {
                    keySeparator: '>',
                    nsSeparator: '|',
                  }),
                  accessor: 'unit_price',
                  Cell: ({value}) => formatMoney(value),
                  width: 120
                },
                {
                  Header: t('Добавлен'),
                  accessor: 'date_add',
                  Cell: ({value}) => formatDateTime(value),
                },
                {
                  Header: t('Срок истечения даты'),
                  accessor: 'date_end',
                  Cell: ({value}) => formatDateTime(value),
                },
                {
                  Header: t('Статус'),
                  accessor: 'status',
                  width: 55,
                  Cell: ({value}) => {
                    if (value === 'active') {
                      return <i className="fa fa-lg fa-check-circle text-success" title={t('Активен')}/>
                    } else {
                      return <i className="fa fa-lg fa-minus-circle text-danger" title={t('Неактивен')}/>
                    }
                  }
                },
                {
                  Header: '',
                  sortable: false,
                  width: 50,
                  Cell: (row) => (
                    <Button onClick={() => this.handleEdit(row.original)} title={t('Редактировать')} size="sm">
                      <i className="fa fa-edit fa-lg"/>
                    </Button>
                  ),
                }
              ]}
              defaultPageSize={10}
              minRows={3}
              className="-striped -highlight"/>
          </Col>
        </Row>
      </div>
    )
  }
}
