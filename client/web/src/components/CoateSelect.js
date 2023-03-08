import React, {Component} from 'react';
import Select from 'react-select';
import {translate} from "react-i18next";
import {inject, observer,} from "mobx-react";
import {observable, action, toJS} from "mobx";
import PropTypes from "prop-types";

@translate(['common', 'settings', ''])
@inject('mainStore', 'dictStore') @observer

export default class CoateSelect extends Component {
  @observable options = [];
  @observable isLoading = false;
  @observable data = [];


  load = async (input) => {
    this.isLoading = true;
    this.options = await this.props.dictStore.getCoateListing(input);
    this.isLoading = false;

    this.data = this.options.map(p => ({
      id: p.id,
      name: p.list_parent.join(', ')
    }))
  };

  @action
  updateState = (data) => {
    this.data = data
  };


  render() {
    let {
      value, valueKey, multi, placeholder, onChange,
      loadingPlaceholder, noResultsText, searchPromptText, ...rest
    } = this.props;

    return (
      <Select
        value={value}
        valueKey={valueKey}
        labelKey={'name'}
        multi={multi}
        placeholder={placeholder}
        loadingPlaceholder={loadingPlaceholder}
        noResultsText={noResultsText}
        searchPromptText={searchPromptText}
        options={toJS(this.data)}
        onChange={onChange}
        isLoading={this.isLoading}
        onInputChange={input => {
          if (input !== "") this.load(input)
        }}
        {...rest}/>
    )
  }
}

CoateSelect.defaultProps = {
  autoload: true,
  wait: 500,
  labelKey: 'name',
  placeholder: "Выберите населенный пункт",
  noResultsText: "Нет данных",
};

CoateSelect.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  loadingPlaceholder: PropTypes.string,
  noResultsText: PropTypes.string,
  searchPromptText: PropTypes.string,
  autoload: PropTypes.bool,
  wait: PropTypes.number,
  loadOptions: PropTypes.func,
};


// constructor(props){
//    super(props);
//    this.state = {
//      display:'',
//      inputValue: this.props.inputValue || "",
//      displayedOpts: this.props.options.slice(0, this.props.maxDisplayed),
//    }
//    this.handleInputChange = this.handleInputChange.bind(this)
//  }
//  handleInputChange(inputValue) {
//   const  display = this.state.displayedOpts;
//    const displayedOpts =  display.filter(
//      ({label}) => label.toLowerCase().includes(inputValue.toLowerCase()),
//      this.props.options,
//    ).slice(0, this.props.maxDisplayed);
//    this.setState({inputValue, displayedOpts})
//  }


//
// CoateSelect.defaultProps = {
//   onChange: () => {},
//   maxDisplayed: 10
// }
