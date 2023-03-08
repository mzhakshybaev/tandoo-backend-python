import React, {Component} from 'react';
import {Col, Row, TabContent, Table, TabPane} from "reactstrap";
import Button from 'components/AppButton';
import Loading from 'components/Loading';
import {observable, runInAction, action, computed} from 'mobx';
import {inject, observer} from 'mobx-react';
import {formatDateTime, formatMoney, addressToString, checkCompanyDocs} from "utils/helpers";
import DebtData from "components/supplier/DebtData";
import AppProductData from "components/supplier/AppProductData";
import SupAppTabs from 'components/supplier/AppTabs'
import {showError, showSuccess} from "utils/messages";
import {moneyToWords} from 'utils/locales/number-to-words';
import announceApi from "stores/api/AnnounceApi";
import {translate} from "react-i18next";
import {storageRemove} from "utils/LocalStorage";

@translate(['common', 'settings', ''])
@inject('authStore', 'supplierStore','mainStore') @observer
export default class Submit extends Component {
  @observable ready = false;
  @observable announce;
  @observable docs;
  @observable lots;
  @observable apps;
  @observable totalSum;

  componentDidMount() {
    let lang = this.props.mainStore.language.code;
    this.load(lang);
  }

  componentWillUnmount() {
    this.reset();
  }

  componentDidUpdate() {
    let lang = this.props.mainStore.language.code;
    if (this.lang !== lang) {
      this.load(lang)
    }
  }

  @action
  reset() {
    Object.assign(this, {
      ready: false,
      announce: null,
      docs: null,
      lots: null,
      apps: null,
      totalSum: null,
    });
  }

  async load(lang) {
    this.lang = lang;
    let {company} = this.props.authStore;
    let ann_id = this.props.match.params.ann_id;

    let [announce, docs, announce_app] = await Promise.all([
      announceApi.get({id: ann_id}),
      this.props.supplierStore.getLastDocs({company_id: company._id}),
      this.props.supplierStore.getAnnounceAppInfo({advert_id: ann_id}),
    ]);

    // TODO: get apps:
    // this.props.supplierStore.getApplications({advert_id: ann_id, company_id: company._id})


    if (!announce_app || !announce_app.advert_lots || !announce_app.advert_lots.length) {
      showError('Не найдены подходящие продукты');
      throw 'No lots';
    }

    let lots = announce_app.advert_lots;

    // map apps by lot id, calc total
    let apps = {};
    let totalSum = 0;
    lots.forEach(lot => {
      let lot_apps = lot.applications || [];

      apps[lot._id] = lot_apps.map(app => {
        totalSum += app.total;

        return {
          ...app, // _id, unit_price, ...
          product: lot.products.findById(app.company_product_id),
        }
      });
    });

    runInAction(() => {
      Object.assign(this, {
        announce,
        docs,
        lots,
        apps,
        totalSum,
        ready: true,
      });
    });
  }

  @computed
  get canSubmit() {
    return true;
    return checkCompanyDocs(this.docs)
  }

  async submit() {
    let {company} = this.props.authStore;

    let appsProms = [];
    this.lots.forEach(lot => {
      let lot_apps = this.apps[lot._id];
      // 1 TODO: multi
      if (lot_apps && lot_apps.length && lot_apps[0]) {
        let app = lot_apps[0];
        let product = app.product;

        let app_params = {
          _id: app._id,
          status: 'Published',
          advert_lot_id: lot._id,
          unit_price: app.unit_price,
          company_id: company._id,
          company_product_id: product._id,
          total: app.unit_price * lot.quantity, // TODO: move to server
        };

        appsProms.push(this.props.supplierStore.updateApplication(app_params));
      }
    });

    await Promise.all(appsProms);

    storageRemove('supSelectedLots');
  };

  handleSubmit = async () => {
    try {
      await this.submit();
      showSuccess(this.props.t('Вы успешно подали заявку'));
      this.props.history.push(`/announce/view/${this.announce._id}`);
    } catch (e) {
      console.warn(e)
    }
  };

  render() {
    if (!this.ready) return <Loading/>;
    const {t} = this.props;
    let {company} = this.props.authStore;
    let {announce, docs, lots, apps, totalSum, canSubmit, handleSubmit} = this;
    let today = Date.now();

    return (
      <div>
        <SupAppTabs/>

        <TabContent>
          <TabPane>
            <Row>
              <Col md={6} xs={12}>
                <h4>{t('От кого')}:</h4>
                <Table bordered>
                  <tbody>
                  <tr>
                    <td>{t('Поставщик')}</td>
                    <td>{company.name}</td>
                  </tr>
                  <tr>
                    <td>{t('ИНН')}</td>
                    <td>{company.inn}</td>
                  </tr>
                  <tr>
                    <td>{t('№ предложения')}</td>
                    <td>-</td>
                  </tr>
                  <tr>
                    <td>{t('Дата')}</td>
                    <td>{formatDateTime(today)}</td>
                  </tr>
                  </tbody>
                </Table>
              </Col>
              <Col md={6} xs={12}>
                <h4>{t('Кому')}:</h4>
                <Table bordered>
                  <tbody>
                  <tr>
                    <td>{t('Закупающая организация')}</td>
                    <td>{announce.company.name}</td>

                  </tr>
                  <tr>
                    <td>{t('Наименование закупки')}</td>
                    <td>{t('Канцелярские товары')}</td>
                  </tr>
                  <tr>
                    <td>{t('№ объявления')}</td>
                    <td>{announce.code}</td>
                  </tr>
                  <tr>
                    <td>{t('Дата публикации')}</td>
                    <td>{formatDateTime(announce.published_date)}</td>
                  </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
            { !announce.dirprocurement.data &&

              <Row className="pb-4">
                <Col>
                  <h3 className="text-center">{t('Коммерческое предложение')}</h3>
                </Col>
              </Row>
            }
            { announce.dirprocurement.data  && announce.dirprocurement.data.code === "Simplified" &&
              <Row className="pb-4">
                <Col>
                  <h3 className="text-center">{t('Конкурсная заявка')}</h3>
                </Col>
              </Row>
            }
            <Row>
              <Col>
                <p>
                  {t('Кому')}: {announce.company.name}, {t('адрес')}: {announce.company.data && addressToString(announce.company.data.address)}
                </p>
                <p>{t('Изучив объявление размещенное в Каталоге под №')} {announce.code}</p>
                <p>{company.name} {t('предлагает осуществить поставку товара и сопутствующих услуг на общую')}
                {t('сумму')} {formatMoney(totalSum)} {t('по нижеследующей Таблице')}</p>
                <p>{t('В стоимость товара включены все налоги и пошлины, изымаемые на територии Кыргызской Республики')}</p>
                <p>{t('Данное Коммерческое предложение действительно до')} {formatDateTime(announce.deadline)},
                  {t('начиная со срока окончания подачи заявки,')}
                  {t('и остается обязательным до истечения указанного срока')}</p>
              </Col>
            </Row>

            <Row>
              <Col className="text-right">
                <p>{company.name}</p>
                <p>{t('Дата подачи')}: {formatDateTime(today)}</p>
              </Col>
            </Row>

            <Row>
              <Col>
                <h4>{t('Таблица цен')}</h4>
              </Col>
            </Row>

            <Row>
              {lots.map((lot, i) => {
                let lot_apps = apps[lot._id];
                return lot_apps.map((app, j) => {
                  let product = app.product;

                  return (
                    <Col key={`${i}-${j}`} md={6} xs={12}>
                      <AppProductData {...{lot, product, app}} index={i + 1}/>
                    </Col>
                  );
                })
              })}
            </Row>

            {false &&
            <Row>
              <Col md={6} xs={12}>
                <h4>{t('Справки')}</h4>
                <DebtData docs={docs}/>
              </Col>
            </Row>}

            <Row>
              <Col>
                <h5>{t('ОБЩАЯ СУММА КОММЕРЧЕСКОГО ПРЕДЛОЖЕНИЯ')}:</h5>
                <h5>
                  {formatMoney(totalSum)}
                  ({moneyToWords(totalSum)})
                </h5>
              </Col>
            </Row>

            <Row>
              <Col>
                <Button to={`/supplier/proposal/edit/${announce._id}`} className="mr-2" color="secondary">{t('Назад')}</Button>
                <Button onClick={handleSubmit} disabled={!canSubmit}>{t('Подать предложение')}</Button>{' '}
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </div>
    )
  }
}
