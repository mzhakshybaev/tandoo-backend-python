import React, {Fragment} from "react";
import AppTable from "components/AppTable";
import {translate} from "react-i18next";
import {inject, observer} from "mobx-react";
import Loading from "../../../../components/Loading";
import {Link, withRouter} from "react-router-dom";
import {formatDateTime} from "utils/helpers";

@translate(['common', 'settings', ''])
@inject("autoNotificationsCtrl") @withRouter @observer
export default class SubmittedAnnouncements extends React.Component {

  state = {};

  componentDidMount() {
    this.props.autoNotificationsCtrl.getNotifications({type: 'Announce'});
  }

  handleView(notification) {
    this.handleStatus(notification.id);
    if (notification.data && notification.data.announce_id) {
      this.props.history.push('/announce/view/' + notification.data.announce_id);
    } else {
      this.props.history.push('/contracts/view/' + notification.data.contract_id);
    }
  };

  handleStatus = (id) => {
    this.props.autoNotificationsCtrl.viewNotification({id: id});
  };

  render() {
    let {ready, autoNotifications} = this.props.autoNotificationsCtrl;
    let {t} = this.props;
    const tableHeaders = [
      {
        Header: t("Дата"), accessor: "datetime", width: 200,
        Cell: ({value}) => formatDateTime(value)
      },
      {
        Header: t("№ Объявления"), accessor: "title", width: 200
      },
      {
        Header: t("Текст Сообщения"),
        Cell: (row) => (
          <div onClick={() => this.handleView(row.original)} title={row.original.title}
               className={row.original.notification_status === 'active' ? "notification-status-active" : "notification-status-read"}>
            {t(row.original.description)}
          </div>
        )
      }
    ];

    if (!ready) return <Loading/>;
    return (
      <Fragment>
        <h5>{t('По поданным объявлениям')}</h5>
        <AppTable data={autoNotifications}
                  columns={tableHeaders}
                  showRowNumbers={true}
        />
      </Fragment>
    )
  }
}
