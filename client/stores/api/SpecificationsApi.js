import * as request from '../../utils/requester';

export default new class SpecificationsApi {

  getSections() {
    return request.postAsync('dictionary/listing', 'docs', {type: "DirSection"})
  }

  getSpecificationsBySection(sectionId) {
    return request.postAsync("dirsection/get", "docs", {_id: sectionId})
  }

  getSpecifications() {
    return request.postAsync('specification/speclist', 'docs')
  }

  async getSpecification(categoryId) {
    let r = await request.post("specification/listing", {dircategory_id: categoryId});
    return r.docs[0];
  }

  saveSpecification(specification) {
    return request.postAsync("specification/save", null, specification)
  }

  getDictionaries() {
    return request.postAsync("/dictionary/tables_list", "tables");
  }

  getRoles() {
    return request.postAsync("role/listing", "docs", {});
  }
}
