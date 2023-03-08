import React, {Component, Fragment} from 'react'
import {Col, Row, TabContent, TabPane} from "reactstrap";
import Button from "components/AppButton";
import Table from "components/AppTable";
import {observable} from "mobx";
import {inject, observer} from "mobx-react";
import {Link} from 'react-router-dom';
import {formatMoney, formatDateTime, getStatusTr} from "utils/helpers";
import PurAppTabs from 'components/purchaser/AnnTabs';
import Loading from "components/Loading";
import {translate} from "react-i18next";

@translate(['common', 'settings', '']) @observer
class AnnounceTable extends Component {
  getUrl(row) {
    let url;

    switch (row.status) {
      case 'Draft':
        url = '/purchaser/announce/preview/';
        break;
      case 'Evaluation':
        url = '/purchaser/announce/evaluate/';
        break;
      case 'Results':
      case 'Published':
      default:
        url = '/announce/view/';
        break;
    }

    return `${url}${row._id}`
  }

  render() {
    const {t} = this.props;
    let {announces} = this.props;

    let columns = [
      {accessor: '_id', show: false},
      {
        Header: t('№ объявления'),
        accessor: 'code',
        Cell: ({value, row}) => <Link to={this.getUrl(row)}>{value}</Link> // `
      },
      {
        Header: t('Наимен. объявления', {keySeparator: '>', nsSeparator: '|'}),
        accessor: 'dirsection',
        Cell: ({value, row}) => <Link to={this.getUrl(row)}>{value}</Link> // `
      },
      {Header: t('План сумма'), accessor: "budget", Cell: ({value}) => formatMoney(value)},
      {Header: t("Статус"), accessor: "status", Cell: ({value}) => getStatusTr('announce', value)},
      {
        Header: t('Дата публикации'),
        accessor: "published_date",
        Cell: ({value}) => (value ? formatDateTime(value) : '')
      },
      {
        Header: t('Срок подачи КЗ'), accessor: "deadline",
        Cell: ({value}) => (value ? formatDateTime(value) : '')
      },
      {
        Header: t('Действия'),
        Cell: ({row}) => (
          <div>
            {row.status === 'Published' &&
            <Link to={'/purchaser/announce/EdSpeedup/' + row._id} title={t('Ускорить')}>
              <i className="fa fa-lg fa-clock mr-2"/>
            </Link>}

            {(row.status === 'Evaluation' || row.status === 'Results') &&
            <Link to={'/announce/view/' + row._id} title={t('Таблица цен')}>
              <i className="fa fa-lg fa-list-ol mr-2"/>
            </Link>}

            {row.status === 'Evaluation' &&
            <Link to={'/purchaser/announce/evaluate/' + row._id} title={t('Оценка предложений')}>
              <i className="fa fa-lg fa-tasks mr-2"/>
            </Link>}

            {row.status === 'Results' &&
            <Fragment>
              <Link to={'/purchaser/announce/result/' + row._id} title={t('Итоги')}>
                <i className="fa fa-lg fa-flag-checkered mr-2"/>
              </Link>

              <Link to={'/purchaser/announce/contracts/' + row._id} title={t('Договора')}>
                <i className="fa fa-lg fa-file-signature mr-2"/>
              </Link>
            </Fragment>}
            {row.status === 'Draft' &&
            <Link to={'/purchaser/announce/preview/' + row._id} title={t('Изменить')}>
              <i className="fa fa-lg fa-edit mr-2"/>
            </Link>}

          </div>
        ),
      }
    ];

    return (
      <Table data={announces}
             minRows="2"
             pageSize={Math.max(10, announces.length)}
             filterable={false}
             showPagination={true}
             showRowNumbers={true}
             columns={columns}/>
    )
  }
}

@translate(['common', 'settings', '']) @inject('purAnnListCtrl') @observer
export default class AnnounceList extends Component {
  @observable status;

  componentDidMount() {
    this.load(this.props.match.params);
  }

  load(status) {
    let searchStatus;

    switch (status) {
      case 'draft':
        searchStatus = 'Draft';
        break;
      case 'published':
        searchStatus = 'Published';
        break;
      case 'evaluate':
        searchStatus = 'Evaluation';
        break;
      case 'result':
        searchStatus = 'Results';
        break;
      case 'listing':
      default:
        searchStatus = 'All';
    }

    this.status = status;
    this.props.purAnnListCtrl.load(searchStatus);
  }

  componentWillUnmount() {
    this.status = null;
    this.props.purAnnListCtrl.reset();
  }

  componentDidUpdate() {
    let {status} = this.props.match.params;

    if (this.status !== status) {
      this.load(status);
    }
  }

  render() {
    const {t} = this.props;
    let {ready, announces} = this.props.purAnnListCtrl;

    return (
      <div className="animated fadeIn">
        <h3>{t('Мои объявления')}</h3>

        <PurAppTabs/>

        <TabContent>
          <TabPane>
            {this.status === 'listing' &&
            <Row>
              <Col sm="12" className="m-2 text-right">
                <Button to="/purchaser/catalog">{t('Добавить объявление')}</Button>
              </Col>
            </Row>
            }

            <Row>
              <Col sm="12">
                {!ready ?
                  <Loading/> :
                  <AnnounceTable announces={announces}/>
                }
              </Col>
            </Row>

            {this.status === 'listing' &&
            <Row>
              <Col sm="12" className="m-2 text-right">
                <Button to="/purchaser/catalog">{t('Добавить объявление')}</Button>
              </Col>
            </Row>
            }

          </TabPane>
        </TabContent>
      </div>
    )
  }
}








