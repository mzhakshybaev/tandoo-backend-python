import React, {Component} from 'react'
import {Col, Row, TabContent, TabPane} from "reactstrap";
import {toJS} from "mobx";
import {inject, observer} from "mobx-react";
import {formatDateTime, getStatusTr} from "utils/helpers";
import SupAppTabs from 'components/supplier/AppTabs';
import SupAppTable from 'components/supplier/AppTable';
import {Link} from 'react-router-dom';
import Loading from "components/Loading";
import {translate} from "react-i18next";

@translate(['common', 'settings', '']) @inject('supAppsListCtrl','mainStore') @observer
export default class SupAppsList extends Component {
  componentDidMount() {
    this.props.supAppsListCtrl.load();
  }

  componentWillUnmount() {
    this.props.supAppsListCtrl.reset();
  }

  render() {
    const {t} = this.props;
    let {ready, anns} = this.props.supAppsListCtrl;
    let lang = this.props.mainStore.language.code; // DO NOT REMOVE!!
    if (!ready) return <Loading/>;

    return (
      <div>
        <SupAppTabs/>

        <TabContent>
          <TabPane>
            <Row>
              <Col sm="12">
                <SupAppTable
                  columns={[
                    {accessor: '_id', show: false},
                    // {id: 'ann_id', accessor: 'announce._id', show: false},
                    {
                      Header: t('№ объявления'),
                      accessor: 'code',
                      Cell: ({row, value}) => <Link to={`/announce/view/${row._id}`}>{value}</Link>
                    },
                     {Header: t("Статус"), accessor: "status", Cell: ({value}) => getStatusTr('announce', value)},
                    {
                      Header: t('Наимен. объявления', {keySeparator: '>', nsSeparator: '|'}),
                      accessor: "dirsection",
                      Cell: ({row, value}) => <Link to={`/announce/view/${row._id}`}>{value}</Link>
                    },
                    {Header: t('Закупающая организация'), accessor: "pur_company"},
                    // {Header: "Статус", accessor: "status"},
                    {
                      Header: t('Дата публикации объявления'),
                      accessor: "published_date",
                      Cell: ({value}) => formatDateTime(value)
                    },
                    {
                      Header: t('Срок подачи заявок'),
                      accessor: "deadline",
                      Cell: ({value}) => formatDateTime(value)
                    }
                  ]}
                  data={toJS(anns)}/>
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </div>
    )
  }
}
