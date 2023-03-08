import React from "react";
import {translate} from "react-i18next";
import {inject, observer} from "mobx-react";
import Toolbar, {ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import ScreenWrapper from "../../components/ScreenWrapper";
import Card from "../../components/Card";
import ItemView from "../../components/ItemView";
import {Text, TouchableOpacity} from "react-native";
import vars from "../../common/vars";

@translate(['common', 'settings', ''])
@inject("autoNotificationsCtrl") @observer
export default class References extends React.Component {

  componentDidMount() {
    this.props.autoNotificationsCtrl.getNotifications({type: 'CompanyDocs'});
  }

  handleView(notification) {
    this.handleStatus(notification.id);
    this.props.navigation.navigate('org');
  };

  handleStatus = (id) => {
    this.props.autoNotificationsCtrl.viewNotification({id: id});
  };

  render() {
    let {t} = this.props;
    let {autoNotifications, ready} = this.props.autoNotificationsCtrl;
    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>{t('Справки ГНС, СФ')}</ToolbarTitle>
      </Toolbar>
    );
    return (
      <ScreenWrapper header={Header} loading={!ready} noData={!autoNotifications || autoNotifications.length === 0}>
        {autoNotifications &&
        autoNotifications.map((a, i) => <Card key={i}>
          <ItemView label={t("Дата")} value={a.datetime}/>
          <ItemView label={t("Текст Сообщения")} value={<TouchableOpacity onPress={() => this.handleView(a)}>
            <Text style={{color: a.notification_status === 'active' ? vars.secondary : vars.red}}>
              {p.description}
            </Text>
          </TouchableOpacity>}/>
        </Card>)}
      </ScreenWrapper>
    )
  }
}
