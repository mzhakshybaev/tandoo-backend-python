import React, {Component} from 'react'
import {Col, Row, TabContent, TabPane} from "reactstrap";
import {toJS} from "mobx";
import {inject, observer} from "mobx-react";
import {Link} from 'react-router-dom';
import {formatMoney, formatDateTime, getStatusTr} from "utils/helpers";
import Loading from "components/Loading";
import SupAppTabs from 'components/supplier/AppTabs';
import SupAppTable from 'components/supplier/AppTable';
import {translate} from "react-i18next";


@translate(['common', 'settings', '']) @inject('supRequestsListCtrl') @observer
export default class AppRequests extends Component {
  componentDidMount() {
    this.props.supRequestsListCtrl.load();
  }

  componentWillUnmount() {
    this.props.supRequestsListCtrl.reset();
  }

  render() {
    let {t} = this.props;
    let {ready, announces} = this.props.supRequestsListCtrl;

    const columns = [
        {accessor: '_id', show: false},
        {
          Header: t('№ объяв.'), accessor: 'code',
          Cell: ({row, value}) => <Link to={`/announce/view/${row._id}`}>{value}</Link> // `
        },
        {Header: t("Статус"), accessor: "status", Cell: ({value}) => getStatusTr('announce', value)},
        {
          Header: t('Наимен. объявления'), accessor: 'dirsection',
          Cell: ({row, value}) => <Link to={`/announce/view/${row._id}`}>{value}</Link> // `
        },
        {Header: t('Метод закупок'), accessor: 'dirprocurement'},
        {Header: t('Организация'), accessor: 'organization'},

        {Header: t('План. сумма'), accessor: 'budget', Cell: ({value}) => formatMoney(value)},
        // {Header: "Статус", accessor: "status",},
        {
          Header: t('Дата публикации'), accessor: 'published_date',
          Cell: ({value}) => value ? formatDateTime(value) : ''
        },
        {
          Header: t('Срок подачи КЗ'), accessor: 'deadline',
          Cell: ({value}) => value ? formatDateTime(value) : ''
        },
      ];
    if (!ready) return <Loading/>;

    return (
      <div>
        <SupAppTabs/>

        <TabContent>
          <TabPane>
            <Row>
              <Col sm="12">
                <SupAppTable columns={columns} data={toJS(announces)}/>
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </div>
    )
  }
}








