import React, {Component} from 'react';
import {runInAction} from "mobx";
import {Button, ButtonGroup, FormGroup, Input, Label} from "reactstrap";

export default class RadioButtons extends Component {

  state = {value: ''};

  onChange = (val) => {
    const {onChange, model, name} = this.props;
    if (model && name) {
      runInAction(() => model[name] = val);
    }
    if (onChange) {
      onChange(val);
    }
    this.setState({value: val.toString()})
  };

  componentDidMount() {
    let {value, model, name} = this.props;
    let val = value;
    if (model && name) {
      val = model[name];
    }
    val = val === undefined || val === null ? '' : val.toString();
    this.setState({value: val})
  }

  render() {
    let {items, inline, valueName, labelName, model, name} = this.props;
    if (!items || items.length === 0) return null;

    labelName = labelName || 'label';
    valueName = valueName || 'value';

    let val = this.state.value;
    if (model && name) {
      val = model[name];
    }
    val = val === undefined || val === null ? '' : val.toString();
    return (
      <div>
        {items.map((i, idx) =>
          <FormGroup key={idx} check inline={inline}>
            <Input className="form-check-input" type="radio"
                   id={'radio' + idx} name="inline-radios"
                   value={i[valueName].toString()}
                   checked={i[valueName].toString() === val}
                   onChange={(event) => this.onChange(event.target.value)}
            />
            <Label className="form-check-label" check htmlFor={'radio' + idx}>{i[labelName]}</Label>
          </FormGroup>
        )}
      </div>
    )
  }
}

export class AppButtonGroup extends Component {

  state = {value: {}};

  onChange = (val) => {
    const {onChange, model, name} = this.props;
    if (model && name) {
      runInAction(() => model[name] = val);
    }
    if (onChange) {
      onChange(val);
    }
    this.setState({value: val})
  };

  componentDidMount() {
    let {value, model, name, items, valueName} = this.props;
    valueName = valueName || 'value';
    let val;
    if (value) {
      val = typeof value === "object" ? value : items.find(i => i[valueName] === value);
    }
    if (model && name) {
      val = model[name];
    }
    this.setState({value: val})
  }

  render() {
    let {items, valueName, labelName, model, name} = this.props;
    if (!items || items.length === 0) return null;

    labelName = labelName || 'label';
    valueName = valueName || 'value';

    let val = this.state.value;
    if (model && name) {
      val = model[name];
    }
    return (
      <ButtonGroup>
        {items.map((i, idx) =>
          <Button key={idx} color="primary"
                  outline className={val && val[valueName] === i[valueName] ? 'active' : ''}
                  onClick={() => this.onChange(i)}
          >
            {i[labelName]}
          </Button>
        )}
      </ButtonGroup>
    )
  }
}
