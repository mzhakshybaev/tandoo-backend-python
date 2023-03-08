import React, {Component} from 'react'
import {Col, Row} from "reactstrap";
import Button from "components/AppButton";
import {inject, observer} from 'mobx-react'
import {formatDateTime} from "utils/helpers";
import {showError} from "utils/messages";
import {translate} from "react-i18next";
import Table from "components/supplier/AppTable";

@translate(['common', 'settings', ''])
@inject('supplierStore', 'mainStore', 'dictStore', 'authStore') @observer
class TaxDebtInfo extends Component {
  state = {
    data: []
  };

  componentDidMount() {
    this.getMyDebts();
  }

  async getMyDebts(params) {
    let data = await this.props.supplierStore.getMyDebt(params);
    this.setState({data});
  }

  sendRequest = async () => {
    try {
      let debtInfo = {
        company_id: this.props.company._id
      };

      let data = await this.props.supplierStore.sendRequest(debtInfo);
      this.setState({data});

    } catch (e) {
      showError(e && e.message || 'Ошибка');
      console.warn(e);
    }
  };

  render() {
    const {t} = this.props;

    const columns = [
      {
        Header: t('Дата подачи'),
        Cell: row => (
          <div className="text-center">{formatDateTime(row.original.date_start)}</div>
        ),
        accessor: 'date_start',
      },
      {
        Header: t('ИНН'),
        accessor: 'inn',
      },
      {
        Header: t('Наименование организации'),
        accessor: 'company',
      },
      {
        Header: t('Орган выдавший'),
        accessor: 'issuer',
      },
      {
        Header: t('Дата'),
        Cell: row => (
          <div className="text-center">{formatDateTime(row.original.date_end)}</div>
        ),
        accessor: 'date_end',
      },
      {
        Header: t('Задолженность'),
        accessor: 'debt',
      }
    ];
    return (
      <div className="debtInfo">
        <Row className="pb-4">
          <Col xs={12} className="d-flex justify-content-center">
            <h2>{t('Задолженность по налогам')}</h2>
          </Col>
        </Row>
        <Row>
          <Col className="mt-2" md={3} sm={6}>
            <Button className="badge-primary" onClick={this.sendRequest}>{t('Запросить')}</Button>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col xs={12}>
            <Table
              data={this.state.data}
              columns={columns}
              defaultPageSize={10}
              minRows={10}
              className="-striped -highlight"/>
          </Col>
        </Row>
      </div>
    )
  }
}

export default TaxDebtInfo
