import {action, observable, runInAction} from 'mobx';
import authStore from '../AuthStore';
import supplierStore from '../SupplierStore';
import moment from "moment";
import announceApi from '../api/AnnounceApi';


export default new class AnnounceViewCtrl {
  @observable ready = false;
  @observable isSupplier;
  @observable announce;
  @observable announce_app;
  @observable isPublished;
  @observable isPast;
  @observable isApplicable;

  async load(id) {
    let isSupplier, isPurchaser, announce, announce_app, isPublished, isPast, isApplicable,
      myApps = [], allApps = [], debtData = [], isOwner;

    isSupplier = authStore.isSupplier;
    isPurchaser = authStore.isPurchaser;

    announce = await announceApi.get({id});
    debtData = announce.debt_data;

    isPublished = (announce.status === 'Published');
    isPast = moment(announce.deadline).isBefore(moment());

    if (isSupplier) {
      try {
        announce_app = await supplierStore.getAnnounceAppInfo({advert_id: id});
      } catch (e) {}
      isApplicable = isPublished && !isPast && isSupplier && announce_app && announce_app.advert_lots && announce_app.advert_lots.length > 0;

      if (announce_app && announce_app.advert_lots && announce_app.advert_lots.length) {
        announce_app.advert_lots.filter((lot) => lot.applications && lot.applications.length).forEach(lot => {
          lot.applications.forEach(app => {
            myApps.push({lot, app})
          })
        });
      }
    }

    if (isPurchaser) {
      isOwner = announce.company_id === authStore.company._id;
    }

    announce.lots.forEach(lot => {
      lot.applications.forEach(app => {
        allApps.push({lot, app})
      })
    });

    runInAction(() => {
      Object.assign(this, {
        isSupplier,
        isPurchaser,
        isOwner,
        announce,
        announce_app,
        isPublished,
        isPast,
        isApplicable,
        myApps,
        debtData,
        allApps,
        ready: true
      })
    })
  }

  @action
  reset() {
    Object.assign(this, {
      isSupplier: false,
      announce: null,
      announce_app: null,
      isPublished: null,
      isPast: false,
      isApplicable: false,
      ready: false
    })
  }
}
