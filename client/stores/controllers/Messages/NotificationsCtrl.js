import {action, observable, runInAction} from "mobx";
import notificationsApi from "../../api/NotificationsApi"
import moment from "moment";

export default new class NotificationsCtrl {
  @observable notifications = [];
  @observable ready = false;

  async load() {
    let notifications = await notificationsApi.getNotifications();
    // sort backwards
    notifications.sort((a, b) => moment(b._created).diff(moment(a._created)));

    runInAction(() => {
      this.notifications = notifications;
      this.ready = true;
    })
  }

  @action
  reset() {
    Object.assign(this, {
      notifications: [],
      showList: false,
      ready: false
    })
  }

  async getNotification(item) {
    this.ready = false;
    let notification = await notificationsApi.getNotification(item._id);

    this.ready = true;
    return notification;
  };
}
