import {action, observable, runInAction} from "mobx";
import * as requester from "../utils/requester";
import specStore from './SpecificationStore';

export default new class CatalogStore {

  @observable sections;
  @observable categories;         // all categories which have specifications
  @observable sectionCategories;  // categories of selected section
  @observable section;            // selected section
  @observable category;           // selected category
  @observable products;           // products of selected sections => category
  @observable filters;            // current filters
  @observable breadcrumb = [];
  @observable selectedProduct;
  prevFilters;

  constructor() {
    this.reset();
  }

  @action
  reset() {
    Object.assign(this, this.getDefState(), {sections: null});
  }

  getDefState() {
    return {
      section: null,
      sectionCategories: null,
      category: null,
      ...this.getProductsState()
    }
  }

  getProductsState() {
    return {
      products: null,
      filters: {dictionaries: [], specifications: []},
      prevFilters: null
    }
  }

  @action.bound
  buildFilter() {
    let {filters} = this;
    let filter = {
      dircategory_id: this.category.dircategory_id,
      specifications: [],
      dictionaries: []
    };
    filters.dictionaries.forEach(d => {
      d.values.forEach(v => {
        if (v.checked)
          filter.dictionaries.push({dirname: d.dirname, dictionary_id: v._id})
      })
    });
    filters.specifications.forEach(s => {
      s.values.forEach(v => {
        if (v.checked)
          filter.specifications.push({property: s.id, value: v.id})
      })
    });


    runInAction(() => {
      this.prevFilters = filter
    });

    return filter;
  }

  @action.bound
  handleProducts(r) {
    let products = r.docs || [];
    let filters = r.filters || {dictionaries: [], specifications: []};
    let {prevFilters: {dictionaries, specifications}} = this;

    // TODO: Simplify this
    // checks all previous checkboxes
    filters.dictionaries.forEach(d =>
      d.values.forEach(v => {
        // if at least one match found then this means that
        // the value was checked before sending request
        return v.checked = dictionaries.some({dictionary_id: v._id});
      }));

    // the same thing here
    filters.specifications.forEach(s =>
      s.values.forEach(v => v.checked = specifications.some({value: v.id})));

    this.products = products;
    this.filters = filters;
  }

  @action // Categories which have specifications
  mapCategories() {
    let sectionCategories = [];
    let {section, categories} = this;
    if (section)
      section.dircategories_id
        .forEach(id => {
          let category = categories.find(c => c.id === id);
          if (category) sectionCategories.push(category)
        });
    this.sectionCategories = sectionCategories;
  }

  @action.bound
  onSelectSection(section = {}) {
    Object.assign(this, this.getDefState(), {section});
    this.setBreadcrumbSection();
    this.mapCategories();
  }

  @action.bound
  onSelectCategory(category = {}) {
    Object.assign(this, this.getProductsState(), {category});
    if (category)
      this.setBreadcrumbCategory()
    this.getProducts();
  }

  @action.bound
  getProducts = () => {
    requester.post("catalog/listing", this.buildFilter()).then(this.handleProducts);
  };

  @action
  async load() {
    let [sections, categories] = await
      Promise.all([
        specStore.getSections(),
        specStore.getSpecifications()
      ]);

    this.sections = sections;
    this.categories = categories;
  }

  @action.bound
  selectDict(dv, checked) {
    if (checked) {
      dv.checked = checked;
      this.setBreadcrumb(dv, 'dict')
      this.getProducts();
    } else {
      dv.checked = checked;
      this.updateBreadCrumbById(dv._id);
      this.getProducts()
    }
  }

  @action.bound
  selectSpec(sv, checked) {
    if (checked === true) {
      sv.checked = checked;
      this.setBreadcrumb(sv, 'spec')
      this.getProducts();
    } else {
      sv.checked = checked;
      this.updateBreadCrumbById(sv.id);
      this.getProducts()
    }
  }

  @action
  setBreadcrumb(item, type) {
    let breadcrumbItem = {name: item.name, type: type};
    if (item._id) {
      breadcrumbItem.id = item._id
    } else if (item.id) {
      breadcrumbItem.id = item.id
    }
    this.breadcrumb.push(breadcrumbItem)
  }

  @action.bound
  updateBreadCrumbById(id) {
    this.breadcrumb.forEach((item, index) => {
      if (item.id === id) {
        this.breadcrumb.splice(index, 1);
      }
    })
  }

  @action.bound
  updateBreadCrumb(index) {
    let toDelete = this.breadcrumb.slice(index + 1);
    toDelete.forEach(i => {
      this.filters.dictionaries.map((k, kIndex) => {
          k.values.map((j, jIndex) => {
            if (j.checked === true && j._id === i.id) {
              this.filters.dictionaries[kIndex].values[jIndex].checked = false;
            }
          })
        }
      )
      this.filters.specifications.map((s, sIndex) => {
          s.values.map((v, vIndex) => {
            if (v.checked === true && v.id === i.id) {
              this.filters.specifications[sIndex].values[vIndex].checked = false;
            }
          })
        }
      )
    })
    this.breadcrumb.splice(index + 1);
    this.getProducts();
  }

  @action.bound
  setBreadcrumbSection() {
    this.breadcrumb = []
    Object.assign(this,
      {
        category: null,
        ...this.getProductsState()
      })
    this.breadcrumb[0] = {name: this.section.name, type: 'section', id: this.section._id};
  }

  @action.bound
  setBreadcrumbCategory() {
    this.breadcrumb[1] = {name: this.category.dircategory.name, type: 'category', id: this.category.id};
  }
}
