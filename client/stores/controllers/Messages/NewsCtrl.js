import {runInAction, observable} from "mobx";
import newsApi from "../../api/NewsApi"

export default new class NewsCtrl {
  @observable news = [];
  @observable ready = false;

  async load() {
    let news = await newsApi.getNewsList();

    runInAction(() => {
      this.news = news;
      this.ready = true;
    });
  }

  reset() {
    Object.assign(this, {news: [], ready: false})
  }
}
