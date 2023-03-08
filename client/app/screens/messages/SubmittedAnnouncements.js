import React from "react";
import {translate} from "react-i18next";
import {inject, observer} from "mobx-react";
import Toolbar, {ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import ScreenWrapper from "../../components/ScreenWrapper";
import Card from "../../components/Card";
import ItemView from "../../components/ItemView";
import {Text, TouchableOpacity} from "react-native";
import vars from "../../common/vars";
import {formatDateTime} from "../../../utils/helpers";

@translate(['common', 'settings', ''])
@inject("autoNotificationsCtrl") @observer
export default class SubmittedAnnouncements extends React.Component {

  state = {};

  componentDidMount() {
    this.props.autoNotificationsCtrl.getNotifications({type: 'Announce'});
  }

  handleView(notification) {
    this.handleStatus(notification.id);
    if (notification.data && notification.data.announce_id) {
      this.props.navigation.navigate('announce/view', {id: notification.data.announce_id});
    } else {
      this.props.navigation.navigate('contracts/view', {id: notification.data.contract_id});
    }
  };

  handleStatus = (id) => {
    this.props.autoNotificationsCtrl.viewNotification({id: id});
  };

  render() {
    let {ready, autoNotifications} = this.props.autoNotificationsCtrl;
    let {t} = this.props;

    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>{t('По поданным объявлениям')}</ToolbarTitle>
      </Toolbar>
    );

    return (
      <ScreenWrapper header={Header} loading={!ready} noData={!autoNotifications || autoNotifications.length === 0}>
        {autoNotifications &&
        autoNotifications.map((a, i) => <Card key={i}>
          <ItemView label={t("Дата")} value={formatDateTime(a.datetime)}/>
          <ItemView label={t("№ Объявления")} value={<TouchableOpacity onPress={() => this.handleView(a)}>
            <Text style={{color: p.notification_status === 'active' ? vars.secondary : vars.red}}>
              {p.description}
            </Text>
          </TouchableOpacity>}/>
        </Card>)
        }
      </ScreenWrapper>
    )
  }
}
