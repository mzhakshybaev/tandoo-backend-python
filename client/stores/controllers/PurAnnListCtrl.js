import {action, observable, runInAction} from "mobx";
import announceApi from '../api/AnnounceApi';

export default new class PurAnnListCtrl {
  @observable ready = false;
  @observable announces;

  async load(status) {
    runInAction(() => {
      this.ready = false;
      this.announces = null;
    });

    let params = {
      with_related: true,
      filter: {}
    };

    if (status !== undefined && status !== 'All') {
      params.filter.status = status;
    }

    let announces = await announceApi.myList(params);

    runInAction(() => {
      this.announces = announces;
      this.ready = true;
    })
  }

  @action
  reset() {
    this.ready = false;
    this.announces = null;
  }
}
