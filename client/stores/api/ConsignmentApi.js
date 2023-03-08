import * as request from '../../utils/requester';

export default new class ConsignmentApi {
  // /consignment/
  // listing
  // get({id})
  // sign({id})
  // decline({id}),
  // save({code, advert_id, contract_id, purchaser_company_id, supplier_company_id, sent_status, got_status, comment,
  //       data, lots})

  list(params) {
    return request.postAsync('consignment/listing', 'docs', params)
  }
  get(id) {
    return request.postAsync('consignment/get', 'doc', {id})
  }
  finish(id) {
    return request.postAsync('consignment/finish', 'doc', {id})
  }

  // async createConsignment(params) {
  //   let r = await request.post('consignment/save', params);
  // }
}
