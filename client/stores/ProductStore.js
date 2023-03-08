import {action, observable, runInAction} from "mobx";
import * as requester from "../utils/requester";
import specStore from './SpecificationStore';
import {fromPairs} from "lodash-es";

export default new class ProductStore {

  @observable categories = null;
  @observable category = null;
  @observable products = null;
  @observable specifications = null;
  @observable product = null;
  @observable productColumns = null;

  unload() {
    this.categories = null;
    this.category = null;
    this.reset();
  }

  @action
  reset() {
    Object.assign(this, {
      products: null,
      product: null,
      specifications: null,
      productColumns: null,
    })
  }

  async load(params) {
    let specs = await specStore.getSpecifications(params);
    let categories = specs.map(c => c.dircategory);
    runInAction(() => {
      this.categories = categories;
    });

    // [{
    //   id: (...)
    //   created_date: (...)
    //   data: (...)
    //   dircategory_id: (...)
    //   dircategory: {
    //     code: "30199780-1"
    //     data: null
    //     id: 1949
    //     name: "Офисная бумага "
    //     name_en: "Office paper"
    //     name_kg: "Офис кагаздары"
    //     parent_id: "1934"
    //   }
    // },...]
  }

  @action
  setCategory(category) {
    this.reset();
    this.category = this.categories.find({id: category.id});
    this.getSpecs();
    this.getProducts();
  }

  baseProductFields = [
    {id: "code", default: ''},
    {id: "barcode", default: ''},
    {id: "image", default: ''},
    {id: "images", default: []},
    {id: "local", default: false},
  ];

  async getSpecs() {
    if (this.category) {
      let specs = await requester.postAsync("specification/listing", 'docs[0]', {dircategory_id: this.category.id});
      let {property: properties, dictionaries} = specs;

      dictionaries = await Promise.all(dictionaries.map(async d => {
        d.values = await requester.postAsync("dictionary/listing", 'docs', {type: d.dirname});
        return d;
      }));

      // let specColumns = [].concat(
      //   dictionaries.map(d => ({name: d.name, options: d.options}))).concat(
      //   properties.map(p => ({name: p.name, options: p.values})));

      let productColumns = [].concat(
        this.baseProductFields.map(f => ({accessor: f.id})),
        dictionaries.map(d => ({accessor: d.name})),
        properties.map(p => ({accessor: p.name.replace('.)', ')')}))
      );

      runInAction(() => {
        this.specifications = {dictionaries, properties};
        this.productColumns = productColumns;
      });
    }
  }

  async getProducts() {
    this.products = null;
    let products = await requester.postAsync("product/listing", 'docs', {dircategory_id: this.category.id});
    this.products = products || [];
  }

  async getLocalProducts() {
    this.products = null;
    let products = await requester.postAsync("product/get_local", 'docs', {local: true});
    this.products = products || [];
  }

  @action
  setEmptyProduct() {
    let {dictionaries, properties} = this.specifications;

    let product = {
      _id: undefined,
      ...fromPairs(this.baseProductFields.map(f => [f.id, f.default])),
      dircategory_id: this.category.id,
      dictionaries: dictionaries.map(d => ({...d, value: null})),
      properties: properties.map(p => ({...p, value: null}))
    };

    this.product = product;
  }

  async setProduct(product) {
    if (!product) {
      this.product = null;
      return;
    }

    this.product = await this.loadProduct(product._id);
  }

  async loadProduct(id) {
    let product = await requester.postAsync("product/get", 'doc', {id});
    // fix backend data
    product.properties = product.specifications.map(p => {
      let {property, ...rest} = p;
      return {...property, ...rest}
    });

    // fix missing specs
    let {dictionaries, properties} = this.specifications;
    dictionaries.forEach(d => {
      let found = product.dictionaries.find({dirname: d.dirname});
      if (!found) {
        product.dictionaries.push({...d, value: null})
      }
    });

    properties.forEach(p => {
      let found = product.properties.find({id: p.id});
      if (!found) {
        product.properties.push({...p, value: null})
      }
    });

    return product;
  }

  async saveProduct() {
    let {dictionaries, properties, specifications, dircategory, ...p} = this.product;

    const product = {
      product: p,
      props: this.specifications.properties.map(p => {
        let {id, specification_id} = p;
        let pp = properties.find({id});
        let {prodspec_id, prodspec_rev, value} = pp;

        if (!value)
          throw new Error('Не заполнено поле ' + pp.name);

        return {
          specification_id,
          id,
          value: value.id,
          prodspec_id,
          prodspec_rev,
        }
      }),
      dictionaries: this.specifications.dictionaries.map(d => {
        let {dirname} = d;
        let pd = dictionaries.find({dirname});
        let {proddict_id, proddict_rev, value} = pd;

        if (!value)
          throw new Error('Не заполнено поле ' + pd.name);

        return {
          dirname,
          dictionary_id: value._id,
          proddict_id,
          proddict_rev
        };
      })
    };

    await requester.post("product/save", product);
  }
}
