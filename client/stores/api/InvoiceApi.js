import * as request from '../../utils/requester';

export default new class InvoiceApi {
  // /invoice/
  // listing
  // get({id})
  // save({id, type, rev, status, contract_id, advert_id, advert_lot_id, application_id, purchaser_company_id,
  //       supplier_company_id, dirsection_id, quantity, unit_price, total, created_date, updated_date, comment, data})

  list(params) {
    return request.postAsync('invoice/listing', 'docs', params)
  }
  get(id) {
    return request.postAsync('invoice/get', 'doc', {id})
  }
  finish(id) {
    return request.postAsync('invoice/finish', 'doc', {id})
  }
}
