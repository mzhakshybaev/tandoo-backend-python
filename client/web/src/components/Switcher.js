import React from "react";
import {inject, observer} from "mobx-react";
import {action, runInAction} from "mobx";
import {Input, Label} from "reactstrap";

@inject('mainStore') @observer
export default class Switcher extends React.Component {
  @action
  onChange = checked => {
    let {model, name, onChange, disabled, mainStore: {isBusy}} = this.props;
    if (disabled || isBusy)
      return;

    if (model && name) {
      model[name] = checked;
    }
    if (onChange) {
      onChange(checked);
    }
  };

  render() {
    let {model, name, checked = false, disabled, mainStore: {isBusy}} = this.props;
    if (model && name) {
      checked = model[name] || false;
    }

    return (
      <Label className="switch switch-3d switch-primary switch-pill">
        <Input type="checkbox" className="switch-input"
               checked={checked}
               disabled={disabled || isBusy}
               onChange={e => this.onChange(e.target.checked)}/>
        <span className="switch-slider"/>
      </Label>
    )
  }
}
