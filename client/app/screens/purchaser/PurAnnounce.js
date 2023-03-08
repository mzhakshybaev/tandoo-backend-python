import React, {Component} from 'react';
import ScreenWrapper from "../../components/ScreenWrapper";
import Toolbar, {ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import TabView from "../../components/TabView";
import {FlatList, View} from "react-native";
import {inject, observer} from "mobx-react";
import Card from "../../components/Card";
import Spinner, {NoDataView} from "../../components/Spinner";
import ItemView from "../../components/ItemView";
import {formatDateTime, formatMoney, getStatusTr} from "../../../utils/helpers";
import {observable} from "mobx";
import {ActionButton} from "../../components/Button";

@inject('purAnnListCtrl', 'mainStore') @observer
export default class PurAnnounce extends React.Component {

  @observable tabId = 0;

  componentWillMount() {
    const {state} = this.props.navigation;
    this.tabId = state.params ? state.params.tabId : 0;
    this.load(this.tabId);
  }

  async load(index) {
    let status;
    if (index === 0) {
      status = "All";
    }
    if (index === 1) {
      status = "Draft";
    }
    if (index === 2) {
      status = "Published";
    }
    if (index === 3) {
      status = "Evaluation";
    }
    if (index === 4) {
      status = "Results";
    }
    if (index === 5) {
      status = undefined;
    }
    if (status) {
      this.props.purAnnListCtrl.load(status);
    }
    this.tabId = index;
  }

  render() {
    const {navigation} = this.props;
    let {ready, announces} = this.props.purAnnListCtrl;
    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>Мои объявления</ToolbarTitle>
        {this.tabId === 0 && <ToolbarButton iconName={'plus'} iconType={'feather'}
                                            onPress={() => navigation.navigate('purchaser/catalog')}/>}
      </Toolbar>
    );

    const tab = (
      <TabView onChangeTab={({i}) => this.load(i)} initialPage={this.tabId}>
        <Items tabLabel={`Все объявления`} ready={ready} announces={announces} navigation={navigation}/>
        <Items tabLabel={`Проекты`} ready={ready} announces={announces} navigation={navigation}/>
        <Items tabLabel={`Опубликовано`} ready={ready} announces={announces} navigation={navigation}/>
        <Items tabLabel={`Оценка`} ready={ready} announces={announces} navigation={navigation}/>
        <Items tabLabel={`Итоги`} ready={ready} announces={announces} navigation={navigation}/>
        <PurchaserContractsList tabLabel={`Договора`} navigation={navigation}/>
      </TabView>
    );

    return <ScreenWrapper header={Header} tab={tab}/>
  }
}

const Items = ({ready, announces, navigation}) => {

  if (!ready) return <Spinner/>;
  if (!announces || announces.length === 0) return <NoDataView/>;

  const renderItem = (item) => {

    let action;
    if (item.status === 'Draft') {
      action =
        <ActionButton name={'edit'} onPress={() => navigation.navigate('purchaser/announce/preview', {id: item._id})}/>
    }

    if (item.status === 'Evaluation') {
      //<Link to={'/announce/view/' + row._id} title={t('Таблица цен')}>
      action = <View style={{flexDirection: 'row'}}>
        <ActionButton name={'list-ol'} onPress={() => navigation.navigate('announce/view', {id: item._id})}/>
        <ActionButton name={'tasks'}/>
      </View>
    }

    if (item.status === 'Results') {
      //'/purchaser/announce/preview/' + row._id
      action = <View style={{flexDirection: 'row'}}>
        <ActionButton name={'list-ol'} onPress={() => navigation.navigate('announce/view', {id: item._id})}/>
        <ActionButton name={'flag-checkered'}
                      onPress={() => navigation.navigate('purchaser/announce/result', {id: item._id})}/>
        <ActionButton name={'pencil'}
                      onPress={() => navigation.navigate('purchaser/announce/contracts', {id: item._id})}/>
      </View>
    }

    return (
      <Card key={item.code} title={`№ ${item.code || ''}`} containerStyle={{marginHorizontal: 10, marginVertical: 5}}
            onPress={() => navigation.navigate('announce/view', {id: item._id})}>
        <ItemView label={'Наимен. объявления'} value={item.dirsection}/>
        <ItemView label={'План сумма'} value={formatMoney(item.budget)}/>
        <ItemView label={'Статус'} value={getStatusTr('announce', item.status)}/>
        <ItemView label={'Дата публикации'} value={item.published_date && formatDateTime(item.published_date)}/>
        <ItemView label={'Срок подачи КЗ'} value={item.deadline && formatDateTime(item.deadline)}/>
        <ItemView label={'Действия'} value={action}/>
      </Card>
    )
  };

  return (
    <FlatList data={announces}
              renderItem={({item}) => renderItem(item)}
              keyExtractor={(item, index) => index.toString()}/>
  )

};


@inject('purContractListCtrl') @observer
export class PurchaserContractsList extends Component {
  componentDidMount() {
    this.props.purContractListCtrl.load();
  }

  componentWillUnmount() {
    this.props.purContractListCtrl.reset();
  }

  render() {
    let {ready, contracts} = this.props.purContractListCtrl;
    if (!ready) return <Spinner/>;
    if (!contracts || contracts.length === 0) return <NoDataView/>;

    return (
      <FlatList data={contracts}
                renderItem={({item}) => this.renderItem(item)}
                keyExtractor={(item, index) => index.toString()}/>
    );
  }

  renderItem = (item) => (
    <Card key={item.code} title={`№ ${item.code || ''}`} containerStyle={{marginHorizontal: 10, marginVertical: 5}}
          onPress={() => this.props.navigation.navigate('contracts/view', {id: item.id})}>
      <ItemView label={'Закупающая организация'} value={item.pur_company}/>
      <ItemView label={'Предмет закупки'} value={item.dirsection}/>
      <ItemView label={'Поставщик'} value={item.sup_company}/>
      <ItemView label={'Статус'} value={getStatusTr('contract', item.status)}/>
      <ItemView label={'Сумма'} value={formatMoney(item.total)}/>
    </Card>
  )
}
