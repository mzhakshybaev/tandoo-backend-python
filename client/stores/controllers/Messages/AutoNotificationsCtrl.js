import {action, observable} from "mobx";
import autoNotificationsApi from "../../api/AutoNotificationsApi"

export default new class AutoNotificationsCtrl {
  @observable autoNotifications = [];
  @observable ready = false;
  @observable count = 0;
  @observable company_docs_count = 0;
  @observable announce_count = 0;
  @observable product_count = 0;

  // async load() {
  //   let autoNotifications = await autoNotificationsApi.getNotifications({type:'Products'});
  //   // sort backwards
  //   autoNotifications.sort((a, b) => moment(b._created).diff(moment(a._created)));
  //
  //   runInAction(() => {
  //     this.notifications = autoNotifications;
  //     this.ready = true;
  //   })
  // }

  @action
  reset() {
    Object.assign(this, {
      autoNotifications: [],
      showList: false,
      ready: false
    })
  }


  async getNotifications(params) {
    this.ready = false;
    let autoNots = await autoNotificationsApi.getNotifications(params);

    if (autoNots) {
      this.autoNotifications = autoNots.notifications;
      this.ready = true;
    }
  };

  async viewNotification(params) {
    this.ready = false;
    let r = await autoNotificationsApi.viewNotification(params);

    if (r) {
      this.ready = true;
    }
    return r;
  };

  @action
  async getCount() {
    let r = await autoNotificationsApi.getCount();
    if (r) {
      this.announce_count = r.announce_count,
      this.company_docs_count = r.company_docs_count,
      this.product_count = r.product_count,
      this.count = r.count
    }
    return r;
  };
}
