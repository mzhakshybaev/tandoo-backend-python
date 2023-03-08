import {action, computed, observable, runInAction} from 'mobx';
import contractsApi from "../api/ContractsApi"
import announceApi from "../api/AnnounceApi"
import consApi from "../api/ConsignmentApi"
import invApi from "../api/InvoiceApi"

import moment from "moment";
import authStore from "../AuthStore";

export default new class ContractViewCtrl {
  @observable ready = false;
  @observable contract;
  @observable consignments;
  @observable invoices;
  @observable isOwner = false;
  @observable isVendor = false;

  OTP_INIT = 0;
  OTP_SENDING = 1;
  OTP_SENT = 2;

  @observable otpStatus = this.OTP_INIT;
  @observable otpCode = '';


  async load(id) {
    this.ready = false;

    let contract = await contractsApi.getContract(id);
    // load announce, it has more info
    let announce = await announceApi.get({id: contract.announce._id});

    contract.announce = announce;

    contract.lots.forEach(lot => {
      let ann_lot = announce.lots.findById(lot._id);
      lot.dircategory = ann_lot.dircategory;
    });

    let isOwner = contract.pur_company._id === authStore.company._id;
    let isVendor = contract.sup_company._id === authStore.company._id;

    let cons, invs;

    if (contract.status.in_('Schedule', 'Review', 'Pending', 'Active', 'Finished', 'Declined')) {
      [cons, invs] = await Promise.all([
        consApi.list({contract_id: id}),
        invApi.list({contract_id: id}),
      ]);

      cons.forEach(con => {
        con.date_from = moment(con.date_from);
        con.date_to = moment(con.date_from);
        con.lots.forEach(lot => {
          let index = contract.lots.findIndexById(lot.advert_lot_id);
          let advert_lot = contract.lots[index];
          advert_lot.index = index;
          lot.advert_lot = advert_lot;
        });
      });

      invs.forEach(inv => {
        inv.date = moment(inv.date);
      });
    }

    runInAction(() => {
      Object.assign(this, {
        contract,
        isOwner,
        isVendor,
        consignments: cons,
        invoices: invs,
        ready: true,
      })
    })
  }

  @action
  reset() {
    Object.assign(this, {
      contract: null,
      isOwner: false,
      isVendor: false,
      ready: false,
      otpStatus: this.OTP_INIT,
      otpCode: '',
    })
  }

  // sup

  async sendSignOTP() {
    this.otpStatus = this.OTP_SENDING;

    try {
      let id = this.contract.id;
      await contractsApi.sendSignOTP(id);
      this.otpStatus = this.OTP_SENT;

    } catch (e) {
      this.otpStatus = this.OTP_INIT;
      throw e;
    }
  }

  @action
  setOTP(otpcode) {
    this.otpCode = otpcode;
  }

  @computed
  get canSubmitSign() {
    return this.otpCode.length === 6
  }

  async sup_submit() {
    // this.otpStatus = this.OTP_SENDING;

    try {
      let id = this.contract.id;
      await contractsApi.sup_submit({id});
      this.load(id);

    } catch (e) {
      // this.otpStatus = this.OTP_SENT;
      throw e;
    }
  }

  async sup_decline() {
    this.otpStatus = this.OTP_SENDING;

    try {
      let id = this.contract.id;
      let res = await contractsApi.decline(id);
      this.contract.status = 'Declined';
      return res;

    } catch (e) {
      this.otpStatus = this.OTP_INIT;
      throw e;
    }
  }

  async finish(id) {
    await contractsApi.finish(id);
  }
}
