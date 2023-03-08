import {action, observable, runInAction} from 'mobx';
import authStore from '../AuthStore';
import contractsApi from '../api/ContractsApi'
import announceApi from '../api/AnnounceApi';

export default new class PurAnnContractsListCtrl {
  @observable ready;
  @observable contracts;
  @observable isOwner;

  async load(announce_id) {
    this.ready = false;

    let isPurchaser = authStore.isPurchaser;
    let announce = await announceApi.get({id: announce_id});
    let isOwner = false;

    if (isPurchaser) {
      isOwner = announce.company_id === authStore.company._id;
    }

    // let company_id = authStore.company._id;
    let contracts = await contractsApi.getContracts({
      // company_id,
      announce_id,
      // announce_id: '90fb3bd5-c0b7-47e4-8e00-f35099e2a5ee'
    });

    runInAction(() => {
      this.contracts = contracts;
      this.announce = announce;
      this.isOwner = isOwner;
      this.ready = true;
    })
  }

  @action
  reset() {
    this.announce = null;
    this.contracts = null;
    this.isOwner = false;
    this.ready = false;
  }
}
