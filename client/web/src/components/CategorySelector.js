import React from "react";
import PropTypes from 'prop-types';
import {AsyncSelect} from "./Select";
import {inject} from "mobx-react";
import Highlighter from "react-highlight-words";

@inject('categoryStore')
export default class CategorySelector extends React.Component {

  render() {
    let {loadOptions, ...rest} = this.props;
    loadOptions = loadOptions || this.props.categoryStore.getCategorySearch;
    return <AsyncSelect valueRenderer={option => <span>{option.code} {option.name}</span>}
                        optionRenderer={option => <Highlighter
                          searchWords={[this._inputValue]}
                          textToHighlight={option.code + ' ' + option.name}
                        />}
                        loadOptions={loadOptions}
                        {...rest}
    />
  }
}

CategorySelector.defaultProps = {
  autoload: true,
  wait: 500,
  labelKey: "name",
  placeholder: "Выберите категорию",
};

CategorySelector.propTypes = {
  // required warning keeps showing even 'value' prop is passed
  value: PropTypes.any,
  onChange: PropTypes.func,
  autoload: PropTypes.bool,
  wait: PropTypes.number,
  loadOptions: PropTypes.func,
  debounceOptions: PropTypes.object
};
