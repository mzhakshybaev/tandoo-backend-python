import React, {Component} from 'react';
import {Col, FormFeedback, FormGroup, Input, Label} from "reactstrap";
import {runInAction} from "mobx";
import {inject, observer} from 'mobx-react';

@inject('mainStore') @observer
export default class AppInput extends React.Component {

  constructor(props) {
    super(props);
  }

  _onChangeText = (event) => {
    const {callback, model, name} = this.props;
    let value = event.target.value;
    if (model && name) {
      runInAction(() => model[name] = value);
    }
    if (callback) {
      callback(value);
    }
  };

  render() {
    let {disabled, mainStore, model, name, value, callback, ...rest} = this.props;
    let val = (value === undefined || value === null) ? '' : value;
    if (model && name) {
      val = model[name];
    }
    return (
      <Input value={val}
             onChange={this._onChangeText}
             disabled={mainStore.isBusy || disabled}
             {...rest}/>
    );
  }
}

export class FG extends React.Component {
  render() {
    const {l, c, f, ...rest} = this.props;
    return (
      <FormGroup {...rest}>
        {l && <Label>{l}</Label>}
        {c}
        <FormFeedback>{f}</FormFeedback>
      </FormGroup>
    )
  }
}

export class Required extends React.Component {
  render() {
    return <span className="text-danger">*</span>
  }
}

export class FGI extends React.Component {
  render() {
    const {l, children, f, lf, ls, className, required} = this.props;
    return (
      <FormGroup row className={className}>
        <Label sm={lf}>
          {l}
          {required && <Required/>}
        </Label>
        <Col sm={ls}>
          {children}
          <FormFeedback>{f}</FormFeedback>
        </Col>
      </FormGroup>
    )
  }
}


export class FormInput extends React.Component {
  render() {
    const {label, children, fb} = this.props;
    return (
      <FormGroup row>
        <Col md="3">
          <Label htmlFor="text-input">{label}</Label>
        </Col>
        <Col xs="12" md="9">
          {children}
          <FormFeedback>{fb}</FormFeedback>
        </Col>
      </FormGroup>
    )
  }
}


export class Fg extends Component {
  render() {
    const {label, children, ...rest} = this.props;
    return (
      <FormGroup {...rest}>
        <Label>{label}</Label>
        {children}
      </FormGroup>
    )
  }
}
