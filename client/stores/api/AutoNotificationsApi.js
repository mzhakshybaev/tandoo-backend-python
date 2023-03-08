import * as request from '../../utils/requester';

export default new class AutoNotificationsApi {

  // auto notifications
  getNotifications(params) {
    return request.postAsync("notificationcompany/listing", "", params);
  }
  viewNotification(params) {
    return request.postAsync("notificationcompany/read", "", params);
  }
  getCount() {
    return request.getAsync("notificationcompany/get_count", "");
  }

}
