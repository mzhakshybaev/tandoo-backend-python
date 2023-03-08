import React, {Fragment} from "react";
import AppTable from "components/AppTable";
import {translate} from "react-i18next";
import {inject, observer} from "mobx-react";
import {formatDateTime} from "utils/helpers";
import {withRouter} from "react-router-dom";

@translate(['common', 'settings', ''])
@inject("autoNotificationsCtrl") @withRouter @observer
export default class OrgUpdateInformations extends React.Component {

  state = {}

  componentDidMount() {
    this.props.autoNotificationsCtrl.getNotifications({type: 'OrgUpdate'});
  }
  handleView(notification) {
    this.handleStatus(notification.id)
    this.props.history.push('/org');
  };

  handleStatus = (id) => {
    this.props.autoNotificationsCtrl.viewNotification({id: id});
  }

  render() {
    let {t} = this.props;
    let {autoNotifications, ready} = this.props.autoNotificationsCtrl;
    const tableHeaders = [
      {
        Header: "Дата", accessor: "datetime", width: 200,
        Cell: ({value}) => formatDateTime(value)
      },
      {
        Header: "Текст Сообщения",
        Cell: (row) => (
          <div onClick={() => this.handleView(row.original)} title={row.original.title}
               className={row.original.notification_status === 'active' ? "notification-status-active" : "notification-status-read"}>
            {t(row.original.description)}
          </div>
        )
      }
    ]
    return (
      <Fragment>
        <h5>{t('По обновлению сведений об Организации')}</h5>
        <AppTable data={autoNotifications}
          columns={tableHeaders}
                  showRowNumbers={true}
        />
      </Fragment>
    )
  }
}
