import {action, observable, runInAction} from "mobx";
import supplierStore from "../SupplierStore";
import moment from "moment";
import authStore from "../AuthStore";
import {storageGet} from "../../utils/LocalStorage";
import announceApi from '../api/AnnounceApi';

export default new class SupPropEditCtrl {
  @observable ready = false;
  @observable announce;

  async load(id) {
    let announce = await announceApi.get({id});
    let isSupplier, isPublished, isPast, announce_app, isApplicable, myApps = [], selectedLotsCount, totalLotsCount,
      lots, lotsCount, selectedProductsCount;

    isSupplier = authStore.isSupplier;

    isPublished = (announce.status === 'Published');
    isPast = moment(announce.deadline).isBefore(moment());

    if (isSupplier) {
      try {
        announce_app = await supplierStore.getAnnounceAppInfo({advert_id: id});
      } catch (e) {
      }
      isApplicable = isPublished && !isPast && isSupplier && announce_app && announce_app.advert_lots && announce_app.advert_lots.length > 0;

      if (announce_app && announce_app.advert_lots && announce_app.advert_lots.length) {
        announce_app.advert_lots.filter((lot) => lot.applications && lot.applications.length).forEach(lot => {
          lot.applications.forEach(app => {
            myApps.push({lot, app})
          })
        });
      }

      let selectedLots = await storageGet('supSelectedLots');
      totalLotsCount = announce_app.advert_lots && announce_app.advert_lots.length;

      if (selectedLots) {
        lots = announce_app.advert_lots.filter(lot => selectedLots.includes(lot._id));
        selectedLotsCount = lots.length;

        if (!lots.length)
          lots = announce_app.advert_lots

      } else {
        lots = announce_app.advert_lots;
        selectedLotsCount = 0;
      }

      lotsCount = lots.length;
      selectedProductsCount = lots.reduce((a, lot) => lot.applications && lot.applications.length ? a + 1 : a, 0);
    }

    runInAction(() => {
      Object.assign(this, {
        announce,
        ready: true,
        announce_app,
        isApplicable,
        myApps,
        selectedLotsCount,
        totalLotsCount,
        lotsCount,
        selectedProductsCount,
      });
    })
  }

  @action
  reset() {
    this.announce = null;
    this.ready = false;
  }
}
