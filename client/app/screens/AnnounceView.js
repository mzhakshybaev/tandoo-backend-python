import React, {Component} from 'react';
import {Text, View} from 'react-native';
import {inject, observer} from "mobx-react";
import Card from "../components/Card";
import {formatDateTime, formatMoney, getPayTypeTr, getStatusTr} from "../../utils/helpers";
import ScreenWrapper from "../components/ScreenWrapper";
import Toolbar, {Title, ToolbarButton, ToolbarTitle} from "../components/Toolbar";
import vars from "../common/vars";
import {Icon} from "react-native-elements";
import CheckBox from "../components/CheckBox";
import ItemView from "../components/ItemView";

const label = 'name';
let unit = 'name';

export const AnnounceMainData = ({announce}) => (
  <Card title={'Общие Данные'}>
    <ItemView label={'№ Объявления'} value={announce.code}/>
    <ItemView label={'Закупающая организация'} value={announce.company && announce.company.name}/>
    <ItemView label={'Метод закупок'} value={announce.dirprocurement && announce.dirprocurement[label]}/>
    {announce.dirprocurement && announce.dirprocurement.with_concession &&
    <ItemView label={'Льгота для внутренних поставщиков'} value={`${announce.concession} %`}/>
    }
    <ItemView label={'Наименование закупки'} value={announce.dirsection && announce.dirsection[label]}/>
    <ItemView label={'Статус'} value={getStatusTr('announce', announce.status)}/>
    {announce.hide !== true &&
    <ItemView label={'Планируемая сумма'} value={formatMoney(announce.budget)}/>
    }
    <ItemView label={'Дата публикации'} value={announce.published_date && formatDateTime(announce.published_date)}/>
    <ItemView label={'Срок подачи предложения'} value={announce.deadline && formatDateTime(announce.deadline)}/>
    {announce.data.tehadress &&
    <ItemView label={'Технический контроль испытаний'} value={announce.data.tehadress}/>}

    <Text style={{marginTop: 15, fontWeight: 'bold'}}>Гарантия:</Text>
    <View style={{paddingLeft: 10}}>
      <Text>{`Гарантийный период на товар не менее ${announce.data.guarant_day || ''} дней с момента поставки`}</Text>
      <Text>{`Замена бракованного товара производится в течении ${announce.data.defect_day || ''} рабочих дней с момента получения уведомления с покупателя`}</Text>
    </View>
  </Card>
);

export const AnnounceLotsList = ({lots, app_lots}) => (
  <Card title={'Перечень закупаемых товаров'}>
    {lots.map((lot, i) =>
      <View key={i}
            style={{paddingBottom: 5, marginBottom: 5, borderBottomWidth: 1, borderBottomColor: vars.borderColor}}>
        <ItemView label={`Позиция № ${i + 1}`} value={lot.dircategory[0][label]}/>
        {lot.dictionaries.map((d, i) => <ItemView key={i} label={d[unit]} value={d.values[0][label]}/>)}
        {lot.specifications.map((s, i) => <ItemView key={i} label={s.property[label]} value={s.value[label]}/>)}
        <ItemView label={`Количество`} value={lot.quantity}/>
        <ItemView label={`Цена за единицу`} value={formatMoney(lot.unit_price)}/>
        {lot.hide !== true && <ItemView label={`Планируемая сумма`} value={formatMoney(lot.budget)}/>}
        <ItemView label={`Адрес и место поставки`} value={lot.delivery_place}/>
        <ItemView label={`Сроки поставки`} value={`${lot.estimated_delivery_time} дней`}/>
        {app_lots && <View style={{flexDirection: 'row'}}>
          <Text style={{fontWeight: 'bold'}}>Наличие подобного товара </Text>
          {(() => {
            let id = lot._id;
            let app_lot = app_lots.find(lot => lot._id === id);

            if (app_lot && app_lot.products && app_lot.products.length) {
              return (
                <View style={{flexDirection: 'row'}}>
                  <Icon name={'check-box'}/>
                  <Text>{`${app_lot.products.length} продукт(ов)`}</Text>
                </View>
              );
            }
            return <Text>-</Text>;
          })()}
        </View>}
      </View>
    )}
  </Card>
);

const AllProposals = ({announce, allApps, visible}) => {
  if (announce.status !== 'Results' || !visible) return null;
  if (!allApps || (allApps.length === 0)) return null;

  return (
    <Card title={'Все предложения'}>
      {allApps.map(({app}, i) => <View key={i} style={{marginBottom: 10}}>
        <ItemView label={'Поставщик'} value={app.company}/>
        <ItemView label={'Марка'} value={app.brand}/>
        <ItemView label={'Страна производитель'} value={app.country}/>
        <ItemView label={'Цена за единицу'} value={app.unit_price}/>
        <ItemView label={'Общая цена'} value={app.total}/>
        {!!app.reason || !!app.selected &&
        <ItemView label={'Выбран'} value={<Icon name={'checkbox-marked-outline'} type={'material-community'}/>}/>}
        {!!app.reason && <ItemView label={'Причина отмены'} value={app.reason}/>}
      </View>)}
    </Card>
  );
};

export const AnnouncePayments = ({payments}) => (
  !!payments &&
  <Card title={'Платежи'}>
    {!!payments.advanceEnabled && <ItemView label={getPayTypeTr('advance')} value={`${payments.advance} %`}/>}
    {!!payments.shipmentEnabled && <ItemView label={getPayTypeTr('shipment')} value={`${payments.shipment} %`}/>}
    {!!payments.acceptEnabled && <ItemView label={getPayTypeTr('accept')} value={`${payments.accept} %`}/>}
  </Card>
);

@inject('mainStore') @observer
export class AnnounceMyAppDetail extends Component {

  rejectDisplayKeys = ['image', '_id', 'product_id', 'unit_price', 'quantity', 'date_add', 'date_update', 'status', 'total', 'company_id', 'code'];

  render() {
    const {t, apps, app_lots} = this.props;
    const {mainStore} = this.props;
    const {language} = mainStore;

    let label = 'name';
    if (language && language.code === 'en') {
      label = 'name_en';
    }
    if (language && language.code === 'kg') {
      label = 'name_kg';
    }

    return apps.map((app, i) => <Card key={i}>
      <ItemView label={'Категория'} value={app.lot.dircategory}/>
      <ItemView label={'Кол-во'} value={app.lot.products[0]["quantity"]}/>
      <ItemView label={'Цена за единицу'} value={formatMoney(app.lot.applications[0]["unit_price"])}/>
      <ItemView label={'Сумма'} value={formatMoney(app.lot.applications[0]["total"])}/>
      {false && Object.keys(app.lot.products[0]).withoutArr(this.rejectDisplayKeys).map((key, j) => <View key={j}>
        <ItemView label={key === 'barcode' ? 'Штрих код' : (key === 'dircategory' ? 'Категория' : key)}
                  value={app.lot.products[0][key]}/>
      </View>)
      }
    </Card>);
  }
}

@inject('announceViewCtrl', 'mainStore') @observer
export default class AnnounceView extends Component {
  state = {
    visible: false
  };

  componentDidMount() {
    const {navigation} = this.props;
    const id = navigation.getParam('id');
    if (id) {
      this.load(id);
    }
  }

  load(id) {
    this.id = id;
    this.props.announceViewCtrl.load(id);
  }

  componentWillUnmount() {
    this.id = null;
    this.props.announceViewCtrl.reset();
  }

  render() {
    let ctrl = this.props.announceViewCtrl;
    let {announce, announce_app, myApps, allApps, isApplicable, isPurchaser, isOwner, ready} = ctrl;
    const {visible} = this.state;

    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>Просмотр объявления</ToolbarTitle>
      </Toolbar>
    );

    return (
      <ScreenWrapper header={Header} loading={this.props.mainStore.isBusy}>
        {!!announce && <>
          <AnnounceMainData announce={announce}/>
          <AnnounceLotsList lots={announce.lots} app_lots={isApplicable && announce_app.advert_lots}
                            hide_total={announce.hide}/>
          <AnnouncePayments payments={announce.data && announce.data.payments}/>
          {announce.status === 'Results' &&
          <CheckBox checked={visible}
                    title='Показывать все предложения'
                    onChange={() => this.setState({visible: !visible})}/>
          }
          <AllProposals announce={announce} visible={visible} allApps={allApps}/>
          {myApps && (myApps.length > 0) &&
          <>
            <Title>{`Моё предложение - ${myApps.length}`}</Title>
            <AnnounceMyAppDetail apps={myApps} app_lots={isApplicable && myApps}/>
          </>}
        </>
        }
      </ScreenWrapper>
    )
  }
}
