import React from 'react';
import {inject, observer} from 'mobx-react';
import DPicker from "react-datepicker";
import {InputGroup, InputGroupAddon, InputGroupText} from "reactstrap";
import {translate} from "react-i18next";

@inject('mainStore') @translate(['common', 'settings', '']) @observer
export default class DatePicker extends React.Component {
  onChange = value => {
    let {onChange} = this.props;
    if (value && onChange) {
      onChange(item);
    }
  };

  render() {
    let {disabled, placeholder, mainStore, t, value, addon, icon, ...rest} = this.props;

    return (
      <InputGroup>
        {addon &&
        <InputGroupAddon addonType="prepend">
          <InputGroupText>{icon}</InputGroupText>
        </InputGroupAddon>
        }

        <DPicker selected={value} className='form-control'
                 onChange={this.onChange}
                 todayButton={t("сегодня")}
                 placeholderText={placeholder || t('дд.мм.гггг', {keySeparator: '>', nsSeparator: '|'})}
                 peekNextMonth
                 showMonthDropdown
                 showYearDropdown
                 dropdownMode="select"
                 disabled={disabled || mainStore.isBusy}
                 {...rest}
        />
      </InputGroup>

    )
  }
}
