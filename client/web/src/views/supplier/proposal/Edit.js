import React, {Component} from 'react';
import {Col, Row, TabContent, TabPane, Table} from "reactstrap";
import {Link, Redirect} from 'react-router-dom';
import Button from 'components/AppButton';
import {inject, observer} from 'mobx-react';
import Loading from 'components/Loading';
import AnnounceMainData from 'components/announce/MainData';
import SupAppTabs from 'components/supplier/AppTabs';
import AppInfo from 'components/supplier/AppInfo';
import {translate} from "react-i18next";

@translate(['common', 'settings', ''])
@inject('supPropEditCtrl') @observer
export default class ProposalEdit extends Component {
  componentDidMount() {
    this.load(this.props.match.params.ann_id);
  }

  load(id) {
    this.id = id;
    this.props.supPropEditCtrl.reset();
    this.props.supPropEditCtrl.load(id);
  }

  componentWillUnmount() {
    this.id = null;
    this.props.supPropEditCtrl.reset();
  }

  componentDidUpdate() {
    let id = this.props.match.params.ann_id;

    if (this.id !== id) {
      this.load(id)
    }
  }

  render() {
    const {t} = this.props;
    let {ready, announce, announce_app, isApplicable, myApps, selectedLotsCount, totalLotsCount, lotsCount,
      selectedProductsCount} = this.props.supPropEditCtrl;

    if (!ready) return <Loading/>;

    if (!isApplicable) return <Redirect to="/announcements" />;

    return (
      <div className="animated fadeIn">

        <SupAppTabs/>

        <TabContent>
          <TabPane>
            <Row>
              <Col sm="12">
                <h3 className="text-center">{t('Проектирование предложения')}</h3>
              </Col>
            </Row>

            <AnnounceMainData announce={announce} title={t('Данные объявления')}/>

            {myApps && myApps.length > 0 && <AppInfo apps={myApps}/>}

            <Row className="mt-2">
              <Col md={6} xs={12}>
                <h4>{t('Параметры предложения')}</h4>
                <Table bordered>
                  <thead>
                  <tr>
                    <th>№</th>
                    <th>{t('Содержание предложения')}</th>
                    <th>{t('Статус')}</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <th scope="row">1</th>
                    <td>
                      <Link to={`/supplier/proposal/lots/${announce._id}`}>{t('Выбор позиций из объявления')}</Link>
                      {' '}{selectedLotsCount} / {totalLotsCount}
                    </td>
                    <td className="text-center">
                      {selectedLotsCount === totalLotsCount ?
                        <i className="text-success fa fa-lg fa-check-circle"/>:
                        <i className="text-warning fa fa-lg fa-exclamation-triangle"/>}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">2</th>
                    <td>
                      <Link to={`/supplier/proposal/products/${announce._id}`}>{t('Выбор подходящего товара и таблица цен')}</Link>
                      {' '}{selectedProductsCount} / {lotsCount}
                    </td>
                    <td className="text-center">
                      {selectedProductsCount === lotsCount ?
                        <i className="text-success fa fa-lg fa-check-circle"/> :
                        <i className="text-warning fa fa-lg fa-exclamation-triangle"/> }
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">3</th>
                    <td>
                      <Link to={`/supplier/proposal/oferta/${announce._id}`}>{t('Коммерческое предложение')}</Link>
                    </td>
                    <td className="text-center">
                      {selectedProductsCount === lotsCount ?
                        <i className="text-success fa fa-lg fa-check-circle"/> :
                        <i className="text-danger fa fa-lg fa-minus-square"/> }
                    </td>
                  </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>

            <Row>
              <Col>
                <Button to={`/announce/view/${announce._id}`} color="secondary" className="mr-2">{t('Назад')}</Button>
                <Button to={`/supplier/proposal/submit/${announce._id}`}
                        disabled={selectedProductsCount !== lotsCount}>
                  {t('Подать предложение')}
                </Button>
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </div>
    );
  }
}
