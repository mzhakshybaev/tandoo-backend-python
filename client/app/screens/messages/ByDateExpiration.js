import React from "react";
import {translate} from "react-i18next";
import {inject, observer} from "mobx-react";
import Card from "../../components/Card";
import ItemView from "../../components/ItemView";
import {Text, TouchableOpacity} from "react-native";
import vars from "../../common/vars";
import ScreenWrapper from "../../components/ScreenWrapper";
import Toolbar, {ToolbarButton, ToolbarTitle} from "../../components/Toolbar";

@translate(['common', 'settings', ''])
@inject("autoNotificationsCtrl", "catalogStore", "supMyProductsCtrl") @observer
export default class ByDateExpiration extends React.Component {

  componentDidMount() {
    this.props.autoNotificationsCtrl.getNotifications({type: 'Products'});
  }

  handleView(notification) {
    this.handleStatus(notification.id);
    this.props.supMyProductsCtrl.getCompanyProduct(notification.data.product_id).then(r => {
      this.props.catalogStore.selectedProduct = r;
      if (this.props.catalogStore.selectedProduct) {
        this.props.navigation.navigate('supplier/products/add');
      }
    })
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
        <ToolbarTitle>{t('По срокам истечения цен на продукцию')}</ToolbarTitle>
      </Toolbar>
    );
    return (
      <ScreenWrapper header={Header} loading={!ready} noData={!autoNotifications || autoNotifications.length === 0}>
        {autoNotifications && autoNotifications.map((a, i) => <Card key={i}>
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
