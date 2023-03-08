import React from 'react';
import {inject, observer} from 'mobx-react';
import vars from "../../common/vars";
import Toolbar, {ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import {Card, Text} from 'react-native-elements'
import Input from "../../components/Input";
import Button from "../../components/Button";
import {NavigationActions, StackActions} from 'react-navigation';
import ScreenWrapper from "../../components/ScreenWrapper";

@inject('authStore', 'mainStore') @observer
export default class SupplierPassword extends React.Component {

  constructor(props) {
    super(props);
    this.state = {password: '', confirmPassword: ''};
  }

  render() {
    const {authStore, navigation, mainStore} = this.props;
    let enabled = this.state.password && this.state.password.length > 5 && this.state.password === this.state.confirmPassword;

    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>Авторизация</ToolbarTitle>
      </Toolbar>
    );
    return (
      <ScreenWrapper header={Header}>
        <Card title="Для завершения регистрации введите пароль">
          <Text style={{color: vars.muted, fontSize: 12}}>
            Пароль должен состоять из не меньше 6 символов (букв, цифр)
          </Text>
          <Input placeholder='Пароль' onChange={password => this.setState({password})} secureTextEntry={true}/>
          <Input placeholder='Подтвердите пароль' onChange={confirmPassword => this.setState({confirmPassword})}
                 secureTextEntry={true}/>
          <Button title={'Зарегистрировать'}
                  loading={mainStore.isBusy}
                  disabled={!enabled}
                  onPress={() => {
                    authStore.checkData({password: this.state.password, command: 'register'})
                      .then(r => {
                          authStore.register(this.state).then(r => {
                            navigation.dispatch(StackActions.reset({
                              index: 0,
                              actions: [NavigationActions.navigate({routeName: 'drawer'})]
                            }))
                          });
                        }
                      );
                  }}/>
        </Card>
      </ScreenWrapper>
    )
  }
}
