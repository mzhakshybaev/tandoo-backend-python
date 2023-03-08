import React, {Fragment} from "react";
import AppTable from "components/AppTable";
import {translate} from "react-i18next";
import {Link, withRouter} from "react-router-dom";
import {inject, observer} from "mobx-react";
import {formatDateTime} from "../../../../../../utils/helpers";
import Loading from "../../../../components/Loading";

@translate(['common', 'settings', ''])
@inject("autoNotificationsCtrl", "catalogStore", "supMyProductsCtrl") @withRouter @observer
export default class ByDateExpiration extends React.Component {

  state = {}

  componentDidMount() {
    this.props.autoNotificationsCtrl.getNotifications({type: 'Products'});
  }

  handleView(notification) {
    this.handleStatus(notification.id)
    this.props.supMyProductsCtrl.getCompanyProduct(notification.data.product_id).then(r => {
      this.props.catalogStore.selectedProduct = r;
      if (this.props.catalogStore.selectedProduct) {
        this.props.history.push('/supplier/products/add');
      }
    })
  };

  handleStatus = (id) => {
    this.props.autoNotificationsCtrl.viewNotification({id:id});
  }

  render() {
    let {t} = this.props;
    let {autoNotifications, ready} = this.props.autoNotificationsCtrl;
    const tableHeaders = [
      {
        Header: t("Дата"), accessor: "datetime", width: 200,
        Cell: ({value}) => formatDateTime(value)
      },
      {
        Header: t("Текст Сообщения"),
        Cell: (row) => (
          <div onClick={() => this.handleView(row.original)} title={row.original.title}
              className={row.original.notification_status==='active' ? "notification-status-active":"notification-status-read"}>
            {t(row.original.description)}
          </div>
        )
      }
    ]
    if (!ready) return <Loading/>;
    return (
      <Fragment>
        <h5>{t('По срокам истечения цен на продукцию')}</h5>
        <AppTable data={autoNotifications}
                  columns={tableHeaders}
                  showRowNumbers={true}
        />
      </Fragment>
    )
  }
}
