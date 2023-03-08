import {action, computed, observable, runInAction, toJS} from "mobx";
import {showSuccess, showInfo} from "../utils/messages";
import SpecificationsApi from "./api/SpecificationsApi";

export default new class SpecificationsV2 {

  @observable section;
  @observable dictionaries;
  @observable specifications;
  @observable specification;
  @observable roles;
  @observable ready = false;

  constructor() {
    this.reset()
  }

  reset() {
    Object.assign(this, {
      sections: null,
      section: null,
      specifications: [],
      dictionaries: [],
      roles: null,
      ready: false
    })
  }

  @action
  resetSpecification() {
    this.specification = null;
    this.dictionaries = this.dictionaries.map(d => ({...d, ...{id: null, switched: false, roles_id: []}}));
    this.roles.forEach(r => r.switched = false)
  }

  async load() {
    let [dictionaries, roles, sections] = await Promise.all([
      this.getDictionaries(),
      this.getRoles(),
      SpecificationsApi.getSections()
    ]);

    runInAction(() => {
      Object.assign(this, {sections, dictionaries, roles, ready: true});
    })
  }

  @action.bound
  async onSectionSelect(section) {
    this.resetSpecification();
    this.section = section;
    if (section)
      this.specifications = await SpecificationsApi.getSpecificationsBySection(section);
    else
      this.specifications = [];
  }

  @action.bound
  onTableClick(row) {
    if (!this.specification || this.specification.category !== row.dircategory) {
      this.resetSpecification();
      this.getSpecificationData({id: row.id, category: row.dircategory});
    }
  }

  @action.bound
  onNewSpecClick() {
    if (!this.section) {
      showInfo("Выберите раздел");
      return;
    }
    this.resetSpecification();
    this.specification = {category: null, attr: []};
  }

  @action.bound
  onNewAttributeClick() {
    let attributes = this.specification.attr.slice();
    attributes.push({order: null, name: "Название атрибута", name_kg: null, name_en: null, values: [], roles_id: []});
    this.specification.attr = attributes;
  }

  @action.bound
  onRemoveAttributeClick(index) {
    let attributes = this.specification.attr.slice();
    attributes.splice(index, 1);
    this.specification.attr = attributes;
  }

  @action.bound
  onAddValueClick(attrIndex) {
    let attributes = this.specification.attr.slice();
    attributes[attrIndex].values.push({name: "Значение", name_kg: null, name_en: null});
    this.specification.attr = attributes;
  }

  @action.bound
  onRemoveValueClick(attrIndex, valueIndex) {
    let attributes = this.specification.attr.slice();
    attributes[attrIndex].values.splice(valueIndex, 1);
    this.specification.attr = attributes;
  }


  @action.bound
  onAttributeChange(index, field, val) {
    let attributes = this.specification.attr;
    attributes[index][field] = val
  }

  @action.bound
  onValueChange(attrIndex, index, field, val) {
    let attributes = this.specification.attr;
    let values = attributes[attrIndex].values;
    let value = values[index];
    value[field] = val;
  }

  @action
  onSwitchRole(obj, isOn, roleId) {
    if (isOn)
      obj.roles_id.push(roleId);
    else {
      let index = obj.roles_id.findIndex(id => id === roleId);
      if (index !== -1)
        obj.roles_id.splice(index, 1);
    }
  }

  @action.bound // Attribute visibility
  onSwitchVisibility(index, isOn, roleId) {
    let attributes = this.specification.attr;
    let attr = attributes[index];
    this.onSwitchRole(attr, isOn, roleId);
  }

  @action.bound
  onSwitchDictVisibility(index, isOn, roleId) {
    let dict = this.dictionaries[index];
    this.onSwitchRole(dict, isOn, roleId);
  }

  @action.bound
  onSwitchDictionary(index, value) {
    let dict = this.dictionaries[index];
    dict.switched = value;
  }

  @action.bound
  onCategorySelect(value) {
    this.specification.category = value
  }

  @action.bound
  async onSaveSpecification() {
    this.specification.dirsection_id = this.section.id;
    this.specification.dircategory_id = this.specification.category.id;
    this.specification.section = this.section;
    this.specification.dictionaries = this.dictionaries
      .filter({switched: true})
      .map(d => {
        let dict = {table: d.table, name: d.name, roles_id: d.roles_id};
        if (d.id)
          dict.id = d.id;
        return dict;
      });

    let specification = toJS(this.specification);
    delete specification.category;

    try {
      let r = await SpecificationsApi.saveSpecification([specification]);
      this.resetSpecification();
      this.specifications = await SpecificationsApi.getSpecificationsBySection(this.section);
      showSuccess(r.message);
    } catch (e) {
      console.log(e)
    }
  }

  @action.bound
  onCancelSpecification() {
    this.resetSpecification();
  }

  @computed
  get canSaveSpec() {
    let p = this.specification;
    return p.attr.length !== 0 &&
      p.attr.every(a => a.name && a.name_kg && a.name_en &&
        a.name.trim() && a.name_kg.trim() && a.name_en.trim())
  }

  @action.bound
  getSpecificationData(data) {
    if (data.category)
      SpecificationsApi.getSpecification(data.category.id).then(spec => {
        this.specification = {...data, attr: spec.property || []};
        let selectedDicts = spec.dictionaries || [];
        // modify dictionaries, if it was selected mark as switched,
        // roles_id is for visibility
        this.dictionaries = this.dictionaries.map(d => {
          let found = selectedDicts.find({dirname: d.table});
          if (found) {
            Object.assign(d, {
              id: found.id,
              roles_id: found.roles_id || [],
              switched: true
            })
          }
          return d;
        });
      })
  }

  async getDictionaries() {
    let dictionaries = await SpecificationsApi.getDictionaries();
    dictionaries.forEach(d => {
      d.switched = false;
      d.roles_id = [];
    });
    return dictionaries;
  }

  async getRoles() {
    let roles = await SpecificationsApi.getRoles();
    let only = ["Закупщик", "Поставщик", "Наблюдатель"];
    return roles.filter(r => only.includes(r.name));
  }
}
