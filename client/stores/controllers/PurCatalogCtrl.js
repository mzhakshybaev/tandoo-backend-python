import {action, observable, runInAction} from 'mobx';
import {storageGet, storageSave} from "../../utils/LocalStorage";
import purchaserStore from '../PurchaserStore';
import specStore from '../SpecificationStore';
import announceApi from '../api/AnnounceApi'


export default new class PurCatalogCtrl {
  @observable ready;
  @observable sections;
  @observable categories; // all categories which have specifications
  @observable sectionCategories; // categories of selected section
  @observable section;
  @observable category;
  @observable products;
  @observable filters;
  @observable breadcrumb = [];
  @observable local = false;
  @observable disableSectionSelect = false;
  filterInfo;
  prevFilters;

  async load(ann_id) {
    let {local} = this;
    let [sections, categories] = await Promise.all([
      specStore.getSections({local}),
      specStore.getSpecifications({local})
    ]);

    runInAction(() => {
      this.sections = sections;
      this.categories = categories;
    });

    this.disableSectionSelect = false;
    if (ann_id) {
      // load from announce
      let ann = await announceApi.get({id: ann_id});
      let section = this.sections.findById(ann.dirsection._id);
      this.disableSectionSelect = true;
      this.selectSection(section);

    } else {
      // load from storage
      let basket = await storageGet('basket');

      if (basket) {
        let {section, lots} = basket;

        if (section && lots.length) {
          let sectionSel = this.sections.findById(section._id);
          this.disableSectionSelect = true;
          this.selectSection(sectionSel);
        } else {
          this.selectSection(this.sections[0]);
        }
      } else {
        this.selectSection(this.sections[0]);
      }
    }
    // this.setBreadcrumbSection();
    if (this.local) {
      this.setBreadcrumb({name: "Отечественная продукция", _id: 'national'}, 'national')
    }

    this.ready = true;
  }

  @action
  reset() {
    Object.assign(this, {
      ready: false,
      sections: null,
      categories: null,
      sectionCategories: null,
      section: null,
      category: null,
      products: null,
      filters: null,
      filterInfo: null,
      prevFilters: null,
      local: false,
      disableSectionSelect: false,
    })
  }

  // setSectionFromQuery() {
  //   let query = this.props.location.query;
  //
  //   if (query && query.sectionId) {
  //     let section = this.sections.find(s => s._id === query.sectionId);
  //     if (section) {
  //       this.section = section;
  //       this.mapCategories();
  //     }
  //   }
  // };

  @action.bound
  selectSection(section) {
    if (!section || section === this.section)
      return;

    Object.assign(this, {
      section,
      sectionCategories: null,
      category: null,
      products: null,
      filters: null,
      prevFilters: null,
      breadcrumb: null
    });

    this.mapCategories();
    // this.selectCategory(this.sectionCategories[0]);
  }

  @action.bound
  selectCategory(category) {
    Object.assign(this, {
      category,
      products: null,
      filters: null,
      prevFilters: null
    });

    // if (category) {
    //   this.getProducts();
    // }
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

  // Categories which have specifications
  @action.bound
  mapCategories() {
    // let sectionCategories = [];
    let {section, categories} = this;

    if (section && section.dircategories_id) {
      this.sectionCategories = categories.filter(c => section.dircategories_id.includes(c.id));
    }
  }

  async getProducts() {
    this.products = null;
    let filter = this.buildFilter();
    let res = await purchaserStore.getProducts(filter);
    this.handleProducts(res);
  }

  @action
  buildFilter() {
    let {filters, section, category} = this;

    // build filterInfo
    let filterInfo = {
      section,
      dircategory: category,
      specifications: [],
      dictionaries: []
    };

    if (filters && filters.dictionaries) {
      filters.dictionaries.forEach(dict => {
        let selDictValues = dict.values.filter(v => v.checked);

        if (selDictValues.length) {
          dict.values = selDictValues;
          filterInfo.dictionaries.push(dict);
        }
      });
    }

    if (filters && filters.specifications) {
      filters.specifications.forEach(spec => {
        let selSpecValues = spec.values.filter(v => v.checked);

        if (selSpecValues.length > 0) {
          spec.values = selSpecValues;
          filterInfo.specifications.push(spec);
        }
      });
    }


    // build filter
    let filter = {
      dircategory_id: category.dircategory_id,
      specifications: [],
      dictionaries: [],
      local: this.local,
    };

    filterInfo.dictionaries.forEach(dict => {
      dict.values.forEach(v => {
        filter.dictionaries.push({
          dirname: dict.dirname,
          dictionary_id: v._id
        });
      });
    });

    filterInfo.specifications.forEach(spec => {
      spec.values.forEach(s => {
        filter.specifications.push({
          property: spec.id,
          value: s.id
        });
      });
    });


    this.filterInfo = filterInfo;
    this.prevFilters = filter;

    return filter;
  }

  @action.bound
  handleProducts(res) {
    let {filters, docs: products} = res;
    let {prevFilters, filterInfo} = this;

    if (filters) {
      if (filters.dictionaries) {
        filters.dictionaries.forEach(dict => {
          dict.values.forEach(v => {
            // TODO: wtf is this???
            v.checked = prevFilters.dictionaries.some(pd => v._id === pd.dictionary_id)
          });

          // special case: DirUnits must be checked
          /*if (dict.dirname === "DirUnits" && dict.values.length === 1) {
            if (!filterInfo.dictionaries.some(d => d.dirname === 'DirUnits')) {
              // not selected yet
              let v = dict.values[0];

              v.checked = true;
              // v._disabled = true;
              filterInfo.dictionaries.push(dict);
            }
          }*/
        });
      }

      if (filters.specifications) {
        filters.specifications.forEach(spec => {
          spec.values.forEach(v => {
            // TODO: wtf is this???
            v.checked = prevFilters.specifications.some(ps => v.id === ps.value)
          })
        });
      }
    }

    Object.assign(this, {products, filters});
  };

  async addLot(product) {
    let {unit_price} = product;
    let {filterInfo, section} = this;

    let {dictionaries: dicts, specifications: specs} = filterInfo;

    let unit = dicts.find({dirname: 'DirUnits'});
    dicts = dicts.filter(d => d.dirname !== 'DirUnits');

    if (!(unit && (dicts.length || specs.length))) {
      throw new Error('Укажите единицу измерения и хотя бы один параметр');
    }

    await storageSave('basketLot', {...filterInfo, section, unit_price});
  }

  @action
  setLocal = e => {
    const checked = e.target ? e.target.checked : e;
    this.local = checked;
    // this.load();
    if (this.section && this.category) {
      this.getProducts();
    }
  };

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
  setBreadcrumbSection(refresh) {
    this.breadcrumb = [];
    Object.assign(this, {
      sectionCategories: null,
      category: null,
      products: null,
      filters: null,
      prevFilters: null,
      local: false
    });

    this.mapCategories();
    this.selectCategory(this.sectionCategories[0]);
    this.breadcrumb[0] = {name: this.section.name, type: 'section', id: this.section._id};
    this.setBreadcrumbCategory(this.category, refresh);
  }

  @action.bound
  setBreadcrumbCategory(category, refresh) {
    Object.assign(this, {
      category,
      products: null,
      filters: null,
      prevFilters: null
    });

    if (category && refresh) {
      this.getProducts();
    }
    this.breadcrumb[1] = {name: this.category.dircategory.name, type: 'category', id: this.category.id};
  }
}
