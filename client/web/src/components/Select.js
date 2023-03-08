import React, {Component} from 'react';
import RSelect from 'react-select';
import {observer} from "mobx-react";
import PropTypes from 'prop-types';
import {debounce} from "lodash-es";
import {translate} from "react-i18next";

@translate(['common', 'settings', '']) @observer
export default class Select extends Component {
  render() {
    const {t} = this.props;
    let {value, valueKey, labelKey, multi, placeholder, options, optionRenderer, valueRenderer, onChange, busy, disabled, ...rest} = this.props;
    return (
      <RSelect
        value={value}
        valueKey={valueKey}
        multi={multi}
        placeholder={placeholder || t('выберите...')}
        labelKey={labelKey}
        loadingPlaceholder={t('загрузка...')}
        noResultsText="пусто"
        isLoading={busy}
        disabled={disabled || busy}
        options={options || []}
        optionRenderer={optionRenderer}
        valueRenderer={valueRenderer}
        onChange={onChange}
        {...rest}/>
    )
  }
}


export class AsyncSelect extends Component {

  state = {options: []};

  componentDidMount() {
    let {wait, loadOptions, debounceOptions, autoload} = this.props;
    if (loadOptions && autoload)
      loadOptions().then(this.updateState);

    // The data loader(loadOptions) in props loads instantly,
    // the one in class context does with delay
    this.loadOptions = this.buildDebounce(loadOptions, wait, debounceOptions);
  }

  buildDebounce(sourceFunc, wait, debounceOptions) {
    return debounce((input) => {
      sourceFunc(input).then(this.updateState)
    }, wait, debounceOptions);
  }

  updateState = (options) => {
    this.setState({options})
  };

  render() {
    let {
      value, valueKey, labelKey, multi, placeholder, options, onChange,
      loadingPlaceholder, noResultsText, searchPromptText, ...rest
    } = this.props;
    return (
      <Select
        value={value}
        valueKey={valueKey}
        labelKey={labelKey}
        multi={multi}
        placeholder={placeholder}
        loadingPlaceholder={loadingPlaceholder}
        noResultsText={noResultsText}
        searchPromptText={searchPromptText}
        options={this.state.options}
        onChange={onChange}
        onInputChange={input => {
          if (input !== "") this.loadOptions(input)
        }}
        {...rest}/>
    )
  }
}

AsyncSelect.defaultProps = {
  autoload: true,
  wait: 500,
  labelKey: "name",
  placeholder: "Выберите...",
  noResultsText: "Нет данных",
};

AsyncSelect.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
  labelKey: PropTypes.string,
  placeholder: PropTypes.string,
  loadingPlaceholder: PropTypes.string,
  noResultsText: PropTypes.string,
  searchPromptText: PropTypes.string,
  autoload: PropTypes.bool,
  wait: PropTypes.number,
  loadOptions: PropTypes.func,
  debounceOptions: PropTypes.object
};


/*export class FormSuggest extends Component {
  @observable options = [];

  constructor(props) {
    super(props);
    this.state = {options: [], filterOptions: null}
  }

  onChange = (item) => {
    let {model, name, onChange} = this.props;
    if (model && name) {
      runInAction(() => model[name] = item);
    }
    if (onChange) {
      onChange(item);
    }
  };

  componentWillMount() {
    let {options, valueKey, labelKey, filterBy} = this.props;
    observe(this, 'options', (e) => {
      const filterOptions = createFilterOptions({
        options: e.newValue,
        valueKey,
        labelKey,
        indexes: filterBy
      });
      this.setState({options: e.newValue, filterOptions})
    });
    this.setState({options});
  }

  // componentWillReact() {
  //   let {options} = this.props;
  //   window.console.log('FormSuggest React');
  //   this.setState({options});
  // }

  render() {
    let {options, labelKey, valueKey, placeholder, selected, onSearch, renderItem, model, name} = this.props;
    this.options.replace(options);
    if (!labelKey) {
      labelKey = 'Text';
    }
    if (!valueKey) {
      valueKey = 'Value';
    }
    let item = selected;
    if (model && name) {
      item = model[name];
    }

    return <Select name={name}
                   value={item}
                   valueKey={valueKey}
                   labelKey={labelKey}
                   placeholder={placeholder}
                   loadingPlaceholder="загрузка..."
                   noResultsText="пусто"
                   options={this.state.options.slice() || options}
                   filterOptions={this.state.filterOptions}
                   onInputChange={onSearch}
                   optionRenderer={renderItem}
                   onChange={this.onChange}/>

  }
}

FormSuggest.propTypes = {
  options: PropTypes.object.isRequired,
  labelKey: PropTypes.string,
  model: PropTypes.object,
  name: PropTypes.string,
  filterBy: PropTypes.array,
  onSearch: PropTypes.func.isRequired,
  renderItem: PropTypes.func,
  placeholder: PropTypes.string,
  selected: PropTypes.any
};*/




