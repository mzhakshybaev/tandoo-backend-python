import React, {Component} from 'react';
import {Col, Row} from "reactstrap";
import {formatDateTime} from "utils/helpers";
import {translate} from "react-i18next";
import {Link} from "react-router-dom";
import Table from "components/supplier/AppTable";
import Button from "components/AppButton";
import {showError} from "../../../../utils/messages";
import {inject, observer} from "mobx-react";

@translate(['common', 'settings', ''])
@inject('supplierStore') @observer
export default class DebtData extends Component {
  state = {
    docs: []
  };

  componentDidMount() {
    let {showPagination, docs} = this.props;
    if (showPagination) {
      this.getMyDebts();
    } else {
      this.setState({docs});
    }
  }

  async getMyDebts() {
    let docs = await this.props.supplierStore.getMyDebt({});
    this.setState({docs});
  }

  sendRequest = async () => {
    try {
      let docs = await this.props.supplierStore.sendRequest({});
      this.setState({docs});
    } catch (e) {
      showError(e && e.message || 'Ошибка');
      console.warn(e);
    }
  };

  render() {
    let {t, showPagination} = this.props;
    let {docs} = this.state;
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
        accessor: 'debt_status',
      }
    ];

    return (
      <div>
        <div className="debtInfo">
          <Row>
            <Col xs={12} className="d-flex justify-content-center">
              <h2>{t('Информация о задолжн.')}</h2>
            </Col>
          </Row>
          {showPagination &&
          <Row>
            <Col className="mt-2" md={3} sm={6}>
              <Button className="badge-primary" onClick={this.sendRequest}>{t('Запросить')}</Button>
            </Col>
          </Row>
          }
          <Row className="mt-4">
            <Col xs={12}>
              <Table
                data={docs}
                columns={columns}
                showPagination={showPagination}
                className="-striped -highlight"/>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}


