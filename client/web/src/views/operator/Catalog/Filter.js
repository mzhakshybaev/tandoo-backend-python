import React, {Component} from "react"
import {inject, observer} from "mobx-react";
import {toJS} from "mobx";
import Input from "components/AppInput";
import Select from "components/Select";
import Highlighter from "react-highlight-words";
import {Card, CardBody, CustomInput} from "reactstrap";
import {translate} from "react-i18next";

@translate(['common', 'settings', '']) @inject("catalogStore", "mainStore") @observer
export default class Filter extends Component {

  render() {
     const {t, mainStore} = this.props;
    const {language} = mainStore;
    let label = 'name';
    if (language && language.code === 'en')
      label = 'name_en';
    if (language && language.code === 'kg')
      label = 'name_kg';
    let {
      sections, sectionCategories, section, category, filters,
      getProducts, onSelectSection, onSelectCategory, selectDict, selectSpec
    } = this.props.catalogStore;
    return (
      <Card>
        <CardBody>
          {/*<Input placeholder={"Поиск по штрих коду"} disabled/>*/}
          <Select className={"mt-2"}
                  value={section}
                  labelKey={label}
                  busy={this.props.mainStore.isBusy}
                  options={toJS(sections)}
                  onChange={onSelectSection}
                  placeholder={t('Выберите раздел')}/>
          <Select className={"mt-2"}
                  options={toJS(sectionCategories)}
                  valueKey={"id"}
                  value={category}
                  busy={this.props.mainStore.isBusy}
                  optionRenderer={(val) => <Highlighter
                    searchWords={[this._inputValue]}
                    textToHighlight={val.dircategory[label]}
                  />}
                  valueRenderer={val => val.dircategory[label]}
                  onInputChange={(input) => {
                    this._inputValue = input;
                    if (input !== "") {
                      // catalogStore.getCategories(input);
                    }
                  }}
                  onChange={onSelectCategory}
                  placeholder={t('Выберите категорию')}/>
          {filters.dictionaries.map((d, i) => {
            return <div key={i} className={"mt-2"}>
              <strong>{t("" + d.displayName+ "")}</strong>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: 'column',
                flexWrap: 'wrap',
                marginLeft: "10px"
              }}>
                {d.values.map((dv, j) =>
                  <CustomInput key={j}
                               type="checkbox"
                               id={dv.name}
                               label={dv.name}
                               checked={dv.checked}
                               onChange={e => selectDict(dv, e.target.checked)}/>
                )}
              </div>
            </div>
          })}
          {filters.specifications.map((s, i) => {
            return <div key={i} className={"mt-2"}>
              <strong>{s.property}</strong>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                flexDirection: 'column',
                flexWrap: 'wrap',
                marginLeft: "10px"
              }}>
                {s.values.map((sv, j) =>
                  <CustomInput key={j}
                               type="checkbox"
                               id={sv.name}
                               label={sv.name}
                               checked={sv.checked}
                               onChange={e => selectSpec(sv, e.target.checked)}/>
                )}
              </div>
            </div>
          })}
        </CardBody>
      </Card>)
  }
}
