import * as request from '../../utils/requester';

export default new class NewsApi {
  getAllNewsList = request.postAsync.bind(null, "new/mainlisting", "docs");
  getNewsList = request.postAsync.bind(null, "new/mainlisting", "docs", {active: true});
  getNews = _id => request.postAsync("new/get", "doc", {_id});
  saveNews = request.postAsync.bind(null, "new/put", null);
  switchActive = request.postAsync.bind(null, "new/activate", null);
  uploadNewsFile = request.postAsync.bind(null, "upload/news", "file");
}
