import React, {Component} from "react"
import {FGI} from "./AppInput";
import {translate} from "react-i18next";
import {MaskedInput} from "components/MaskedInput";

@translate(['common', 'settings', ''])
export default class SmsCodeInput extends Component {
  render() {
    const {t, l, lf, ls, f, onChange, callback, disabled, value, ...rest} = this.props;

    const fgiProps = {
      l: l || t('Код из СМС (OTP)'),
      lf, ls, f
    };

    const inputProps = {
      style: {textAlign: 'center'},
      mask: "999999",
      value,
      onChange,
      callback,
      disabled,
      ...rest
    };

    return (
      <FGI {...fgiProps}>
        <MaskedInput {...inputProps}/>
      </FGI>
    )
  }
}
