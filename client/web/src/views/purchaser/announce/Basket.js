import React, {Component, Fragment} from 'react'
import {FGI} from "components/AppInput";
import {Card, CardBody, CardText, Col, Form, FormGroup, Input, Label, Row} from "reactstrap";
import Button from "components/AppButton";
import Table from "components/AppTable";
import {observable, computed, runInAction, action, toJS} from "mobx";
import {inject, observer} from "mobx-react";
import {storageGet, storageSave, storageRemove} from "utils/LocalStorage";
import {formatMoney} from "utils/helpers";
import Loading from 'components/Loading';
import {isEmpty, omit, reject, set} from "lodash-es";
import Swal from "sweetalert2";
import {translate} from "react-i18next";
import announceApi from "stores/api/AnnounceApi";
import {showError, showSuccess} from "utils/messages";
import CoateSelect from "components/CoateSelect";
import {withRouter} from "react-router-dom";
import InputMask from 'react-input-mask'
import ReactTooltip from 'react-tooltip';
import {parseNumber} from 'utils/helpers';
import * as request from '../../../../../utils/requester';
import Select from "../../../components/Select";


const PlanList = ({className, isFocused, onFocus, onSelect, option,}) => {
  const handleMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onSelect(option, event);
  };

  const handleMouseEnter = (event) => {
    onFocus(option, event);
  };

  const handleMouseMove = (event) => {
    if (isFocused) return;
    onFocus(option, event);
  };

  return (
    <div className={className} onMouseDown={handleMouseDown} onMouseEnter={handleMouseEnter}
         onMouseMove={handleMouseMove}>
      <div><strong>{option.id}</strong> - {option.accountTitle}</div>
      <div><strong>amount:</strong> {option.amount}</div>
      <div><strong>amountRemaining:</strong> {option.amountRemaining}</div>
      <div><strong>economClassifier:</strong> {option.economClassifier}</div>
    </div>
  );
};

const PlanValue = ({children, placeholder, value}) => {
  return (
    <div className="Select-value">
				<span className="Select-value-label">
					<strong>{value.id}</strong> - {children}
				</span>
    </div>
  );
};


@translate(['common', 'settings', '']) @inject("dictStore", 'mainStore', "authStore") @withRouter @observer
export default class Basket extends Component {

  @observable ready = false;
  @observable section = null;
  @observable lots = [];
  @observable lot = null;
  @observable annEditMode = false;
  @observable changePrice = false;
  @observable price = '';
  @observable priceError = null;

  @observable plans = [];


  componentDidMount() {
    this.load(this.props.match.params.id);
  }

  componentDidUpdate() {
    let {id} = this.props.match.params;

    if (this.ann_id !== id) {
      this.load(id)
    }
  }

  componentWillUnmount() {
    this.reset();
  }

  async load(ann_id) {
    this.reset();

    this.ann_id = ann_id;

    if (ann_id) {
      this.annEditMode = true;
      await this.loadAnnounceLots(ann_id);

    } else {
      this.annEditMode = false;
      await this.loadStorageLots();
    }

    await this.loadSelectedLot();

    this.ready = true;
  }

  @action
  reset() {
    Object.assign(this, {
      ready: false,
      section: null,
      lots: [],
      lot: null,
      annEditMode: false,
    })
  }

  async loadAnnounceLots(id) {
    let ann = await announceApi.get({id});
    let {dirsection, lots} = ann;
    runInAction(() => {
      this.section = dirsection;
      this.lots = lots.map(lot => ({
        _id: lot._id,
        category: lot.dircategory[0],
        specs: lot.specifications.map(s => ({
          id: s.property.id,
          property: s.property.name,
          values: [s.value]
        })),
        dicts: lot.dictionaries.map(d => ({
          ...d,
          displayName: d.name
        })),
        delivery_place: lot.delivery_place,
        dirunits_id: lot.dirunits_id,
        dirunit_name: lot.dirunit && lot.dirunit.name,
        params: {
          quantity: lot.quantity,
          unit_price: lot.unit_price,
          estimated_delivery_time: lot.estimated_delivery_time || '',
          address: lot.data ? lot.data.address : '',
        }
      }));
    })
  }

  async loadStorageLots() {
    let basket = await storageGet('basket');
    if (basket) {
      let {section, lots = []} = basket;
      runInAction(() => {
        this.section = section
        this.lots = lots;
      })
    }
  }

  async loadSelectedLot() {
    let fi = await storageGet('basketLot');

    if (!(fi && fi.section)) {
      return;
    }

    if (this.section) {
      if (this.section._id !== fi.section._id)
        return;
    } else {
      this.section = fi.section;
    }

    let lp = await storageGet('basketLotParams') || {};

    let {unit_price, dircategory, specifications: specs, dictionaries: dicts} = fi;
    let {estimated_delivery_time = '', address = {}} = lp;
    let {coate, street = '', house = '', apt = ''} = address;

    let dirunit_name, dirunits_id;
    let unit = dicts.find({dirname: 'DirUnits'});
    if (unit) {
      let {name, _id} = unit.values[0];
      dirunit_name = name;
      dirunits_id = _id
    } else {
      showError(this.props.t('Не выбрана единица измерения!'));
      debugger
    }

    runInAction(() => {
      this.lot = {
        category: dircategory.dircategory,
        specs,
        dicts,
        dirunit_name,
        dirunits_id,
        params: {
          quantity: '',
          unit_price,
          estimated_delivery_time,
          address: {coate, street, house, apt},
        }
      };

      this.getPlan();
    });
  }

  getPlan() {
    this.plans = [];
    if (this.lot) {
      request.post('plan/listing',).then(r => {
        this.plans = r.data;
      });
    }
  }

  @computed
  get lot_budget() {
    let lot = this.lot;
    if (lot && lot.params.quantity && (lot.params.quantity > 0)) {
      if (this.changePrice) {
        if (!this.priceError) {
          let price = parseNumber(this.price);
          return price * lot.params.quantity;
        }

      } else if (lot.params.unit_price) {
        return lot.params.unit_price * lot.params.quantity;
      }
    }
  }

  async storeLots() {
    let {lots, lot, section} = this;

    if (!this.annEditMode) {
      let basket = {lots, section};
      await storageSave('basket', basket);
    }

    if (lot) {
      let lp = omit(lot.params, ['quantity', 'unit_price']);
      await storageSave('basketLotParams', lp);
    }
  }

  @computed
  get canSaveAdvert() {
    return this.lots.length > 0 && !this.lot;
  }

  saveAdvert = async (redirect) => {
    let _id = this.ann_id;

    let params = {
      advert: {_id, dirsection_id: this.section._id,},
      advert_lots: this.lots.map(lot => ({
        _id: lot._id,
        planid: lot.planid,
        dircategory_id: lot.category.id,
        quantity: lot.params.quantity,
        unit_price: lot.params.unit_price,
        delivery_place: lot.delivery_place,
        estimated_delivery_time: lot.params.estimated_delivery_time,
        specs: lot.specs,
        dicts: lot.dicts,
        dirunits_id: lot.dirunits_id,
        data: {
          address: lot.params.address
        }
      }))
    };

    if (this.annEditMode) {
      await announceApi.update_lots(params);

    } else {
      _id = await announceApi.create(params);
      await storageRemove('basket');
    }

    showSuccess(this.props.t('Успешно сохранено'));

    if (redirect)
      this.props.history.push(`/purchaser/announce/edit/${_id}`);
  };

  @action.bound
  setLotParam(path, value, type) {
    if (type === 'num') {
      value = parseInt(value)
    }

    set(this.lot.params, path, value);
  }

  canAddLot = () => {
    if (this.lot) {
      let {quantity, address, estimated_delivery_time} = this.lot.params;
      let {coate, street, house} = address;

      return !this.priceError && quantity && (quantity > 0) && street && house && coate && estimated_delivery_time &&
        estimated_delivery_time > 0;
    }
  };

  addLot = async () => {
    if (this.changePrice && !this.priceError) {
      this.lot.params.unit_price = parseNumber(this.price);
    }

    this.lots.push({
      ...this.lot,
      delivery_place: this.lotAddressToString(),
    });

    await this.storeLots();

    this.deleteLot(null, 'current', false);
  };

  lotAddressToString() {
    if (this.lot) {
      let {coate, street, house, apt} = this.lot.params.address;
      return reject([coate && coate.name, street, house, apt], isEmpty).join(', ');
    }
  }

  async deleteLot(e, index, confirm = true) {
    e && e.preventDefault();
    const {t} = this.props;

    if (confirm) {
      let {value} = await Swal({
        title: t('Вы действительно хотите удалить позицию?'),
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: t('Да'),
        cancelButtonText: t('Отмена')
      });

      if (!value) return;
    }

    if (index === 'current') {
      this.lot = null;
      this.announcePlan = [];
      storageRemove('basketLot');
      this.toggleChangePrice(false);

    } else {
      this.lots.splice(index, 1);
    }

    await this.storeLots();
  }

  async editLot(e, index) {
    e.preventDefault();
    const {t} = this.props;

    if (this.lot) {
      let {value} = await Swal({
        title: t('Сейчас вы редактируете не сохранённую позицию.'),
        text: t('Хотите удалить её?'),
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: t('Да'),
        cancelButtonText: t('Отмена')
      });

      if (!value) return;

      this.deleteLot(null, 'current', false)
    }

    this.lot = this.lots[index];
    this.getPlan();

    this.lots.splice(index, 1);
  }

  confirmReset = async () => {
    const {t} = this.props;
    let {value} = await Swal({
      title: t('Вы действительно хотите очистить перечень товаров?'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: t('Да'),
      cancelButtonText: t('Отмена')
    });

    if (!value) return;

    if (this.annEditMode) {
      this.lots = [];

    } else {
      await storageRemove('basket');
      await storageRemove('basketLot');

      this.props.history.push("/purchaser/catalog");
    }
  };

  @action
  toggleChangePrice(changePrice) {
    this.changePrice = changePrice;
    if (changePrice) {
      this.price = this.lot.params.unit_price
    }

    this.priceError = null;
  }

  setPrice(price) {
    this.price = price;
    price = parseNumber(this.price);

    if (price && price > 0 && price <= this.lot.params.unit_price) {
      // ok
      this.priceError = null;
    } else {
      // err
      this.priceError = 'Цена должна быть больше 0 и меньше {{max}}';
    }
  }

  /*beforeMaskedValueChange = (newState, oldState, userInput) => {
    var {value} = newState;
    var selection = newState.selection;
    var cursorPosition = selection ? selection.start : null;

    // keep minus if entered by user
    if (value.endsWith('-') && userInput !== '-' && !this.state.value.endsWith('-')) {
      if (cursorPosition === value.length) {
        cursorPosition--;
        selection = {start: cursorPosition, end: cursorPosition};
      }
      value = value.slice(0, -1);
    }

    return {
      value,
      selection
    };
  };*/

  render() {
    if (!this.ready) return <Loading/>;

    let {t} = this.props;
    let lot = this.lot;
    let address = lot && lot.params.address;
    let {mainStore} = this.props;
    let {language} = mainStore;
    let {setLotParam} = this;

    let label = 'name';
    if (language && language.code.in_('en', 'kg')) {
      label = 'name_' + language.code;
    }

    return (
      <div className="container">
        <div className="d-flex justify-content-center">
          <h3>{t('Создание объявления')}</h3>
        </div>

        {lot &&
        <Col md={{size: 8, offset: 2}}>
          <Row className={"mb-2"}>
            <Col>
              <Card>
                <CardBody>
                  <Row>
                    <Col md={4}>
                      <CardText>{t('Категория')}:</CardText>
                    </Col>
                    <Col md={7}>
                      <CardText>{lot.category[label]}</CardText>
                    </Col>
                  </Row>

                  {lot.dicts && lot.dicts.map((d, i) =>
                    <Row key={i}>
                      <Col md={4}>
                        <CardText>{d.displayName}:</CardText>
                      </Col>
                      <Col md={7}>
                        {
                          d.values.map((v, i) => (
                            <CardText key={i}>{v.name}</CardText>
                          ))}
                      </Col>
                    </Row>
                  )}

                  {lot.specs && lot.specs.map((s, i) =>
                    <Row key={i}>
                      <Col md={4}>
                        <CardText>{s.property}:</CardText>
                      </Col>
                      <Col md={7}>
                        {s.values.map((v, i) => (
                          <CardText key={i}>{v.name}</CardText>
                        ))}
                      </Col>
                    </Row>
                  )}

                  <Row>
                    <Col md={4}>
                      <CardText>{t('Цена за единицу')}: </CardText>
                    </Col>
                    <Col md={7}>
                      <CardText>
                        {this.changePrice ?
                          <s>{formatMoney(lot.params.unit_price)}</s> :
                          formatMoney(lot.params.unit_price)
                        }
                        {' '}
                        ({t('Средняя цена товара из Каталога')})
                      </CardText>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <ReactTooltip type="info" effect="solid" place="bottom" style={{border: '1px solid red'}}/>
                      <FormGroup check>
                        <Label check>
                          <Input type="checkbox" checked={this.changePrice}
                                 onChange={e => this.toggleChangePrice(e.target.checked)}/>
                          <i className="fa fa-question-circle mx-1 text-primary"
                             data-tip={t('changePriceDesc')}/>
                          {t('Указать свою цену')}
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md={7}>
                      {this.changePrice &&
                      <FGI f={this.priceError ? t(this.priceError, {max: lot.params.unit_price}) : ''}>
                        <Input autoFocus value={this.price} type="number" step="0.01"
                               onChange={e => this.setPrice(e.target.value)}
                               className={this.priceError ? "is-invalid" : ''}/>
                      </FGI>
                      }
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <CardText>{t('Планируемая сумма')}: </CardText>
                    </Col>
                    <Col md={7}>
                      <CardText>
                        {this.lot_budget ?
                          formatMoney(this.lot_budget) :
                          t('Укажите количество')
                        }
                      </CardText>
                    </Col>
                  </Row>
                  <hr/>
                  <Row>
                    <Col md={4}>{t('План')}</Col>
                    <Col md={7}>
                      <Select options={this.plans}
                              valueKey={"id"}
                              simpleValue
                              value={this.lot && this.lot.planid}
                              labelKey={'accountTitle'}
                              optionComponent={PlanList}
                              valueComponent={PlanValue}
                              onChange={item => {
                                if (this.lot) {
                                  this.lot.planid = item;
                                }
                              }}
                      />
                    </Col>
                  </Row>

                </CardBody>
              </Card>
            </Col>
          </Row>

          <Form>
            <Row>
              <Col>
                <FGI l={t('Количество')} lf="5" ls="7" required>
                  <InputMask className="form-control"
                             mask="99999999999999"
                             maskChar={null}
                             placeholder={t('Введите число')}
                             value={lot.params.quantity}
                             onChange={e => setLotParam('quantity', e.target.value, 'num')}/>
                </FGI>
              </Col>
            </Row>

            <Row>
              <Col>
                <FGI l={t('Ед.изм', {keySeparator: '>', nsSeparator: '|'})} lf="5" ls="7">
                  <label className="col-form-label">{lot.dirunit_name}</label>
                </FGI>
              </Col>
            </Row>

            <Row className={"mb-2"}>
              <Col>
                <FGI l={t('Адрес и место поставки')} lf="5" ls="7" required>
                  <CoateSelect placeholder={t('Выберите')}
                               valueKey="id"
                               value={address.coate}
                               onChange={coate => setLotParam('address.coate', coate)}/>
                </FGI>
              </Col>
            </Row>

            <Row className={"mb-2"}>
              <Col>
                <FGI l={t('Улица')} lf="5" ls="7" required>
                  <Input type={"text"}
                         value={address.street}
                         onChange={e => setLotParam('address.street', e.target.value)}/>
                </FGI>
              </Col>
            </Row>

            <Row className={"mb-2"}>
              <Col>
                <FGI l={t('№ дома')} lf="5" ls="7" required>
                  <Input type={"text"} value={address.house}
                         onChange={e => setLotParam('address.house', e.target.value)}/>
                </FGI>
              </Col>
            </Row>

            <Row className={"mb-2"}>
              <Col>
                <FGI l={t('Квартира')} lf="5" ls="7">
                  <Input type={"text"} value={address.apt} onChange={e => setLotParam('address.apt', e.target.value)}/>
                </FGI>
              </Col>
            </Row>

            <Row className={"mb-2"}>
              <Col>
                <FGI l={t('Сроки поставки(дней)')} lf="5" ls="7" required>
                  <InputMask className="form-control"
                             mask="99999999"
                             placeholder={t('Введите число')}
                             maskChar={null}
                             value={lot.params.estimated_delivery_time}
                             onChange={e => setLotParam('estimated_delivery_time', e.target.value, 'num')}/>
                </FGI>
              </Col>
            </Row>

          </Form>

          <Row>
            <Col className="text-center">
              <Button onClick={this.addLot} disabled={!this.canAddLot()} className="mr-1">
                {t('Добавить')}
              </Button>
              <Button onClick={e => this.deleteLot(e, 'current')} color="danger">
                {t('Удалить')}
              </Button>
            </Col>
          </Row>
        </Col>}

        <div className="d-flex justify-content-center">
          <h3>{t('Перечень закупаемых товаров')}</h3>
        </div>

        <Row>
          <Col>
            <Table data={this.lots}
                   pageSize={10}
                   minRows={1}
                   filterable={false}
                   showPagination={this.lots.length > 10}
                   showRowNumbers={true}
                   columns={[
                     {
                       Header: t('Единицы измерения'),
                       accessor: 'dirunit_name'
                     },
                     {Header: t('Категория'), accessor: "name", Cell: row => row.original.category[label]},
                     {Header: t('Количество'), id: "quantity", accessor: "params.quantity"},
                     {
                       Header: t('Цена за ед.', {
                         keySeparator: '>',
                         nsSeparator: '|',
                       }), accessor: "params.unit_price",
                       Cell: ({value}) => formatMoney(value)
                     },
                     {
                       Header: t('План. сумма'), id: "budget",
                       accessor: lot => lot.params.unit_price * lot.params.quantity,
                       Cell: ({value}) => formatMoney(value)
                     },
                     {
                       Header: t('Адрес и место поставки'), accessor: "delivery_place",
                       Cell: data => <span title={data.row.delivery_place}>{data.row.delivery_place}</span>
                     },
                     {Header: t('Сроки пост. (дней)'), accessor: "params.estimated_delivery_time"},
                     {
                       Header: t('Действия'), Cell: ({index}) =>
                         <Fragment>
                           <a href="" title={t('Изменить')} className="mr-2" onClick={e => this.editLot(e, index)}>
                             <i className="fa fa-lg fa-edit text-primary"/>
                           </a>
                           <a href="" title={t('Удалить')} onClick={e => this.deleteLot(e, index)}>
                             <i className="fa fa-lg fa-trash text-danger"/>
                           </a>
                         </Fragment>
                     }
                   ]}/>
          </Col>
        </Row>

        <Row className="mt-2">
          <Col>
            {this.annEditMode &&
            <Button color="secondary" className="mr-2" to={`/purchaser/announce/preview/${this.ann_id}`}>
              {t('Назад')}
            </Button>
            }
            <Button onClick={this.confirmReset} color="danger" className="mr-2">
              <i className="fa fa-times mr-1"/>
              {this.annEditMode ? t('Удалить все позиции') : t('Очистить корзину')}
            </Button>
            <Button to={"/purchaser/catalog" + (this.annEditMode ? ('/' + this.ann_id) : '')} className="mr-2">
              <i className="fa fa-plus mr-1"/>
              {t('Добавить товар (позицию)')}
            </Button>
            {this.annEditMode &&
            <Button onClick={() => this.saveAdvert()} disabled={!this.canSaveAdvert} color="success"
                    className="mr-2">
              <i className="fa fa-check mr-1"/>
              {t('Сохранить')}
            </Button>
            }
            <Button onClick={() => this.saveAdvert(true)} disabled={!this.canSaveAdvert} color="success"
                    className="mr-2">
              <i className="fa fa-check mr-1"/>
              {this.annEditMode ? t('Сохранить и продолжить') : t('Сформировать объявление')}
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}








