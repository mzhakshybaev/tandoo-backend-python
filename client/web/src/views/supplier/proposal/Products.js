import React, {Component} from 'react';
import {Col, Row, TabContent, TabPane, CustomInput} from "reactstrap";
import Button from 'components/AppButton';
import Img from 'components/Image';
import Loading from 'components/Loading';
import {Table, Input} from "components";
import {IMAGES_URL} from "utils/common";
import {observable, runInAction, action, computed, toJS} from 'mobx';
import {inject, observer} from 'mobx-react';
import {storageGet} from "utils/LocalStorage";
import SupAppTabs from 'components/supplier/AppTabs'
import {showError} from "utils/messages";
import announceApi from "stores/api/AnnounceApi";
import {translate} from "react-i18next";
import {formatMoney} from "utils/helpers";

@translate(['common', 'settings', ''])
@inject('authStore', 'supplierStore', 'mainStore') @observer
export default class ProposalProducts extends Component {
  @observable ready = false;
  @observable announce;
  @observable lots; // all lots
  @observable apps; // apps {by lot}, mapped from lot.applications
  @observable lot; // selected lot
  @observable lot_apps; // apps of selected lot
  @observable lot_products; // applicable products to selected lot (lot.products)
  @observable app = null; // first app of selected lot
  @observable product = null; // currently selected product (app.product)

  componentDidMount() {
    let lang = this.props.mainStore.language.code
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
      lots: null,
      apps: null,
      lot: null,
      lot_apps: null,
      lot_products: null,
      app: null,
      product: null,
    });
  }

  async load(lang) {
    this.lang = lang;
    this.ready = false;

    const {ann_id} = this.props.match.params;

    let [announce, announce_app, selectedLots] = await Promise.all([
      announceApi.get({id: ann_id}),
      this.props.supplierStore.getAnnounceAppInfo({advert_id: ann_id}),
      storageGet('supSelectedLots'),
    ]);

    if (!announce_app || !announce_app.advert_lots || !announce_app.advert_lots.length) {
      showError('Не найдены подходящие продукты');
      throw 'No lots';
    }

    let lots;
    if (selectedLots) {
      lots = announce_app.advert_lots.filter(lot => selectedLots.includes(lot._id));

      if (!lots.length)
        lots = announce_app.advert_lots

    } else {
      lots = announce_app.advert_lots
    }

    // map apps by lot id
    let apps = {};
    lots.forEach(lot => {
      let lot_apps = lot.applications || [];

      apps[lot._id] = lot_apps.map(app => ({
        ...app, // _id, unit_price, ...
        product: lot.products.findById(app.company_product_id),
      }));

      // 1
      if (!apps[lot._id].length) {
        // create one
        apps[lot._id] = [{
          unit_price: null,
          product: null
        }];
      }
    });

    runInAction(() => {
      Object.assign(this, {
        announce,
        lots,
        apps,
        ready: true,
      });
    });
  }

  /*@action.bound
  selectLot(lot) {
    let lot_apps, lot_products, app, product;

    if (lot) {
      lot_products = lot.products || [];
      lot_apps = this.apps[lot._id];
      // 1
      app = lot_apps[0];
      product = app.product;
    }

    Object.assign(this, {
      lot,
      lot_apps,
      lot_products,
      app,
      product,
    });
  };

  @action.bound
  selectProduct(pid) {
    let {lot_products, app} = this;
    let product = lot_products.findById(pid);

    app.product = product;
    app.unit_price = product.unit_price;

    this.product = product;
  };

  @action.bound
  setProductPrice(price) {
    // 1
    this.app.unit_price = price;
  }*/

  getLot(lot_id) {
    return this.lots.findById(lot_id);
  }

  getLotApp(lot) {
    return this.apps[lot._id][0];
  }

  getLotProduct(lot, product_id) {
    let lot_products = lot.products || [];
    return lot_products.findById(product_id);
  }

  @action
  selectProduct1(lot_id, product_id) {
    let lot = this.getLot(lot_id);

    if (lot) {
      let app = this.getLotApp(lot);

      if (app) {
        if (product_id) {
          let product = this.getLotProduct(lot, product_id);

          if (product) {
            app.product = product;
            app.unit_price = product.unit_price;
          }
        } else {
          app.product = null;
          app.unit_price = null;
        }
      }
    }
  }

  @action
  setProductPrice1(lot_id, price) {
    let lot = this.getLot(lot_id);

    if (lot) {
      let app = this.getLotApp(lot);

      if (app) {
        app.unit_price = parseFloat(price);
      }
    }
  }

  @computed
  get canSubmit() {
    return this.lots && this.lots.every(lot => {
      let lot_apps = this.apps[lot._id];

      if (!lot_apps || !lot_apps.length)
        return false;

      let app = lot_apps[0];

      if (!app || !app.product)
        return false;

      else if (app.unit_price <= 0 || !isFinite(app.unit_price))
        return false;

      return true;
    })
  }

  submit = async () => {
    try {
      await this.saveApps();
      this.props.history.push(`/supplier/proposal/oferta/${this.announce._id}`);

    } catch (e) {
      console.warn(e);
      showError(e && e.message || 'Ошибка при сохранении')
    }
  };

  async saveApps() {
    let {company} = this.props.authStore;

    let appsProms = this.lots.map(lot => {
      let lot_apps = this.apps[lot._id];
      let app = lot_apps[0];
      let product = app.product;

      let app_params = {
        _id: app._id,
        status: 'Draft',
        advert_lot_id: lot._id,
        unit_price: app.unit_price,
        company_id: company._id,
        company_product_id: product._id,
        total: app.unit_price * lot.quantity, // TODO: move to server
      };

      return this.props.supplierStore.saveApplication(app_params);
    });

    await Promise.all(appsProms);
  }

  render() {
    if (!this.ready) return <Loading/>;
    let {t} = this.props;

    let {announce, lots, apps, canSubmit} = this;

    // DO NOT REMOVE!!!
    apps = toJS(apps);

    let tableParams = {
      data: toJS(lots),
      minRows: 1,
      sortable: false,
      filterable: false,
      showRowNumbers: true,
      showPagination: (lots.length > 25),
      collapseOnDataChange: false,
      columns: [
        {
          accessor: '_id',
          show: false,
        },
        {
          id: 'app',
          show: false,
          accessor: lot => this.getLotApp(lot)
        },
        {
          accessor: 'products',
          show: false
        },
        {
          Header: t('Категория'),
          accessor: 'dircategory'
        },
        {
          Header: t('Продукт'),
          Cell: ({row: lot}) => {
            let {app} = lot;
            let product = app.product;

            if (product) {
              return <i className="fa fa-check-circle fa-lg text-success" title={t('Выбран')}/>
            } else {
              return <i className="fa fa-minus-circle fa-lg text-danger" title={t('Не выбран')}/>
            }
          }
        },
        {
          Header: t('План сумма'),
          accessor: 'budget',
          Cell: ({value}) => formatMoney(value)
        },
        {
          Header: t('Количество'),
          accessor: 'quantity',
        },
        {
          Header: t('Цена за единицу'),
          id: 'unit_price',
          Cell: ({row: lot}) => {
            let {app} = lot;
            if (app.unit_price !== null) {
              return (
                <Input type="number" min={0} step={0.01} value={app.unit_price} autoFocus
                       onChange={e => this.setProductPrice1(lot._id, e.target.value)}/>
              )
            } else {
                return ''
            }
          }
        },
        {
          Header: t('Сумма'),
          id: 'total',
          accessor: lot => {
            let app = this.getLotApp(lot);
            if (app && app.unit_price) {
              return app.unit_price * lot.quantity
            }
          },
          Cell: ({value}) => isFinite(value) && formatMoney(value)
        },
      ],
      SubComponent: ({row: lot}) => {
        let {app, products, _id} = lot;
        let product = app.product;

        return (
          <Row>
            <Col xs={6} sm={4} md={3} xl={2}>
              <div className="product cat">
                <div className='pt-2'>
                  <CustomInput type="radio" label={t('Не выбран')}
                               id={_id + '-0'}
                               value={null} checked={product === null}
                               onChange={e => this.selectProduct1(_id, null)}/>
                </div>
              </div>
            </Col>

            {products && products.map(p =>
              <Col key={p._id} xs={6} sm={4} md={3} xl={2}>
                <div className="product cat">
                  <div className="img ">
                    <Img src={IMAGES_URL + p.image}/>
                  </div>
                  <p>{t('Код')} {p.code}</p>
                  <span>{p.dircategory}</span>
                  <div className='mt-1'>
                    <CustomInput type="radio" label={t('Выбрать')}
                                 id={p._id}
                                 checked={product && product._id === p._id || false}
                                 onChange={e => this.selectProduct1(_id, p && p._id)}/>
                  </div>
                </div>
              </Col>
            )}
          </Row>
        )
      }
    };

    return (
      <div>
        <SupAppTabs/>

        <TabContent>
          <TabPane>
            <Row>
              <Col>
                <h3 className="text-center">{t('Выбор подходящего товара из раздела "Мой каталог"')}</h3>
              </Col>
            </Row>

            <Row>
              <Col>
                <Table {...tableParams}/>
              </Col>
            </Row>

            <Row>
              <Col>
                <Button to={`/supplier/proposal/edit/${announce._id}`} color="secondary" className="mr-2">
                  {t('Назад')}
                </Button>
                <Button disabled={!canSubmit} onClick={this.submit}>
                  {t('Коммерческое предложение')}
                </Button>
              </Col>
            </Row>

          </TabPane>
        </TabContent>
      </div>
    )

    /* return (
          <div>
            <SupAppTabs/>

            <TabContent>
              <TabPane>
                <Row>
                  <Col>
                    <h3 className="text-center">{t('Выбор подходящего товара из раздела "Мой каталог"')}</h3>
                  </Col>
                </Row>

                <Row className="mb-2">
                  <Col md="6">
                    <FGI l="" lf={0} ls={12} className="mt-2">
                      <Select options={lots.toJS()} placeholder={t('Выберите позицию')} value={lot}
                              optionRenderer={(data, idx) => `${idx + 1}. ${data.dircategory}`} // `
                              valueRenderer={data => {
                                let idx = lots.findIndexById(data._id);
                                return `${idx + 1}. ${data.dircategory}` // `
                              }}
                              valueKey="_id" labelKey="dircategory" onChange={selectLot}/>
                    </FGI>
                  </Col>
                </Row>

                <Row>
                  {lot_products && lot_products.map(p =>
                    <Col key={p._id} xs={6} sm={4} md={3} xl={2}>
                      <div className="product cat" onClick={() => console.log(p)}>
                        <div className="img ">
                          <Img src={IMAGES_URL + p.image}/>
                        </div>
                        <p>{t('Код')} {p.code}</p>
                        <span>{p.dircategory}</span>
                        <div className='mt-1'>
                          <CustomInput type="radio" id={p._id} label={t('Выбрать')}
                                       value={p._id} checked={product && product._id === p._id || false}
                                       onChange={event => selectProduct(event.target.value)}/>
                        </div>
                      </div>
                    </Col>
                  )}
                </Row>

                {product &&
                <Row>
                  <Col md={6} xs={12}>
                    <AppProductData {...{lot, product, app}}
                                    editablePrice onChangePrice={setProductPrice}/>
                  </Col>
                </Row>
                }

                <Row>
                  <Col>
                    <Button to={`/supplier/proposal/edit/${announce._id}`} color="secondary" className="mr-2">
                      {t('Назад')}
                    </Button>
                    <Button disabled={!canSubmit} onClick={submit}>
                      {t('Коммерческое предложение')}
                    </Button>
                  </Col>
                </Row>

              </TabPane>
            </TabContent>
          </div>
        ) */
  }
}
