import * as request from '../../utils/requester';

export default new class AnnounceApi {
  list(params) {
    return request.postAsync('announce/getAll', null, params);
  }

  get(params) {
    return request.postAsync('announce/get', 'doc', params);
  }

  myList(params) {
    return request.postAsync('announce/listing', 'docs', params);
  }

  // save(params) {
  //   return request.postAsync('announce/save', 'id', params)
  // }

  create(params) {
    return request.postAsync('announce/create', 'id', params);
  }

  update_deadline(params) {
    return request.postAsync('announce/update_deadline', null, params);
  }

  update_draft(params) {
    return request.postAsync('announce/update_draft', null, params);
  }

  update_lots(params) {
    return request.postAsync('announce/update_lots', null, params);
  }

  publish(params) {
    return request.postAsync('announce/publish', null, params);
  }

  update(params) {
    return request.post('announce/update', params);
  }

  updateLot(params) {
    return request.post('announce/update_lot', params);
  }

  updateApps(params) {
    return request.post('announce/update_apps', params);
  }
}();
