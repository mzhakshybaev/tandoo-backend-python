import React from 'react';
import {View} from "react-native";
import {inject, observer} from 'mobx-react';
import vars from "../common/vars";
import Toolbar, {ToolbarButton, ToolbarTitle} from "../components/Toolbar";
import {Text} from 'react-native-elements'
import Input, {InputMask} from "../components/Input";
import Button from "../components/Button";
import TouchableItem from "../components/TouchableItem";

import {showInfo, showWarning} from "../../utils/messages";
import {isEmail} from "../../utils/helpers";
import Card from "../components/Card";
import ScreenWrapper from "../components/ScreenWrapper";
import {isDevMode} from "../../utils/common";

@inject('authStore', 'mainStore') @observer
export default class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      fullname: '',
      email: '',
      phone: '',
      otp: '',
      otpSent: false,
      login: '',
      password: ''
    };

    if (isDevMode()) {
      this.state.login = 'jakshybaev@mail.ru';
      this.state.password = '1212qwqw'
    }
  }

  render() {
    const {authStore, navigation, mainStore} = this.props;

    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>Авторизация</ToolbarTitle>
      </Toolbar>
    );

    return (
      <ScreenWrapper header={Header}>
        <Card title="Вход">
          <Input placeholder='Логин / Email' iconName={'user'} iconType='simple-line-icon'
                 value={this.state.login}
                 onChange={login => this.setState({login})}/>
          <Input placeholder='Пароль' secureTextEntry iconName={'lock'} iconType='simple-line-icon'
                 value={this.state.password}
                 onChange={password => this.setState({password})}/>
          <Button title={'Войти'}
                  loading={mainStore.isBusy}
                  disabled={!this.state.login || !this.state.password}
                  onPress={() => {
                    authStore.login(this.state.login, this.state.password).then(r => {
                      navigation.goBack();
                    });
                  }}/>
          <TouchableItem style={{padding: 5, marginTop: 10}} disabled={mainStore.isBusy}
                         onPress={() => navigation.navigate('recovery')}>
            <Text style={{textAlign: 'right', color: mainStore.isBusy ? vars.muted : vars.primary}}>
              Забыли пароль?
            </Text>
          </TouchableItem>
        </Card>

        <Card title="Регистрация">
          <Input placeholder='Фамилия Имя Отчество'
                 onChange={v => this.setState({fullname: v})}
                 value={this.state.fullname}
                 onBlur={() => {
                   if (this.state.fullname) {
                     this.props.authStore.checkData({fullname: this.state.fullname, command: 'register'})
                   }
                 }}
          />
          <Input placeholder='email/логин'
                 keyboardType={'email-address'}
                 value={this.state.email}
                 onChange={v => this.setState({email: v})}
                 onBlur={() => {
                   if (!isEmail(this.state.email)) {
                     showWarning('Неправильный адрес электронной почты');
                   }
                 }}
          />
          <InputMask placeholder='0 (777) 12 34 56' mask='0 (999) 99 99 99' keyboardType='numeric'
                     value={this.state.phone}
                     onChange={(val => this.setState({phone: val.replace(/[^0-9]/g, '')}))}
                     onBlur={() => {
                       if (this.state.phone && this.state.phone.length === 10) {
                         authStore.checkData({phone: this.state.phone, command: 'register'});
                       } else {
                         showWarning('Неправильный номер телефона');
                       }
                     }}
          />
          <Button title={'Прислать СМС с кодом'}
                  loading={mainStore.isBusy}
                  disabled={!this.state.phone || this.state.phone.length !== 10}
                  onPress={this.sendOTP}/>
          {this.state.otpSent &&
          <View>
            <Input placeholder='Код из СМС (OTP)'
                   keyboardType='numeric'
                   value={this.state.otp}
                   onChange={v => this.setState({otp: v})}/>
            <Button title={'Подтвердить'}
                    loading={mainStore.isBusy}
                    disabled={!this.state.otp || this.state.otp.length < 4}
                    onPress={this.checkOTP}/>
          </View>
          }
        </Card>
      </ScreenWrapper>
    )
  }

  sendOTP = () => {
    let params = {
      email: this.state.email,
      fullname: this.state.fullname,
      phone: this.state.phone,
      command: 'register'
    };
    this.props.authStore.sendSmsCode(params).then(r => {
      showInfo('На Ваш мобильный телефон отправлено смс');
      this.setState({otpSent: true});

    });
  };

  checkOTP = () => {
    this.props.authStore.validateSmsCode(this.state.phone, this.state.otp).then(r => {
      let userData = {
        email: this.state.email,
        phone: this.state.phone,
        otp: this.state.otp,
        fullname: this.state.fullname,
        command: 'register',
        data: {}
      };
      this.props.authStore.setUser(userData);
      this.props.navigation.navigate('supplierPassword');
    });
  }
}
