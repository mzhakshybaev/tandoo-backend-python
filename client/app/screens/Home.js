import React, {Component} from 'react'
import {Alert, Image, Linking, Platform, TouchableOpacity, View} from 'react-native';
import {inject, observer} from 'mobx-react';
import {Icon, Text} from "react-native-elements";
import {getAppstoreAppVersion} from "react-native-appstore-version-checker";
import SplashScreen from 'react-native-splash-screen'
import vars from "../common/vars";
import Toolbar, {Title, ToolbarButton} from "../components/Toolbar";
import DeviceInfo from 'react-native-device-info';
import {getStorage} from "../../utils/LocalStorage";
import Card from "../components/Card";
import {formatDate} from "../../utils/helpers";
import ScreenWrapper from "../components/ScreenWrapper";
import BottomMenu from "../components/BottomMenu";
import {translate} from "react-i18next";
import Spinner from "../components/Spinner";

@inject('mainStore', 'authStore', 'supplierStore', 'dictStore') @observer
@translate(['common', 'settings', ''])
export default class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userModal: false, currency: [],
      info: [],
      now: null
    };
  }


  checkVersion = async () => {

    let appId;
    let urlIOS;
    let urlAndroid;

    // if (Platform.OS === 'ios') {
    //     appId = "adsad";
    //     urlIOS = `https://apps.apple.com/kg/app/asisnur-%D0%B0%D0%B3%D0%B5%D0%BD%D1%82/id${appId}`;
    // }

    if (Platform.OS === 'android') {
      appId = "kg.ictlab.emarket";
      urlAndroid = `https://play.google.com/store/apps/details?id=${appId}`;
    }

    if (appId) {
      const appVersion = await DeviceInfo.getVersion();
      try {
        const marketVersion = await getAppstoreAppVersion(appId);
        if (marketVersion === 'Varies with device') {
          return;
        }
        if (marketVersion !== appVersion) {
          Alert.alert(
            'Обновление',
            'Доступна новая версия приложения',
            [
              {text: 'Позже', onPress: () => null, style: 'cancel',},
              {
                text: 'Обновить', onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL(urlIOS);
                  }
                  if (Platform.OS === 'android') {
                    Linking.openURL(urlAndroid);
                  }
                }
              },
            ],
            {cancelable: true},
          );
        }
      } catch (e) {

      }
    }
  };


  componentDidMount() {
    const {mainStore, supplierStore, dictStore} = this.props;
    mainStore.setClient(vars.platform === 'ios' ? '2' : '3');
    this.loadDeviceId();
    supplierStore.getCurrency(new Date()).then(r => {
      this.setState({currency: r.results});
    });

    dictStore.getDictData("ESP").then(r => {
      this.setState({info: r});
    });

    this.checkVersion();

    SplashScreen.hide();
  }

  loadDeviceId = async () => {
    const {mainStore, authStore} = this.props;
    let deviceId;
    try {
      deviceId = await getStorage().load({key: 'deviceId'});
      if (!deviceId || deviceId === 'web')
        deviceId = await DeviceInfo.getUniqueId();
    } catch (e) {
      deviceId = await DeviceInfo.getUniqueId();
    }
    mainStore.setDeviceId(deviceId);
    authStore.check();
  };

  render() {
    const {navigation, authStore, t} = this.props;
    const {user} = authStore;
    const {currency, info} = this.state;

    const Header = (
      <Toolbar>
        <ToolbarButton menu/>
        <Image source={require('../images/logo-white.png')} style={{height: 25, width: 70, flex: 1}}
               resizeMode={'contain'}/>

        <ToolbarButton onPress={() => {
          if (authStore.valid) {
            this.toggleModal();
          } else {
            navigation.navigate('login');
          }
        }} iconName='person' style={{marginRight: 10}}/>
        {authStore.valid &&
        <TouchableOpacity onPress={() => navigation.navigate('notifications')}>
          <Text style={{
            borderRadius: 11,
            paddingHorizontal: 5,
            paddingVertical: 2,
            borderWidth: 1,
            borderColor: vars.white,
            textAlign: 'center',
            color: vars.white
          }}>
            {authStore.notification ? authStore.notification.count : 0}
          </Text>
        </TouchableOpacity>
        }
      </Toolbar>
    );

    return (
      <ScreenWrapper header={Header}>
        <Heading t={t}/>
        <Rate currency={currency}/>
        <News navigation={navigation}/>
        <Esp info={info} navigation={navigation}/>
        <Consult/>
        {!!user &&
        <BottomMenu isVisible={this.state.userModal} onClose={this.toggleModal}>
          <View style={{backgroundColor: vars.bg, padding: 10}}>
            <Text style={{fontWeight: 'bold'}}>{user.fullname || user.email || user.phone}</Text>
            <Text>{user.email}</Text>
          </View>

          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}
                            onPress={() => {
                              this.toggleModal();
                              navigation.navigate('myAccount');
                            }}>
            <Icon name='user' size={22} type='feather' width={50}/>
            <Text style={{flex: 1, color: vars.text, fontSize: 16}}>Мой аккаунт</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}
                            onPress={() => {

                            }}>
            <Icon name='settings' size={22} type='feather' width={50}/>
            <Text style={{flex: 1, color: vars.text, fontSize: 16}}>Настройки</Text>
          </TouchableOpacity>
        </BottomMenu>
        }
      </ScreenWrapper>
    )
  }

  toggleModal = () => {
    this.setState({userModal: !this.state.userModal});
  };
}

const Heading = ({t}) => (
  <Card>
    <Text style={{
      textAlign: 'center', fontSize: 20, backgroundColor: vars.primary, margin: -10, color: 'white',
      paddingVertical: 10
    }}>
      {t('HomePageWelcome')}
    </Text>
    <Text style={{marginTop: 20}}>
      Электронный каталог для закупки товаров, работ и услуг разработан в
      рамках проекта, финансируемого ЕБРР «Содействие участию малого и
      среднего бизнеса (МСБ) в государственных закупках». Проект
      реализовывался Департаментом госзакупок Министерства финансов КР.
    </Text>
  </Card>
);

const Rate = ({currency}) => (
  <Card title={'Официальные курсы валют НБ КР на ' + formatDate()}>
    {currency && currency.length > 0 ? currency.map((c, i) =>
      <View key={c.currency} style={{
        flexDirection: 'row',
        padding: 5,
        backgroundColor: i % 2 === 0 ? 'white' : '#e9e9e9'
      }}>
        <Text style={{width: 100}}>{c.currency}</Text>
        <Text>{c.value}</Text>
      </View>) : <Spinner/>}
  </Card>
);

const News = ({navigation}) => (
  <Card onPress={() => navigation.navigate('news')}>
    <View style={{flexDirection: 'row'}}>
      <Title style={{flex: 1, marginBottom: 0}}>Новости</Title>
      <Icon name={'chevron-right'} color={vars.primary}/>
    </View>
  </Card>

);

const Esp = ({info, navigation}) => (
  <Card title={'Получение ЭЦП'}>
    {info && info.length > 0 ? info.map((i, idx) =>
      <TouchableOpacity
        key={idx}
        style={{
          flexDirection: 'row',
          padding: 5,
          backgroundColor: idx % 2 === 0 ? 'white' : '#e9e9e9',
          alignItems: 'center'
        }}
        onPress={() => navigation.navigate('info', {id: i._id})}
      >
        <Text style={{flex: 1}}>{i.name}</Text>
        <Icon name={'chevron-right'} color={vars.primary}/>
      </TouchableOpacity>) : <Spinner/>}

  </Card>
);

const Consult = () => (
  <>
    <Card title="Техническая и консультационная поддержка">
      <Text>ПН-ВТ-СР-ЧТ-ПТ-СБ</Text>
      <Text style={{marginVertical: 10}}>09:00 - 19:00</Text>
      <Text>Моб.тел: +996(777)202865</Text>
      <Text style={{marginTop: 10}}>Email: catalogkg@gmail.com</Text>
    </Card>
    <Card title="Справочная служба">
      <Text>ПН-ВТ-СР-ЧТ-ПТ-СБ</Text>
      <Text style={{marginVertical: 10}}>Моб. телефон: +996(312)626662</Text>
      <Text>Email: admin@zakupki.gov.kg</Text>
    </Card>
  </>
);
