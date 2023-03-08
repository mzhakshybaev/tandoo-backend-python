import * as request from '../../utils/requester';

export default new class ProductsApi{
  getProduct(id) {
    return request.postAsync('product/get', 'doc', {id})
  }
}
