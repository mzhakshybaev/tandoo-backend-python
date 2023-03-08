import React, {Component} from 'react';
import {Card, CardBody, Col, Row} from "reactstrap";
import Button from "components/AppButton";
import {Link, withRouter} from 'react-router-dom';
import {inject, observer} from "mobx-react";
import Loading from 'components/Loading';
import AnnounceMainData from "components/announce/MainData";
import {translate} from "react-i18next";
import {formatMoney, getStatusTr} from "utils/helpers";
import ContractsListTable from 'components/contract/List'

@translate(['common', 'settings', '']) @withRouter @inject('purAnnContractsListCtrl') @observer
export default class PurAnnContractsListView extends Component {
  componentDidMount() {
    this.load(this.props.match.params.id);
  }

  load(id) {
    this.id = id;
    this.props.purAnnContractsListCtrl.load(id);
  }

  componentWillUnmount() {
    this.id = null;
    this.props.purAnnContractsListCtrl.reset();
  }

  componentDidUpdate() {
    let {id} = this.props.match.params;

    if (this.id !== id) {
      this.load(id)
    }
  }

  render() {
    const {t} = this.props;
    let {ready, announce, contracts, isOwner} = this.props.purAnnContractsListCtrl;

    if (!ready) return <Loading/>;

    let columns = [
      {accessor: 'id', show: false},
      {
        Header: t('№ Договора'),
        accessor: 'code',
        Cell: ({value, row}) => {
          if (isOwner && row.status === 'Schedule') {
            return <Link to={`/purchaser/contracts/schedule_edit/${row.id}`}>{value}</Link> // `
          } else {
            return <Link to={`/contracts/view/${row.id}`}>{value}</Link> // `
          }
        }
      },
      // {Header: "Закуп. организация", accessor: "pur_company"},
      // {Header: "Предмет закупки", accessor: "dirsection"},
      {Header: t("Поставщик"), accessor: "sup_company"},
      {Header: t("Статус"), accessor: "status", Cell: ({value}) => getStatusTr('contract', value)},
      {Header: t("Сумма"), accessor: "total", Cell: ({value}) => formatMoney(value)},
    ];

    return (
      <div>
        <Card>
          <CardBody>
            <h3 className="text-center">{t('Договора')}</h3>

            <AnnounceMainData announce={announce} title={t('Данные объявления')} showLink/>

            <Row className="mb-2">
              <Col>
                <h4>{t('Список контрактов')}</h4>

                <ContractsListTable {...{columns, contracts}}/>
              </Col>
            </Row>

            <Row className="d-print-none">
              <Col>
                <Button to={`/announce/view/${announce._id}`} color="secondary">{t('Назад')}</Button>

                <Button color="info" className="ml-2" onClick={() => print()}>{t('На печать')}</Button>

              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    )
  }
}

