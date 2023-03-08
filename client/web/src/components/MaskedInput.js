import {observer} from "mobx-react";
import React from "react";
import InputMask from "react-input-mask";
import cn from 'classnames';

@observer
export class MaskedInput extends React.Component {

  onChange = (e) => {
    let {onChange, callback} = this.props;
    let v = e.target.value;

    if (onChange) onChange(e);
    if (callback) callback(v);
  };

  render() {
    let {placeholder, disabled, value, mask, maskChar, invalid, className, ...rest} = this.props;

    let inputProps = {
      placeholder,
      className: cn('form-control', {'is-invalid': invalid}, className),
      disabled,
      mask,
      maskChar: maskChar || '_',
      value: value || '',
      onChange: this.onChange,
      ...rest
    };

    return (
      <InputMask {...inputProps}/>
    )
  }
}
