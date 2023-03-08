import mainStore from "./MainStore";
import authStore from "./AuthStore";
import menuStore from "./MenuStore";
import dictStore from "./DictStore";
import adminStore from "./AdminStore";
import supplierStore from "./SupplierStore"
import categoryStore from "./CategoryStore";
import specStore from "./SpecificationStore";
import specStoreV2 from "./SpecificationsV2";
import productStore from "./ProductStore";
import catalogStore from "./CatalogStore";
import purchaserStore from "./PurchaserStore";

import announceViewCtrl from './controllers/AnnounceViewCtrl';

import purCatalogCtrl from './controllers/PurCatalogCtrl';
import purAnnListCtrl from './controllers/PurAnnListCtrl';
import purAnnContractsListCtrl from './controllers/PurAnnContractsListCtrl';
import purContractListCtrl from './controllers/PurContractListCtrl';

import supAppsListCtrl from './controllers/SupAppsListCtrl';
import supAppsDraftsListCtrl from './controllers/SupAppsDraftsListCtrl';
import supRequestsListCtrl from './controllers/SupRequestsListCtrl';
import supContractListCtrl from './controllers/SupContractListCtrl';

import supPropEditCtrl from './controllers/SupPropEditCtrl';
import supMyProductsCtrl from './controllers/SupMyProductsCtrl';
import supMyProductsEditCtrl from './controllers/SupMyProductsEditCtrl';
import notificationsCtrl from './controllers/Messages/NotificationsCtrl';
import autoNotificationsCtrl from './controllers/Messages/AutoNotificationsCtrl';
import newsCtrl from './controllers/Messages/NewsCtrl';
import productCtrl from './controllers/ProductCtrl';

import contractViewCtrl from './controllers/ContractViewCtrl';
import conViewCtrl from './controllers/ConViewCtrl';
import invViewCtrl from './controllers/InvViewCtrl';

import purScheduleEditCtrl from './controllers/PurScheduleEditCtrl';

export default {
  mainStore,
  authStore,
  menuStore,
  dictStore,
  adminStore,
  supplierStore,
  categoryStore,
  specStore,
  specStoreV2,
  productStore,
  catalogStore,
  purchaserStore,

  // common controllers
  announceViewCtrl,
  autoNotificationsCtrl,
  notificationsCtrl,
  newsCtrl,
  productCtrl,

  // purchaser
  purCatalogCtrl,
  purAnnListCtrl,
  purAnnContractsListCtrl,
  purContractListCtrl,
  purScheduleEditCtrl,

  // supplier
  supAppsListCtrl,
  supAppsDraftsListCtrl,
  supRequestsListCtrl,
  supPropEditCtrl,
  supMyProductsCtrl,
  supMyProductsEditCtrl,
  supContractListCtrl,

  contractViewCtrl,
  conViewCtrl,
  invViewCtrl,
};
