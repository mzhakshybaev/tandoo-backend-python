import React from 'react'
import {inject, observer} from 'mobx-react';
import Toolbar, {Title, ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import ScreenWrapper from "../../components/ScreenWrapper";
import {ListItem} from "react-native-elements";
import vars from "../../common/vars";

const list = [
  {name: 'Уведомления от администрации', route: 'adminNotifications', p: true},
  {name: 'Запросы / разъяснения', route: '', p:true},
  {name: 'Запросы на добавление продукции', route: 'addProductRequests'},
  {name: 'Новости', route: 'news', p: true},
];

const notifyLIst = [
  {name: 'По поданным объявлениям', route: 'submittedAnnouncements'},
  {name: 'Справки ГНС, СФ', route: 'references'},
  {name: 'По срокам истечения цен на продукцию', route: 'byDateExpiration'},
];

@inject("authStore", "autoNotificationsCtrl") @observer
export default class Notifications extends React.Component {

  render() {

    const {navigation, authStore} = this.props;
    let {isSupplier, isPurchaser, user} = authStore;

    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>Сообщения</ToolbarTitle>
      </Toolbar>
    );

    let asd = list;
    if (isPurchaser) {
      asd = asd.filter(a => a.p);
    }


    return (
      <ScreenWrapper header={Header}>
        {asd.map((l, i) => (
          <ListItem
            onPress={() => {
              if (l.route) {
                navigation.navigate(l.route)
              }
            }}
            key={i}
            title={l.name}
            bottomDivider
            chevron
          />
        ))}
        {isSupplier && <>
          <Title style={{marginTop: 10}}>Автоуведомления</Title>
          {notifyLIst.map((l, i) => (
            <ListItem
              onPress={() => {
                if (l.route) {
                  navigation.navigate(l.route)
                }
              }}
              key={i}
              title={l.name}
              badge={{value: 0, textStyle: {color: 'white'}, badgeStyle: {backgroundColor: vars.primary}}}
              bottomDivider
              chevron
            />
          ))}
        </>}

      </ScreenWrapper>
    )
  }
}
