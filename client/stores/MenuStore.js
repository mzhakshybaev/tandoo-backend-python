import {observable, runInAction} from "mobx";
import * as request from "../utils/requester";

export default new class MenuStore {
  @observable items = [];
  @observable isReady = false;

  async load() {
    let r;
    try {
      r = await request.post('menu/listing');
    } catch (e) {}

    runInAction(() => {
      if (r && r.docs) {
        let items = r.docs;
        this.items = items.sort((a, b) => a.order - b.order);
      }

      this.isReady = true;
    });
  }
}
