import React from 'react';
import {View} from "react-native";
import {inject, observer} from 'mobx-react';
import Toolbar, {ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import {Card, Text} from 'react-native-elements'
import Input, {InputMask} from "../../components/Input";
import Button from "../../components/Button";
import {showInfo} from '../../../utils/messages';
import ScreenWrapper from "../../components/ScreenWrapper";

@inject('authStore', 'mainStore') @observer
export default class Registration extends React.Component {

  constructor(props) {
    super(props);
    this.state = {fullname: '', email: '', phoneNumber: '', smsCode: '', smsSent: true};
  }

  render() {
    const {authStore, navigation, mainStore} = this.props;

    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>{'Регистрация'}</ToolbarTitle>
      </Toolbar>
    );

    return (
      <ScreenWrapper header={Header}>
        <Card title="Поставщик">
          <Input label='Фамилия Имя Отчество' placeholder='Иванов Иван Иванович'
                 onChange={(fullname) => this.setState({fullname})}
                 value={this.state.fullname}
                 onBlur={() => {
                   if (this.state.fullname) {
                     this.props.authStore.checkData({fullname: this.state.fullname, command: 'register'})
                   }
                 }}
          />
          <Input label='Электронную почту' placeholder={'asan@example.com'} keyboardType='email-address'
                 value={this.state.email} onChange={email => this.setState({email})}/>

          <InputMask label='Номер телефона' mask="(999) 99 99 99"
                     placeholder={'(777) 12 34 56'}
                     keyboardType='phone-pad'
                     value={this.state.phoneNumber}
                     onChange={phoneNumber => {
                       this.setState({phoneNumber})
                     }}
          />

          <Button title={'Прислать СМС с кодом'}
                  disabled={this.state.fullname.length === 0 || this.state.email.length === 0 || this.state.phoneNumber.length === 0}
                  loading={mainStore.isBusy}
                  onPress={() => {
                    let params = {
                      email: this.state.email,
                      phone: this.state.phoneNumber.replace('+', '').replace('(', '').replace(')', '').replace(/ /g, ''),
                      command: 'register'
                    };
                    authStore.sendSmsCode(params).then(r => {
                      showInfo('На Ваш мобильный телефон отправлено смс');
                      this.setState({smsSent: true});
                    });
                  }}/>
        </Card>

        {this.state.smsSent &&
        <Card title="Подтверждение">

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Input label='Код из СМС (OTP)' placeholder={'12345'} keyboardType='numeric' maxLength={6}
                   value={this.state.smsCode}
                   onChange={smsCode => this.setState({smsCode})}/>
            <Button title={'Отправить'}
                    containerStyle={{marginTop: 15}}
                    loading={mainStore.isBusy}
                    disabled={!this.state.smsCode || this.state.smsCode.length < 4}
                    onPress={() => {
                      authStore.validateSmsCode(this.state.phoneNumber, this.state.smsCode).then(r => {
                        let userData = {
                          email: this.state.email,
                          phone: this.state.phoneNumber,
                          fullname: this.state.fullname,
                          command: 'register'
                        };
                        authStore.setUser(userData);
                        navigation.push('supplier_password');
                      });
                    }}/>
          </View>

        </Card>
        }
      </ScreenWrapper>
    )
  }


}

