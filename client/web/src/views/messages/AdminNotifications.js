import React, {Fragment} from "react";
import {Card} from "reactstrap";
import {inject, observer} from "mobx-react";
import NotificationView from "components/NotificationView";
import {formatDateTime} from "utils/helpers";
import Loading from "components/Loading";
import {convertFromRaw, EditorState} from "draft-js";
import {translate} from "react-i18next";

const NotificationsList = translate(['common', 'settings', ''])(props => {
  const {notifications, onClick, t} = props;

  return (
    <Fragment>
      <h5>{t('Уведомления от администрации')}</h5>

      {notifications.map(n =>
        <NotificationItem key={n._id}
                          title={n.title}
                          content={n.content}
                          createdDate={formatDateTime(n._created)}
                          onClick={() => onClick(n)}/>
      )}
    </Fragment>
  )
});

const NotificationItem = ({id, title, content, createdDate, onClick}) => {
  return (
    <div onClick={onClick}>
      <Card body className={"listItem"}>
        <div className={"d-flex justify-content-between"}>
          <h5>{title}</h5>
          <h6>{createdDate}</h6>
        </div>
        <p className={"textEllipsis"}>{content}</p>
      </Card>
    </div>
  )
};


@inject("notificationsCtrl", 'supplierStore') @observer
export default class AdminNotifications extends React.Component {
  state = {
    showList: true
  };

  componentDidMount() {
    this.props.notificationsCtrl.load();
  }

  componentWillUnmount() {
    this.props.notificationsCtrl.reset();
  }

  handleClick = async item => {
    this.setState({ready: false});

    item = await this.props.notificationsCtrl.getNotification(item);

    item._created = formatDateTime(item._created);
    item.editorState = EditorState.createWithContent(convertFromRaw(item.content));
    delete item.content;

    this.setState({showList: false, item});
  };

  handleClickBack = () => {
    this.setState({showList: true, item: null});
  };

  render() {
    let {ready, notifications} = this.props.notificationsCtrl;
    let {item} = this.state;

    if (!ready) return <Loading/>;

    return (
      <div className="animated fadeIn">
        {this.state.showList ?
          <NotificationsList
            notifications={notifications}
            onClick={this.handleClick}/>

          :

          <NotificationView
            {...item}
            onBackClick={this.handleClickBack}/>
        }
      </div>
    )
  }
}
