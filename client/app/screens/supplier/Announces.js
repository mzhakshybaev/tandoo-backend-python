import React from 'react'
import {FlatList} from 'react-native';
import {inject, observer} from 'mobx-react';
import Toolbar, {ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import {formatDateTime, formatMoney, getStatusTr} from "../../../utils/helpers";
import TabView from "../../components/TabView";
import ScreenWrapper from "../../components/ScreenWrapper";
import Card from "../../components/Card";
import ItemView from "../../components/ItemView";
import Spinner, {NoDataView} from "../../components/Spinner";

@inject("supplierStore", "authStore") @observer
export default class Announces extends React.Component {

  render() {
    const {navigation} = this.props;

    const Header = (
      <Toolbar hasTabs>
        <ToolbarButton back/>
        <ToolbarTitle>Моя продукция</ToolbarTitle>
      </Toolbar>
    );

    const tab = (
      <TabView>
        <AppList tabLabel='Предложения/Заявки' navigation={navigation}/>
        <AppProjs tabLabel='Проекты' navigation={navigation}/>
        <AppRequests tabLabel='Запросы' navigation={navigation}/>
      </TabView>
    );

    return (
      <ScreenWrapper header={Header} tab={tab}/>
    )
  }
}


@inject('supAppsListCtrl', 'mainStore') @observer
class AppList extends React.Component {

  componentDidMount() {
    let lang = this.props.mainStore.language.code;

    if (this.lang !== lang) {
      this.setItem(lang);
      this.props.supAppsListCtrl.load();
    }
  }

  setItem(lang = this.props.mainStore.language.code) {
    this.lang = lang;
  }


  render() {
    let {ready, anns} = this.props.supAppsListCtrl;
    if (!ready) return <Spinner/>;
    return (
      <FlatList data={anns || []}
                ListEmptyComponent={<NoDataView/>}
                renderItem={obj => this.renderItem(obj)}
                keyExtractor={(item, index) => index.toString()}/>
    )
  }

  renderItem = (obj) => {
    const {index, item} = obj;
    return (
      <Card
        key={index} onPress={() => this.props.navigation.navigate('announce/view', {id: item._id})}
        title={`№ объявления: ${item.code}`}
      >
        <ItemView label={'Статус'} value={getStatusTr('announce', item.status)}/>
        <ItemView label={'Наимен. объявления'} value={item.dirsection}/>
        <ItemView label={'Закуп. организация'} value={item.pur_company}/>
        <ItemView label={'Дата публикации объявления'} value={formatDateTime(item.published_date)}/>
      </Card>
    )
  };
}

@inject('supAppsDraftsListCtrl', 'mainStore') @observer
class AppProjs extends React.Component {

  componentDidMount() {
    let lang = this.props.mainStore.language.code;

    if (this.lang !== lang) {
      this.setItem(lang);
      this.props.supAppsDraftsListCtrl.load();
    }
  }

  setItem(lang = this.props.mainStore.language.code) {
    this.lang = lang;
  }


  render() {
    let {ready, apps} = this.props.supAppsDraftsListCtrl;
    if (!ready) return <Spinner/>;
    return (
      <FlatList data={apps || []}
                ListEmptyComponent={<NoDataView/>}
                renderItem={obj => this.renderItem(obj)}
                keyExtractor={(item, index) => index.toString()}/>
    )
  }

  renderItem = (obj) => {
    const {index, item} = obj;
    return (
      <Card
        key={index} onPress={() => this.props.navigation.navigate('supplier/proposal/edit', {id: item._id})}
        title={`№ объявления: ${item.announce.code}`}
      >
        <ItemView label={'Статус'} value={getStatusTr('announce', item.status)}/>
        <ItemView label={'Наимен. объявления'} value={item.dirsection}/>
        <ItemView label={'Закуп. организация'} value={item.org_name}/>
        <ItemView label={'Дата подачи'} value={formatDateTime(item.created_date)}/>
      </Card>
    )
  };
}

@inject('supRequestsListCtrl','mainStore') @observer
class AppRequests extends React.Component {

  componentDidMount() {
    this.props.supRequestsListCtrl.load();
  }

  componentWillUnmount() {
    this.props.supRequestsListCtrl.reset();
  }

  render() {
    let {ready, announces} = this.props.supRequestsListCtrl;
    if (!ready) return <Spinner/>;
    return (
      <FlatList data={announces || []}
                ListEmptyComponent={<NoDataView/>}
                renderItem={obj => this.renderItem(obj)}
                keyExtractor={(item, index) => index.toString()}/>
    )
  }

  renderItem = (obj) => {
    const {index, item} = obj;
    return (
      <Card
        key={index} onPress={() => this.props.navigation.navigate('announce/view', {id: item._id})}
        title={`№ объявления: ${item.code}`}
      >
        <ItemView label={'Статус'} value={getStatusTr('announce', item.status)}/>
        <ItemView label={'Наимен. объявления'} value={item.dirsection}/>
        <ItemView label={'Метод закупок'} value={item.dirprocurement}/>
        <ItemView label={'Организация'} value={item.organization}/>
        <ItemView label={'План. сумма'} value={formatMoney(item.budget)}/>
        <ItemView label={'Дата публикации'} value={formatDateTime(item.published_date)}/>
        <ItemView label={'Срок подачи КЗ'} value={formatDateTime(item.deadline)}/>
      </Card>
    )
  };
}






