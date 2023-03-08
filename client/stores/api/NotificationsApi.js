import * as request from '../../utils/requester';

export default new class NotificationsApi {

  // notifications from administration
  getNotifications() {
    return request.postAsync("admin_notification/listing", "docs");
  }

  getNotification(id) {
    return request.postAsync("admin_notification/get", "doc", {id})
  }
}
