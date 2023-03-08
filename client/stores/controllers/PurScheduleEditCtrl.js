import {action, computed, observable, runInAction, toJS} from 'mobx';
import authStore from '../AuthStore';
import contractsApi from '../api/ContractsApi';
import consApi from '../api/ConsignmentApi';
import invApi from '../api/InvoiceApi';
import moment from "moment";
import {findIndex, findLastIndex} from "lodash-es";
import announceApi from "../api/AnnounceApi";
import {formatDate} from "../../utils/helpers";
import {FORMAT_DATE_DB} from "../../utils/common";

export default new class PurScheduleEditCtrl {
  @observable ready;
  @observable contract;
  @observable isOwner;
  @observable consignments = [];
  @observable invoices = [];
  @observable rests = [];
  @observable canSubmit = false;

  async load(id) {
    let contract = await contractsApi.getContract(id);
    let isOwner = contract.pur_company._id === authStore.company._id;

    let announce = await announceApi.get({id: contract.announce._id});

    contract.announce = announce;
    contract.lots = contract.lots.map(({_id}) => announce.lots.findById(_id));

    let [cons, invs] = await Promise.all([
      consApi.list({contract_id: id}),
      invApi.list({contract_id: id}),
    ]);

    cons.forEach(con => {
      con.date_from = moment(con.date_from);
      con.date_to = moment(con.date_from);
      con.lots.forEach(lot => {
        lot.advert_lot = contract.lots.findById(lot.advert_lot_id)
      });
    });

    invs.forEach(inv => {
      inv.date = moment(inv.date);
    });

    runInAction(() => {
      this.contract = contract;
      this.isOwner = isOwner;

      if (cons && cons.length) {
        this.consignments = cons;
      } else {
        this.createCons();
      }

      if (invs && invs.length) {
        this.invoices = invs;
      } else {
        this.createInvs();
      }

      this.canSubmit = cons && invs && cons.length > 0 && invs.length > 0;

      this.calcConLotRests();
      this.calcInvRests();

      this.ready = true;
    })
  }

  @action
  reset() {
    this.contract = null;
    this.consignments = [];
    this.invoices = [];
    this.isOwner = false;
    this.ready = false;
    this.canSubmit = false;
  }

  // generate consignments
  createCons() {
    let cons = [];

    this.contract.lots.forEach(lot => {
      let con = cons.find({address: lot.delivery_place});

      if (!con) {
        con = {
          date_from: moment(),
          date_to: moment(),
          address: lot.delivery_place,
          conditions: '',
          lots: []
        };

        cons.push(con)
      }

      con.lots.push({
        advert_lot: lot,
        quantity: lot.quantity,
        rest: 0
      })
    });

    runInAction(() => {
      this.consignments = cons;
    })
  }

  @action
  addCon = (params = {}) => {
    let {
      date_from = moment(),
      date_to = moment(),
      address = '',
      conditions = '',
      lots,
      // status
      // order
      // sup_message
    } = params;

    if (!lots) {
      lots = this.contract.lots.map(lot => {
        return {
          advert_lot: lot,
          quantity: 0,
          total: 0,
          rest: 0,
        }
      })
    }

    let con = {
      date_from,
      date_to,
      address,
      conditions,
      lots,
    };

    this.consignments.push(con);
    this.calcConLotRests();
  };

  @action
  removeCon = (idx) => {
    this.consignments.splice(idx, 1);
    this.calcConLotRests();
  };

  getSelectLots(cidx, selectedLot) {
    let con = this.consignments[cidx];

    let lots = this.contract.lots.filter(lot => {
      if (selectedLot && selectedLot._id === lot._id)
        return true;

      let foundLot = con.lots.find(l => l.advert_lot && l.advert_lot._id === lot._id);

      return !foundLot;
    });

    return lots;
  }

  @action
  setConLot(cidx, index, advert_lot) {
    let lot = this.consignments[cidx].lots[index];
    lot.advert_lot = advert_lot;
    this.calcConLotRests();
  }

  @action
  addConLot(cidx) {
    let con = this.consignments[cidx];
    con.lots.push({
      advert_lot: null,
      quantity: 0,
      total: 0,
      rest: 0,
    })
  }

  @action
  removeConLot(cidx, index) {
    this.consignments[cidx].lots.splice(index, 1);
  }

  @action
  updateCon = (idx, field, value) => {
    let con = this.consignments[idx];
    con[field] = value;
  };

  @action
  updateConLot = (cidx, idx, field, value) => {
    let con = this.consignments[cidx];
    let lot = con.lots[idx];
    lot[field] = value;

    if (field === 'quantity') {
      lot.total = value * lot.unit_price;
    }

    this.calcConLotRests();
  };

  @action
  calcConLotRests() {
    let rests = this.contract.lots.map(lot => lot.quantity);

    this.consignments.forEach(con => {
      con.lots.forEach(lot => {
        if (!lot.advert_lot)
          return;

        let idx = this.contract.lots.findIndexById(lot.advert_lot._id);
        lot.rest = (rests[idx] -= lot.quantity);
      })
    });

    this.rests = rests;
  }

  // generate invoices
  createInvs() {
    let payments = this.contract.announce.data.payments;
    // let invs = [];

    if (payments.advanceEnabled && payments.advance) {
      this.addInv({
        type: 'advance',
        percent: payments.advance
      })
    }

    if (payments.shipmentEnabled && payments.shipment) {
      this.addInv({
        type: 'shipment',
        percent: payments.shipment
      })
    }

    if (payments.acceptEnabled && payments.accept) {
      this.addInv({
        type: 'accept',
        percent: payments.accept,
      })
    }
  }

  @action
  addInv = (params = {}) => {
    let {date = moment(), type = 'shipment', percent = 0, conditions = ''} = params;

    let amount = this.contract.total * percent / 100;
    let totalCur = this.invoices.reduce((a, i) => a + i.amount, 0) + amount;
    let rest = this.contract.total - totalCur;
    let editable = (type === 'shipment');

    let inv = {date, type, editable, percent, amount, rest, conditions};

    let pos;
    if (type === 'shipment') {
      pos = findLastIndex(this.invoices, {type: 'shipment'});
      if (pos === -1)
        pos = findLastIndex(this.invoices, {type: 'advance'});
      if (pos === -1)
        pos = findIndex(this.invoices, {type: 'accept'}) - 1;
    }

    if (typeof pos === 'number' && pos !== -1) {
      this.invoices.splice(pos + 1, 0, inv)

    } else {
      this.invoices.push(inv)
    }
  };

  @action
  removeInv = (idx) => {
    this.invoices.splice(idx, 1);
    this.calcInvRests()
  };

  @action
  updateInv = (idx, field, value) => {
    let invoice = this.invoices[idx];

    if (field === 'percent') {
      value = parseFloat(value);
      invoice[field] = value;
      invoice.amount = this.contract.total * value / 100;
      this.calcInvRests();

    } else if (field === 'amount') {
      value = parseFloat(value);
      invoice[field] = value;
      invoice.percent = value / this.contract.total * 100;
      this.calcInvRests();

    } else {
      invoice[field] = value;
    }
  };

  @action
  calcInvRests() {
    let rest = this.contract.total;

    this.invoices.forEach((inv) => {
      rest -= inv.amount;
      inv.rest = rest;
    })
  }

  @computed
  get canUpdate() {
    let restsOK = this.rests.every(v => v === 0);
    let consOK = (this.consignments.length > 0) && this.consignments.every(con => {
      let conOK = con.date_from && con.date_to && con.address && true;

      let lotsOK = (con.lots.length > 0) && con.lots.every(lot => {
        return lot.advert_lot && (lot.quantity > 0)
      });

      return conOK && lotsOK;
    });

    let total = this.contract.total;
    let invTotal = this.invoices.reduce((sum, inv) => (sum + inv.amount), 0);
    let invsOK = (total === invTotal);

    return restsOK && consOK && invsOK;
  }

  update = async () => {
    let cons = toJS(this.consignments);
    let invs = toJS(this.invoices);

    let params = {
      id: this.contract.id,
      consignments: cons.map(con => {
        let {date_from, date_to, lots, ...rest} = con;
        return {
          ...rest,
          date_from: formatDate(date_from, FORMAT_DATE_DB),
          date_to: formatDate(date_to, FORMAT_DATE_DB),
          lots: lots.map(lot => {
            let {advert_lot, ...rest} = lot;
            return {
              advert_lot_id: advert_lot._id,
              ...rest
            }
          })
        }
      }),
      invoices: invs.map(inv => {
        let {date, ...rest} = inv;
        return {
          ...rest,
          date: formatDate(date, FORMAT_DATE_DB)
        }
      })
    };

    await contractsApi.pur_update(params);
    this.canSubmit = true;
  };

  submit = async () => {
    await contractsApi.pur_submit({id: this.contract.id});
    this.load(this.contract.id);
  }
}
