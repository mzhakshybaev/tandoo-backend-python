import React, {Component} from "react";
import {Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {inject, observer} from 'mobx-react';
import {Avatar, Icon} from "react-native-elements";
import TouchableItem from "./TouchableItem";
import vars from "../common/vars";
import DeviceInfo from 'react-native-device-info';
import Confirm from "./Confirm";

const currentYear = new Date().getFullYear();

const MenuItem = ({item, navigation}) => (
  <TouchableItem
    style={{
      padding: 15,
      borderBottomColor: vars.borderColor,
      borderBottomWidth: .5,
      justifyContent: 'center'
    }}
    onPress={() => {
      let route = item.url;
      if (route) {
        if (route.startsWith('/')) {
          route = route.replace('/', '');
        }
        if (route === 'purchaser/contracts') {
          navigation.navigate('purchaser/announce/listing', {tabId: 5});
        } else {
          navigation.navigate(route);
        }
      }
    }}>
    <Text style={{color: 'white', fontSize: 14, fontWeight: 'bold'}}>{item.name}</Text>
  </TouchableItem>
);

const constantMenus = [
  {name: 'Объявления', url: '/announcements'},
  {name: 'Каталог', url: '/purchaser/catalog'},
];

const Header = ({navigation, valid, user}) => (
  <View style={{backgroundColor: vars.white, paddingVertical: 10, paddingHorizontal: 15}}>
    {valid ?
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{flex: 1}}>
          <Text style={{fontSize: 18, fontWeight: 'bold', color: vars.primary}}>
            {user.fullname || user.email || user.phone}
          </Text>
          <Text style={{fontSize: 16, color: vars.primary, marginVertical: 5}}>
            {user.username}
          </Text>
        </View>
        <Avatar
          size="medium"
          rounded
          source={{uri: "https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg"}}
          onPress={() => console.log("Works!")}
          activeOpacity={0.7}
        />
      </View> :
      <Text
        style={{
          backgroundColor: 'transparent',
          color: vars.primary,
          fontWeight: 'bold',
          fontSize: 18,
          textAlign: 'center',
          marginTop: 10
        }}
        onPress={() => navigation.navigate('login')}>
        Вход{'    |    '}Регистрация
      </Text>}
  </View>
);

const ExitItem = ({authStore}) => (
  authStore.valid &&
  <TouchableOpacity style={{flexDirection: 'row', backgroundColor: 'white', alignItems: 'center', padding: 13}}
                    onPress={() =>
                      Confirm('Подтверждение',
                        'Вы уверены что хотите выйти?',
                        () => authStore.logout())
                    }>
    <Icon name={'close'} color={'red'}/>
    <Text style={[{color: 'red', fontSize: 16, flex: 1, marginLeft: 15}]}>Выход</Text>
  </TouchableOpacity>
);

const About = ({appVersion}) => (
  <View style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    borderTopWidth: 1,
    borderTopColor: vars.borderColor
  }}>
    <Text style={{color: vars.text, fontSize: 12}}>Версия: {appVersion}</Text>
    <Text style={{color: vars.text, fontSize: 12}}>EBRD SME project © {currentYear}</Text>
  </View>
);

@inject('authStore', 'menuStore') @observer
export default class SideMenu extends Component {

  constructor(props) {
    super(props);
    this.state = {appVersion: ''}
  }

  componentDidMount() {
    DeviceInfo.getVersion().then(appVersion => this.setState({appVersion}))
  }

  render() {
    const {authStore, menuStore, navigation} = this.props;
    const {user} = authStore;

    return (
      <SafeAreaView style={{flex: 1, backgroundColor: vars.white}}>
        <Header navigation={navigation} valid={authStore.valid} user={user}/>
        <ScrollView style={{backgroundColor: vars.primary}}>
          {constantMenus.map((m, i) => <MenuItem key={i} item={m} navigation={navigation}/>)}
          {authStore.valid && menuStore.items.map((m, i) => <MenuItem key={i} item={m} navigation={navigation}/>)}
        </ScrollView>
        <ExitItem authStore={authStore}/>
        <About appVersion={this.state.appVersion}/>
      </SafeAreaView>
    );
  }
}
