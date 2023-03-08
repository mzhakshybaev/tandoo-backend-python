import * as request from '../../utils/requester';

export default new class DirdocApi {
  getDirdocs = request.postAsync.bind(null, "dirdocs/listing", "docs");
  getDirdoc = params => request.postAsync("dirdocs/get", "doc", {params});
  updateDirdoc = request.postAsync.bind(null, "dirdocs/update", null);
  saveDirdoc = request.postAsync.bind(null, "dirdocs/save", null);
}
