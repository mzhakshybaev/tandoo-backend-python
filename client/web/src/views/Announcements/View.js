import React, {Component} from 'react';
import {Card, CardBody, Col, Row, TabContent, TabPane} from "reactstrap";
import Button from "components/AppButton";
import {Link, withRouter} from 'react-router-dom';
import {inject, observer} from "mobx-react";
import Loading from 'components/Loading';
import AnnounceMainData from "components/announce/MainData";
import AnnounceLotsList from "components/announce/LotsList";
import AnnouncePayments from "components/announce/Payments";
import AnnounceMyAppDetail from "components/announce/MyAppDetail";
import {translate} from "react-i18next";
import AppTable from "components/AppTable";
import {toJS} from "mobx";
import Switcher from "components/Switcher";
import {formatMoney} from "utils/helpers";
import Input from "components/AppInput";
import {showError} from "utils/messages";
import announceApi from "stores/api/AnnounceApi";

@translate(['common', 'settings', '']) @withRouter @inject('announceViewCtrl', 'mainStore') @observer
export default class AnnounceView extends Component {
  state = {
    visable: false
  };

  componentDidMount() {
    this.load(this.props.match.params.id);
  }

  load(id) {
    this.id = id;
    this.props.announceViewCtrl.reset();
    this.props.announceViewCtrl.load(id).then(r => {
      let {announce} = this.props.announceViewCtrl;
      if (announce && announce.status === 'Evaluation') {
        this.setState({visable: true});
      }
    });
  }

  componentWillUnmount() {
    this.id = null;
    this.props.announceViewCtrl.reset();
  }

  componentDidUpdate() {
    let {id} = this.props.match.params;

    if (this.id !== id) {
      this.load(id)
    }
  }

  cancel = () => {
    if (this.state.displayReason) {
      if (!this.state.reason) {
        showError('Введите причину отмены');
        return;
      }

      let params = {
        id: this.props.announceViewCtrl.announce._id,
        reason: this.state.reason,
      };

      announceApi.update(params).then(r => {
        this.props.history.push("/announce/listing");
      });
    } else {
      this.setState({displayReason: true});
    }
  };

  render() {
    let ctrl = this.props.announceViewCtrl;
    let {ready} = ctrl;

    if (!ready) return <Loading/>;

    const {t} = this.props;
    const {visable} = this.state;
    let {announce, announce_app, myApps, allApps, isApplicable, isPurchaser, isOwner, debtData} = ctrl;


    return (
      <div>
        <Card>
          <CardBody>
            <h3 className="text-center">{t('Просмотр Объявления')}</h3>

            <AnnounceMainData announce={announce}/>

            <AnnounceLotsList lots={announce.lots} app_lots={isApplicable && announce_app.advert_lots}
                              hide_total={announce.hide}/>

            <Row className="mb-2">
              <Col md={6}>
                {/*TODO: fix it*/}
                <AnnouncePayments payments={announce.data && announce.data.payments}/>
              </Col>
            </Row>

            {myApps && (myApps.length > 0) &&
            <Row className="mb-2">
              <Col>
                <h4>{t('Моё предложение')} - {myApps.length}</h4>

                <AnnounceMyAppDetail apps={myApps} app_lots={isApplicable && myApps}/>
              </Col>
            </Row>}
            <Card>
              <CardBody>
            {(announce.status === 'Results' || announce.status === 'Evaluation') &&

            <Row className="mr-2">
              <Col>
                <div className="d-flex float-left d-print-none mb-1">
                  <span className={'md-2'}><h4>{t('Протокол вскрытия')}</h4></span>
                  <Switcher checked={visable}
                            onChange={visable => this.setState({visable})}/>
                </div>
              </Col>
            </Row>
            }

            {visable && debtData && (debtData.length > 0) &&
            <Row className="mb-2">
              <Col>
                <h4>{t('Все предложения')}</h4>
                <h4 align={'center'}>{t('Список Организаций')}</h4>
                {(() => {

                  let columns = [
                    {Header: 'Поставщики',
                      columns:
                      [
                        {
                          Header: 'Наименование поставщика',
                          accessor: 'company', //имя поставщика
                          width: 600,
                        },
                      ],
                    },
                    {
                      Header: 'Информация о статусе задолженности по налогам',
                      columns: [
                        {
                          Header: 'По состоянию на:',
                          accessor: 'tax_date',
                        },
                        {
                          Header: 'Задолженность:',
                          accessor: 'tax_debt',
                        },
                      ],
                    },
                    {
                      Header: 'Справка об отсутствии задолженности по выплатам в соцфонд',
                      columns: [
                        {
                          Header: 'По состоянию на:',
                          accessor: 'sf_date',
                        },
                        {
                          Header: 'Задолженность:',
                          accessor: 'sf_debt',
                        },
                      ],
                    },
                  ];

                  return <AppTable data={toJS(debtData)}
                                   columns={columns}
                                   filterable = {false}
                                   showPagination={debtData.length > 10}
                                   minRows={1}
                                   showRowNumbers={true}
                  />
                })()}
              </Col>
            </Row>}
            {visable && allApps && (allApps.length > 0) &&
            <Row className="mb-2">
              <Col>
                <h4 align={'center'}>{t('Таблица цен')}</h4>
                {(() => {
                  let columns = [
                    {accessor: 'lot._id', show: false},
                    {accessor: 'app._id', show: false},
                    {Header: '№ лота', accessor: 'lot.ind'},
                    {
                      Header: t('Поставщик'), accessor: 'app', width: 600,
                      Cell: ({row}) => <Link to={`/supplier/info/${row.app.company_id}`}>{row.app.company}</Link>
                    },
                    {Header: t('Марка'), accessor: 'app.brand'},
                    {Header: t('Страна производитель'), accessor: 'app.country'},
                    {
                      Header: t('Цена за единицу'), accessor: 'app.unit_price',
                      Cell: ({value}) => formatMoney(value)
                    },
                    {
                      Header: t('Общая цена'), accessor: 'app.total',
                      Cell: ({value}) => formatMoney(value)
                    },
                  ];

                  if (allApps.some(({app}) => app.hasOwnProperty('reason') || app.hasOwnProperty('selected'))) {
                    if (announce.status === 'Results') {
                      columns.push({
                        Header: t('Выбран'),
                        accessor: 'app.selected',
                        Cell: ({value}) =>
                          value ? <i className="fa fa-check"/> : null
                      });
                    }

                    if (allApps.some(({app}) => app.reason !== null)) {
                      columns.push({
                        Header: t('Причина отмены'),
                        accessor: 'app.reason'
                      })
                    }
                  }

                  return <AppTable data={toJS(allApps)}
                                   minRows={1}
                                   pageSize={10}
                                   filterable={false}
                                   showPagination={allApps.length > 10}
                                   showRowNumbers={true}
                                   columns={columns}/>
                })()}
              </Col>
            </Row>}
            </CardBody></Card>
            <Row className="d-print-none">
              <Col>
                <Button to="/announcements" color="secondary">{t('Назад')}</Button>

                {isApplicable && myApps ?
                  (myApps.length > 0) ?
                    <Button className="ml-2"
                            to={`/supplier/proposal/edit/${announce._id}`}>{t('Изменить предложение')}</Button>
                    :
                    <Button className="ml-2"
                            to={`/supplier/proposal/edit/${announce._id}`}>{t('Проектирование предложения')}</Button>
                  : null}

                {isOwner && announce.status === 'Evaluation' &&
                <Button className="ml-2" to={`/purchaser/announce/evaluate/${announce._id}`}>
                  {t('Оценка предложений')}
                </Button>}

                {isOwner && ['Evaluation', 'Published'].includes(announce.status) &&
                  <>
                    <Button className="ml-2" color="danger" onClick={this.cancel}>
                      {t('Отменить торги')}
                    </Button>

                    {this.state.displayReason &&
                    <Input className="w-25"
                           placeholder={t('Причина отмены объявлении')}
                           autoFocus
                           value={this.state.reason}
                           onChange={e => this.setState({reason: e.target.value})}/>
                    }
                  </>
                }

                {isOwner && announce.status === 'Results' &&
                <Button className="ml-2" to={`/purchaser/announce/contracts/${announce._id}`}>{t('Договора')}</Button>}

                <Button color="info" className="ml-2" onClick={() => print()}>{t('На печать')}</Button>

              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    )
  }
}
