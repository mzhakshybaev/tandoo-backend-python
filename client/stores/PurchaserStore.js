import * as request from "../utils/requester"

export default new class PurchaserStore {
  getProducts(filter) {
    return request.post("purchasercatalog/listing", filter);
  }
}
