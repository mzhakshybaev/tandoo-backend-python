import React from 'react';
import {inject, observer} from 'mobx-react';
import Toolbar, {ToolbarButton, ToolbarTitle} from "../components/Toolbar";
import Input, {InputMask} from "../components/Input";
import Button from "../components/Button";
import {showInfo} from "../../utils/messages";
import ScreenWrapper from "../components/ScreenWrapper";
import Card from "../components/Card";

@inject('authStore', 'mainStore') @observer
export default class Recovery extends React.Component {

  constructor(props) {
    super(props);
    this.state = {email: null, phoneNumber: null, smsCode: null, isCountingDown: false};
  }

  render() {
    const {authStore, mainStore} = this.props;

    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>Восстановление</ToolbarTitle>
      </Toolbar>
    );

    return (
      <ScreenWrapper header={Header}>
        <Card>
          <Input placeholder='Логин / Email' value={this.state.login} onChange={login => this.setState({login})}/>
          <InputMask placeholder='0 (777) 12 34 56' mask='0 (999) 99 99 99' keyboardType='numeric'
                     value={this.state.phone}
                     onChange={(val => this.setState({phone: val.replace(/[^0-9]/g, '')}))}/>
          <Button title={'Прислать СМС с кодом'}
                  disabled={!this.state.phone}
                  loading={mainStore.isBusy}
                  onPress={() => {
                    let params = {email: this.state.email, phone: this.state.phoneNumber};
                    authStore.sendSmsCode(params).then(r => {
                      showInfo('На Ваш мобильный телефон отправлено смс');
                      if (!this.state.isCountingDown)
                        this.setState({isCountingDown: true});
                    });
                  }}/>

          <Input placeholder='Код из СМС (OTP)' keyboardType='numeric'/>
          <Button title={'Подтвердить'}
                  loading={mainStore.isBusy}
                  disabled={!this.state.login || !this.state.password}
                  onPress={() => {
                    authStore.validateSmsCode(this.state.phoneNumber, this.state.smsCode).then(r => {
                      let userData = {
                        email: this.state.email,
                        phone: this.state.phoneNumber
                      };
                      authStore.setUser(userData);

                      if (r.result === 0)
                        this.props.history.push('/recovery/confirm')
                    });
                  }}/>
        </Card>
      </ScreenWrapper>
    )
  }
}
