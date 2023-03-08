import * as request from '../../utils/requester';

export default new class ContractsApi {
  getContracts(params) {
    return request.postAsync('contract/listing', 'docs', params)
  }

  getContract(id) {
    return request.postAsync('contract/get', 'doc', {id})
  }

  sendSignOTP(id) {
    return request.postAsync('contract/send_otp', null, {id})
  }

  // sign(id, otpcode) {
    // return request.postAsync('contract/sign', null, {id, otpcode})
  // }

  decline(id) {
    return request.postAsync('contract/decline', null, {id})
  }

  pur_submit(params) {
    return request.postAsync('contract/pur_submit', null, params)
  }

  pur_update(params) {
    return request.postAsync('contract/pur_update', null, params)
  }

  pur_submit(params) {
    return request.postAsync('contract/pur_submit', null, params)
  }

  sup_submit(params) {
    return request.postAsync('contract/sup_submit', null, params)
  }
  finish(id) {
    return request.postAsync('contract/finish', null, {id})
  }
}
