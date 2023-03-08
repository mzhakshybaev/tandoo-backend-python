import React from "react";
import {convertFromRaw, convertToRaw, EditorState} from "draft-js";
import {uploadImages} from "components/Editor"

import NotificationsTable from "./NotificationsTable";
import NotificationBuilder from "./NotificationBuilder";
import {inject} from "mobx-react";
import NotificationView from "components/NotificationView";
import {IMAGES_URL} from "utils/common";
import {formatDateTime} from "utils/helpers";
import {showError, showSuccess} from "utils/messages";

@inject("adminStore", "supplierStore")
export default class Index extends React.Component {

  state = {
    isListVisible: true,
    isViewingNotification: false,
    notifications: [],
    recipients: [{_id: "all", name: "Все"}],
    ...this.getDefState(),
  };

  componentDidMount() {
    this.load();
  }

  async load() {
    let roles = await this.props.adminStore.getCompanyRoles();
    roles.forEach(r => r.name = r.name + "и");
    this.setState({recipients: this.state.recipients.concat(roles)}, this.getNotifications);
  }

  reset(extra) {
    this.setState({...this.getDefState(), ...extra})
  }

  // Default state of notification
  getDefState() {
    return {title: null, editorState: EditorState.createEmpty(), recipient: null};
  }

  getNotifications() {
    this.props.supplierStore.getNotifications()
      .then(notifications => {
        let {recipients} = this.state;
        notifications.forEach(n => {
          let r = recipients.find(r => r._id === n.role_id);
          n.recipient = r ? r.name : "Все";
          n._created = formatDateTime(n._created);
        });
        this.setState({notifications})
      });
  }

  valid = () => {
    let {state: s} = this;
    return s.title && s.recipient;
  };

  onCreateClick = () => {
    this.setState({isListVisible: false});
  };

  onSendClick = () => {
    if (!this.valid()) {
      showError("Заполните все поля");
      return;
    }
    let {title, editorState, recipient} = this.state;
    const uploader = this.props.adminStore.uploadNotificationImage;
    let content = convertToRaw(editorState.getCurrentContent());
    let {entityMap} = content;
    uploadImages(entityMap, uploader)
      .then(fileNames => {
        Object.keys(entityMap).forEach((key, i) => {
          entityMap[key].data.src = IMAGES_URL + fileNames[i];
        });
        let data = {title, content, role_id: recipient};
        this.props.adminStore.saveNotification(data)
          .then(_ => {
            showSuccess("Уведомление отправлено");
            this.reset({isListVisible: true});
            this.getNotifications();
          }, _ => {
            showError("Ошибка");
            this.reset({isListVisible: true});
          });
      })
      .catch(() => showError("Ошибка"))
  };

  onNotificationClick = async ({_id}) => {
    let notification = await this.props.supplierStore.getNotification({id: _id});
    notification.editorState = EditorState.createWithContent(convertFromRaw(notification.content));
    notification._created = formatDateTime(notification._created);
    delete notification.content;
    this.setState({item: notification, isViewingNotification: true});
  };

  onBackClick = () => this.setState({item: null, isViewingNotification: false});

  render() {
    let s = this.state;
    if (s.isViewingNotification)
      return <NotificationView
        {...s.item}
        onBackClick={this.onBackClick}/>;

    return <div className={"animated fadeIn"}>
      {s.isListVisible &&
      <NotificationsTable
        data={this.state.notifications}
        onCreateClick={this.onCreateClick}
        onNotificationClick={this.onNotificationClick}/>
      }

      {!s.isListVisible &&
      <NotificationBuilder
        title={s.title}
        editorState={s.editorState}
        recipients={s.recipients}
        onChange={editorState => this.setState({editorState})}
        onTitleChange={e => this.setState({title: e.target.value})}
        onRecipientChange={recipient => this.setState({recipient})}
        onSendClick={this.onSendClick}
        onBackClick={() => this.reset({isListVisible: true})}/>
      }
    </div>
  }
}
