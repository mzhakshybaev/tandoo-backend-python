import React from "react";
import {inject, observer} from "mobx-react"
import TabView from "components/TabView";

import OperatorNews from "../operator/messages/News";
import OperatorRequests from "../operator/messages/ProductRequests";
import OperatorAdminNotifications from "../operator/messages/AdminNotifications";
import OperatorClarifications from "../operator/messages/RequestsClarifications";

import NewsList from "../../views/news/List";
import AdminNotifications from "./AdminNotifications";
import Clarifications from "./RequestsClarifications";
import ProductRequest from "../supplier/messages/ProductRequests";
import SubmittedAnnouncements from "../operator/messages/AutoNotifications/SubmittedAnnouncements";
import References from "../operator/messages/AutoNotifications/References";
import ByDateExpiration from "../operator/messages/AutoNotifications/ByDateExpiration";
import {translate} from "react-i18next";

@inject("authStore", "autoNotificationsCtrl") @translate(['common', 'settings', '']) @observer
export default class Messages extends React.Component {

  constructor(props) {
    super(props);
    this.titles = [
      {key: 'default', name: "Уведомления от администрации"},
      {key: 'default', name: "Запросы / разъяснения"},
      {key: 'default', name: "Запросы на добавление продукции"},
      {key: 'default', name: "Новости"},
      {key: 'autoNot', count: 0, type: 'Announce', name: "По поданным объявлениям"},
      {key: 'autoNot', count: 0, type: 'CompanyDocs', name: "Справки ГНС, СФ"},
      {key: 'autoNot', count: 0, type: 'Products', name: "По срокам истечения цен на продукцию"},
    ];

    this.supplierTabs = [
      {title: this.titles[0], component: AdminNotifications},
      {title: this.titles[1], component: Clarifications},
      {title: this.titles[2], component: ProductRequest},
      {title: this.titles[3], component: NewsList},
      {title: this.titles[4], component: SubmittedAnnouncements},
      {title: this.titles[5], component: References},
      {title: this.titles[6], component: ByDateExpiration},
    ];

    this.purchaserTabs = this.supplierTabs.slice();
    this.purchaserTabs.splice(2, 1);
    this.purchaserTabs.splice(3, 4);

    this.operatorTabs = [
      {title: this.titles[0], component: OperatorAdminNotifications},
      {title: this.titles[1], component: OperatorClarifications},
      {title: this.titles[2], component: OperatorRequests},
      {title: this.titles[3], component: OperatorNews},
    ];
  }

  componentDidMount() {
    this.props.autoNotificationsCtrl.getCount();
  }

  render() {
    let {company_docs_count, product_count, announce_count} = this.props.autoNotificationsCtrl;
    this.titles[4].count = announce_count;
    this.titles[5].count = company_docs_count;
    this.titles[6].count = product_count;
    let props = {lazyRender: true};
    let {isSupplier, isPurchaser, user} = this.props.authStore;

    if (isPurchaser)
      props.tabs = this.purchaserTabs;
    else if (isSupplier)
      props.tabs = this.supplierTabs;

    // operator
    else if (user && user.role === 1)
      props.tabs = this.operatorTabs;

    return <TabView {...props}/>;
  }
}
