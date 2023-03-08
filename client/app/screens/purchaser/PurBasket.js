import {inject, observer} from "mobx-react";
import React, {Component} from "react";
import {action, computed, observable, runInAction} from "mobx";
import {isEmpty, omit, reject, set} from "lodash-es";
import {storageGet, storageRemove, storageSave} from "../../../utils/LocalStorage";
import announceApi from "../../../stores/api/AnnounceApi";
import {showError, showSuccess} from "../../../utils/messages";
import {formatMoney, parseNumber} from "../../../utils/helpers";
import Confirm from "../../components/Confirm";
import ScreenWrapper from "../../components/ScreenWrapper";
import Toolbar, {ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import {Text, View} from "react-native";
import Card from "../../components/Card";
import ItemView from "../../components/ItemView";
import CheckBox from "../../components/CheckBox";
import Input from "../../components/Input";
import Button, {ActionButton} from "../../components/Button";
import vars from "../../common/vars";
import CoateSelect from "../../components/CoateSelect";


@inject("dictStore", 'mainStore', "authStore")
@observer
export default class PurBasket extends Component {

  @observable ready = false;
  @observable section = null;
  @observable lots = [];
  @observable lot = null;
  @observable annEditMode = false;
  @observable changePrice = false;
  @observable price = '';
  @observable priceError = null;

  componentDidMount() {
    const {navigation} = this.props;
    const id = navigation.getParam('id');
    this.load(id);
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
          address: lot.data.address,
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
    });
  }

  @computed get lot_budget() {
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
      advert: {
        _id,
        dirsection_id: this.section._id,
      },
      advert_lots: this.lots.map(lot => ({
        _id: lot._id,
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

    showSuccess('Успешно сохранено');

    if (redirect)
      this.props.navigation.navigate('purchaser/announce/edit', {id: _id});
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

  async deleteLot(index, confirm = true) {
    if (confirm) {

      const yes = Confirm('', 'Вы действительно хотите удалить позицию?');
      if (yes) {
        if (index === 'current') {
          this.lot = null;
          storageRemove('basketLot');
          this.toggleChangePrice(false);

        } else {
          this.lots.splice(index, 1);
        }
        await this.storeLots();
      }
    }
  }

  async editLot(index) {
    if (this.lot) {
      const yes = Confirm('Сейчас вы редактируете не сохранённую позицию.', 'Хотите удалить её?');
      if (yes) {
        this.deleteLot('current', false)
      }
    }

    this.lot = this.lots[index];
    this.lots.splice(index, 1);
  }

  confirmReset = async () => {
    const yes = Confirm('', 'Вы действительно хотите очистить перечень товаров?');
    if (yes) {
      await storageRemove('basket');
      await storageRemove('basketLot');
      this.props.navigation.navigate("purchaser/catalog");
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


  render() {

    const {navigation} = this.props;

    let lot = this.lot;
    let address = lot && lot.params.address;
    let {mainStore} = this.props;
    let {language} = mainStore;
    let {setLotParam} = this;

    let label = 'name';
    if (language && language.code.in_('en', 'kg')) {
      label = 'name_' + language.code;
    }

    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>Создание объявления</ToolbarTitle>
      </Toolbar>
    );

    return <ScreenWrapper header={Header} loading={!this.ready}>
      {lot && <>
        <Card>
          <ItemView label={'Категория'} value={lot.category[label]}/>
          {lot.dicts && lot.dicts.map((d, i) => <ItemView key={i} label={d.displayName} value={
            <View>
              {d.values.map((v, i) => (
                <Text key={i}>{v.name}</Text>
              ))}
            </View>
          }/>)}

          {lot.specs && lot.specs.map((s, i) => <ItemView key={i} label={s.property} value={
            <View>
              {s.values.map((v, i) => (
                <Text key={i}>{v.name}</Text>
              ))}
            </View>
          }/>)}

          <ItemView label={'Цена за единицу'}
                    value={formatMoney(lot.params.unit_price) + ' (Средняя цена товара из Каталога)'}/>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 0.5,
            borderBottomColor: vars.borderColor,
            paddingVertical: 3
          }}>
            <CheckBox containerStyle={{marginBottom: 0}} checked={this.changePrice} title={'Указать свою цену'}
                      onChange={(val) => this.toggleChangePrice(val)}/>
            {this.changePrice &&
            <Input containerStyle={{width: 100, marginBottom: 0}} value={this.price}
                   onChange={(val) => this.setPrice(val)}
                   keyboardType='numeric'/>}
          </View>

          <ItemView label={'Планируемая сумма'}
                    value={this.lot_budget ? formatMoney(this.lot_budget) : 'Укажите количество'}/>
        </Card>
        <Card>
          <Input required containerStyle={{marginBottom: 0}} label={'Количество'} keyboardType='numeric'
                 placeholder='Введите число' value={lot.params.quantity}
                 onChange={(val) => setLotParam('quantity', val, 'num')}/>
          <Text style={{marginBottom: 15}}>Ед.изм: {lot.dirunit_name}</Text>

          <CoateSelect label={'Адрес и место поставки'} value={address.coate} required
                       onSelect={coate => setLotParam('address.coate', coate)}/>

          <Input label={'Улица'} value={address.street} required
                 onChange={value => setLotParam('address.street', value)}/>
          <Input label={'№ дома'} value={address.house} required
                 onChange={value => setLotParam('address.house', value)}/>
          <Input label={'Квартира'} value={address.apt}
                 onChange={value => setLotParam('address.apt', value)}/>
          <Input label={'Сроки поставки(дней'} value={lot.params.estimated_delivery_time} required
                 onChange={value => setLotParam('estimated_delivery_time', value, 'num')}/>

          <Button title={'Добавить'} onPress={this.addLot} disabled={!this.canAddLot()}/>
          <Button title={'Удалить'} onPress={() => this.deleteLot('current')}
                  disabled={!this.canAddLot()}
                  color={vars.red}/>

        </Card>
      </>
      }

      <Text style={{textAlign: 'center', fontWeight: 'bold', marginTop: 15}}>Перечень закупаемых товаров</Text>

      {this.lots && this.lots.map((lot, i) => <Card key={i}>
        <ItemView label={'Единицы измерения'} value={lot.dirunit_name}/>
        <ItemView label={'Категория'} value={lot.category[label]}/>
        <ItemView label={'Цена за ед.'} value={formatMoney(lot.params.unit_price)}/>
        <ItemView label={'План. сумма'} value={formatMoney(lot.params.unit_price * lot.params.quantity)}/>
        <ItemView label={'Адрес и место поставки'} value={lot.delivery_place}/>
        <ItemView label={'Сроки пост. (дней)'} value={lot.params.estimated_delivery_time}/>
        <ItemView label={'Действия'} value={<View style={{flexDirection: 'row'}}>
          <ActionButton name={'edit'} onPress={() => this.editLot(i)}/>
          <ActionButton name={'trash'} color={vars.red} onPress={() => this.deleteLot(i)}/>
        </View>}/>
      </Card>)}

      <View style={{marginHorizontal: 10}}>
        <Button onPress={this.confirmReset} color={vars.red}
                title={this.annEditMode ? 'Удалить все позиции' : 'Очистить корзину'}/>
        < Button onPress={() => navigation.navigate('purchaser/catalog', {id: this.annEditMode ? this.ann_id : ''})}
                 title={'Добавить товар (позицию)'}/>
        {this.annEditMode &&
        <Button onPress={() => this.saveAdvert()} disabled={!this.canSaveAdvert} color={vars.secondary}
                title={'Сохранить'}/>
        }
        <Button onPress={() => this.saveAdvert(true)} disabled={!this.canSaveAdvert} color={vars.secondary}
                title={this.annEditMode ? 'Сохранить и продолжить' : 'Сформировать объявление'}/>
      </View>
    </ScreenWrapper>;
  }
}
