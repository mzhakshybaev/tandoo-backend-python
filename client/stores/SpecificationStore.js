import {action, computed, observable} from "mobx";
import * as requester from "../utils/requester";

export default new class SpecificationStore {

  @observable product = {category: null, name: null, name_kg: null, name_en: null, attr: []};
  @observable dictionaries = [];


  async getSpecifications(params) {
    return await requester.postAsync("specification/speclist", "docs", params) || [];
  }

  @action.bound
  onSwitch = (attr, value) => {
    let attributes = this.product.attr;
    let index = attributes.findIndex({id: attr.id});
    if (index !== -1) {
      attributes[index].switched = value;
      this.product.attr = attributes.slice();
    }
  };

  @action
  saveSpecification() {
    this.product.dircategory_id = parseInt(this.product.category.id);
    this.product.dictionaries = [];
    this.dictionaries.forEach(d => {
      if (d.switched) {
        let tempDict = {table: d.table, name: d.name};
        if (d.id)
          tempDict.id = d.id;
        this.product.dictionaries.push(tempDict);
      }
    });

    console.log("PRODUCT", this.product);
    requester.post("specification/save", [this.product]).then(r => {
      this.resetProduct();
    }, (e) => console.log(e));
  }

  @computed
  get canSaveSpec() {
    let p = this.product;
    return p.attr.length !== 0 &&
      p.attr.every(a => a.name && a.name_kg && a.name_en &&
        a.name.trim() && a.name_kg.trim() && a.name_en.trim())
  }

  @action
  getAttributes() {
    if (this.product.category)
      requester.post("specification/listing", {dircategory_id: this.product.category.id}).then(r => {
        this.product.attr = r.docs[0].property || [];
        let selectedDicts = r.docs[0].dictionaries;
        this.dictionaries = this.dictionaries.map(d => {
          let temp = selectedDicts.find(selected => selected.dirname === d.table);
          if (temp) {
            d.switched = true;
            d.id = temp.id
          }
          return d;
        });
      })
  }

  @action
  getDictionaries() {
    if (this.dictionaries.length === 0)
      requester.post("/dictionary/tables_list").then(r => {
        this.dictionaries = r.tables;
        this.dictionaries.forEach(d => d.switched = false);
      })
  }

  @action
  resetProduct() {
    this.product = {category: null, name: null, name_kg: null, name_en: null, attr: []};
    this.dictionaries.forEach(d => d.switched = false);
  }

  async getSections(params) {
    let r = await requester.post("dictionary/listing", {...params, type: "DirSection"});
    return r.docs || [];
  }

  async saveSection(section) {
    return await requester.post("dictionary/save", section)
  }

  async getCategoriesByIds(ids) {
    let r = await requester.post("specification/get_by_ids", ids);
    return r.docs || []
  }
}
