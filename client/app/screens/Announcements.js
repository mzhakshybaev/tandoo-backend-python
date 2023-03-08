import React from 'react'
import {FlatList, View} from 'react-native';
import {observer} from 'mobx-react';
import {Text} from "react-native-elements";
import vars from "../common/vars";
import Toolbar, {ToolbarButton, ToolbarTitle} from "../components/Toolbar";
import {formatDateTime, formatMoney, getStatusTr} from "../../utils/helpers";
import announceApi from '../../stores/api/AnnounceApi';
import Card from "../components/Card";
import TabView from "../components/TabView";
import ScreenWrapper from "../components/ScreenWrapper";
import ItemView from "../components/ItemView";
import Spinner, {NoDataView} from "../components/Spinner";

@observer
export default class Announcements extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      amountOptions: [30, 50, "Все"],
      announcements: [],
      selectedAmount: 30,
      loading: false
    };
  }

  componentDidMount() {
    this.load(0);
  }

  async load(index) {
    let status;
    if (index === 0) {
      status = "Published";
    }
    if (index === 1) {
      status = "Evaluation";
    }
    if (index === 2) {
      status = "Results";
    }
    if (index === 3) {
    }
    if (index === 4) {
      status = "Canceled";
    }
    this.setState({announcements: [], loading: true});
    if (status) {
      try {
        let {docs: announcements, totalCount} = await announceApi.list({limit: this.state.selectedAmount, status});
        this.setState({announcements, loading: false});
      } catch (e) {
        this.setState({loading: false});
      }
    } else {
      this.setState({loading: false});
    }
  }

  render() {
    const {navigation} = this.props;
    const {announcements, loading} = this.state;

    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>Объявления</ToolbarTitle>
      </Toolbar>
    );

    const tab = <TabView onChangeTab={({i}) => this.load(i)}>
      <Publishes tabLabel='Опубликованные' loading={loading} items={announcements} navigation={navigation}/>
      <Publishes tabLabel='Оценка' loading={loading} items={announcements} navigation={navigation}/>
      <Publishes tabLabel='Итоги' loading={loading} items={announcements} navigation={navigation}/>
      <Publishes tabLabel='Договора' loading={loading} items={announcements} navigation={navigation}/>
      <Publishes tabLabel='Отмененные' loading={loading} items={announcements} navigation={navigation}/>
    </TabView>;

    return <ScreenWrapper header={Header} tab={tab}/>
  }
}

const Publishes = ({items, navigation, loading}) => {
  if (loading) return <Spinner/>;

  const renderItem = (item) => (
    <Card key={item._id} title={`№ ${item.code}`} containerStyle={{marginHorizontal: 10, marginVertical: 5}}
          onPress={() => navigation.navigate('announce/view', {id: item._id})}>
      <ItemView label='Статус' value={getStatusTr('announce', item.status)}/>
      <ItemView label={'Наименование закупки'} value={item.dirsection}/>
      <ItemView label='Количество лотов' value={item.count_lot}/>
      <ItemView label='Сумма закупок' value={formatMoney(item.budget)}/>
      <Text style={{fontWeight: 'bold', backgroundColor: vars.borderColor, padding: 5, marginVertical: 5}}>
        Закупающая организация: {item.organization}
      </Text>
      <ItemView label='Опубликовано' value={formatDateTime(item.create_date)}/>
      <ItemView label='Завершение' value={formatDateTime(item.deadline)}/>
      <ItemView label='Метод закупок' value={item.dirprocurement}/>
    </Card>
  );

  return (
    <FlatList data={items}
              renderItem={({item}) => renderItem(item)}
              ListEmptyComponent={<NoDataView/>}
              keyExtractor={(item, index) => index.toString()}/>
  );
};






