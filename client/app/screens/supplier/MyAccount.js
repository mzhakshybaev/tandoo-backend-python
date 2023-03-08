import React from 'react'
import {inject, observer} from 'mobx-react';
import Toolbar, {ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import Input, {InputMask} from "../../components/Input";
import CheckBox from "../../components/CheckBox";
import {DEFAULT_AVA, IMAGES_URL} from "../../../utils/common";
import Button from "../../components/Button";
import ScreenWrapper from "../../components/ScreenWrapper";
import Card from "../../components/Card";

@inject('authStore', "mainStore") @observer
export default class MyAccount extends React.Component {
  constructor(...args) {
    super(...args);
    let {user} = this.props.authStore;

    this.state = {
      fullname: user.fullname,
      inn: user.inn,
      email: user.email,
      phone: user.phone,

      showPasswordChange: false,
      password: '',
      newPassword: '',
      repeatNewPassword: '',

      avatarPreview: user.data.avatar_img ? (IMAGES_URL + user.data.avatar_img) : DEFAULT_AVA,
      avatarFile: null,
    };
  }

  render() {
    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>Мой аккаунт</ToolbarTitle>
      </Toolbar>
    );

    return (
      <ScreenWrapper header={Header}>
        <Card>
          <Input label='ФИО' value={this.state.fullname} onChange={v => this.setState({fullname: v})} disabled/>
          <Input label='Логин / Email' value={this.state.email} onChange={v => this.setState({email: v})} disabled/>
          <InputMask placeholder='0 (777) 12 34 56' mask='0 (999) 99 99 99' keyboardType='numeric'
                     value={this.state.phone} disabled label={'Моб. телефон'}
                     onChange={(val => this.setState({phone: val.replace(/[^0-9]/g, '')}))}
          />
        </Card>

        <CheckBox checked={this.state.passwordChange}
                  title={'изменить пароль'}
                  onChange={v => this.setState({passwordChange: !this.state.passwordChange})}/>

        {this.state.passwordChange &&
        <Card>
          <Input placeholder='******' secureTextEntry label={'Текущий пароль'}
                 value={this.state.password} onChange={(v) => this.setState({password: v})}/>
          <Input placeholder='******' secureTextEntry label={'Новый пароль'}
                 value={this.state.newPassword} onChange={(v) => this.setState({newPassword: v})}/>
          <Input placeholder='******' secureTextEntry label={'Повторите новый пароль'}
                 value={this.state.repeatNewPassword} onChange={(v) => this.setState({repeatNewPassword: v})}/>

          <Button title={'Сохранить'}
                  disabled={!this.validate()}
                  onPress={() => {

                  }}/>
        </Card>
        }

      </ScreenWrapper>
    )
  }

  validate() {
    if (!this.state.password) return false;

    // TODO fullname, inn, email, phone

    if (this.state.showPasswordChange) {
      if (!this.state.newPassword || !this.state.repeatNewPassword) return false;
      if (this.state.newPassword !== this.state.repeatNewPassword) return false;
    }

    return true;
  }
}







