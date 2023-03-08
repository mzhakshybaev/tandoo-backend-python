import {observable, action, runInAction} from 'mobx';
import {consignmentApi, contractsApi} from '../api';
import authStore from "../../stores/AuthStore";
import {NDS_VALUE} from "../../utils/common";

export default new class ConsignmentViewCtrl {
  @observable ready = false;
  @observable isOwner = false;
  @observable isVendor = false;
  @observable countAll;
  @observable totalAll;
  @observable nds;
  @observable NDS_VALUE;

  async load(id) {
    this.ready = false;
    let con = await consignmentApi.get(id);
    let contract = await contractsApi.getContract(con.contract_id);

    let isOwner = contract.pur_company._id === authStore.company._id;
    let isVendor = contract.sup_company._id === authStore.company._id;

    let countAll = 0;
    let totalAll = 0;

    con.lots.forEach(lot => {
      lot.total = lot.quantity * lot.data.unit_price;

      countAll += lot.quantity;
      totalAll += lot.total;
    });

    let nds = totalAll * NDS_VALUE / 100;

    runInAction(() => {
      Object.assign(this, {
        consignment: con,
        contract,
        isOwner,
        isVendor,
        countAll,
        totalAll,
        nds,
        NDS_VALUE,
        ready: true,
      })
    })
  }

  @action
  reset() {
    Object.assign(this, {
      consignment: null,
      contract: null,
      isOwner: null,
      isVendor: null,
      countAll: null,
      totalAll: null,
      nds: null,
      NDS_VALUE: null,
      ready: false,
    })
  }

  async finish(id) {
    await consignmentApi.finish(id);
  }
}
