import React, {Component} from 'react'
import {Col, Row, TabContent, TabPane} from "reactstrap";
import {inject, observer} from "mobx-react";
import {formatDateTime, getStatusTr} from "utils/helpers";
import SupAppTabs from 'components/supplier/AppTabs';
import SupAppTable from 'components/supplier/AppTable';
import {Link} from 'react-router-dom';
import Loading from "components/Loading";
import {translate} from "react-i18next";

@translate(['common', 'settings', '']) @inject('supAppsDraftsListCtrl') @observer
export default class SupAppsList extends Component {
  componentDidMount() {
    this.props.supAppsDraftsListCtrl.load();
  }

  componentWillUnmount() {
    this.props.supAppsDraftsListCtrl.reset();
  }

  render() {
    let {ready, apps} = this.props.supAppsDraftsListCtrl;
    let {t} = this.props;

    const columns = [
      {accessor: '_id', show: false},
      {id: 'ann_id', accessor: 'announce._id', show: false},
      {
        Header: t("№ объяв."),
        accessor: 'announce.code',
        Cell: ({row, value}) => <Link to={`/supplier/proposal/edit/${row.ann_id}`}>{value}</Link>
      },
       {Header: t("Статус"), accessor: "status", Cell: ({value}) => getStatusTr('announce', value)},
      {
        Header: t("Наимен. объявления"),
        accessor: "dirsection",
        Cell: ({row, value}) => <Link to={`/supplier/proposal/edit/${row.ann_id}`}>{value}</Link>
      },
      {Header: t("Закупающая организация"), accessor: "org_name",},
      {Header: t("Статус"), accessor: "status"},
      {
        Header: t("Дата подачи"), accessor: "created_date",
        Cell: ({value}) => formatDateTime(value)
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
                <SupAppTable columns={columns} data={apps}/>
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </div>
    )
  }
}
