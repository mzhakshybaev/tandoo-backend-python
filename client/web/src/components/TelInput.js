import React, {Component} from 'react';
import IntlTelInput from 'react-intl-tel-input';
import 'react-intl-tel-input/dist/main.css';
import {inject, observer} from "mobx-react";
import {action, observable} from "mobx";
import cx from 'classnames';

@inject('mainStore') @observer
export default class TelInput extends Component {
  @observable value;
  @observable isValid = true;

  @action
  handleChange = (isValid, value, countryData, number) => {
    if (!value.match(/^\+/)) {
      this.value = value;

      if (isValid) {
        number = number.replace(/[+ ]/g, '');
        this.props.onChange && this.props.onChange(number);
      }
    }

    this.isValid = isValid;
  };

  render() {
    const {value = '', disabled} = this.props;

    return <IntlTelInput
      preferredCountries={['kg']}
      defaultCountry={'kg'}
      onPhoneNumberChange={this.handleChange}
      format={true}
      nationalMode={false}
      defaultValue={value}
      value={this.value}
      containerClassName="intl-tel-input"
      inputClassName={cx('form-control', {'is-invalid': !this.isValid})}
      disabled={disabled || this.props.mainStore.isBusy}
    />
  }
}
