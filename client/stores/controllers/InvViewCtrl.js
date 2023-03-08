import {observable, action, runInAction} from 'mobx';
import invoiceApi from '../api/InvoiceApi';
import contractsApi from '../api/ContractsApi';
import authStore from "../../stores/AuthStore";
import {NDS_VALUE} from "../../utils/common";

export default new class InvoiceViewCtrl {
  @observable ready = false;
  @observable isOwner = false;
  @observable isVendor = false;

  async load(id) {
    this.ready = false;
    let inv = await invoiceApi.get(id);
    let contract = await contractsApi.getContract(inv.contract_id);

    let isOwner = contract.pur_company._id === authStore.company._id;
    let isVendor = contract.sup_company._id === authStore.company._id;

    let nds = inv.amount * NDS_VALUE / 100;
    let amount_free = inv.amount - nds;

    runInAction(() => {
      Object.assign(this, {
        invoice: inv,
        contract,
        isOwner,
        isVendor,
        nds,
        amount_free,
        NDS_VALUE,
        ready: true,
      })
    })
  }

  @action
  reset() {
    Object.assign(this, {
      invoice: null,
      contract: null,
      isOwner: null,
      isVendor: null,
      nds: null,
      amount_free: null,
      NDS_VALUE: null,
      ready: false,
    })
  }

  async finish(id) {
    await invoiceApi.finish(id);
  }
}
