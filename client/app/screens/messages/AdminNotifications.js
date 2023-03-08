import {inject, observer} from "mobx-react";
import React from "react";
import {formatDateTime} from "../../../utils/helpers";
import Toolbar, {ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import ScreenWrapper from "../../components/ScreenWrapper";
import Card from "../../components/Card";
import {Text} from "react-native";
import vars from "../../common/vars";

@inject("notificationsCtrl", 'supplierStore') @observer
export default class AdminNotifications extends React.Component {

  componentDidMount() {
    this.props.notificationsCtrl.load();
  }

  componentWillUnmount() {
    this.props.notificationsCtrl.reset();
  }

  render() {
    let {ready, notifications} = this.props.notificationsCtrl;

    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>Уведомления от администрации</ToolbarTitle>
      </Toolbar>
    );

    return (
      <ScreenWrapper header={Header} loading={!ready} noData={!notifications || notifications.length === 0}>
        {
          notifications && notifications.map(n =>
            <Card key={n._id} title={n.title}>
              <Text>{n.content}</Text>
              <Text style={{fontSize: 12, color: vars.muted}}>{formatDateTime(n._created)}</Text>
            </Card>
          )
        }
      </ScreenWrapper>
    )
  }
}

