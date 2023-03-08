import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import {withRouter} from "react-router-dom";
import {translate} from "react-i18next";

@translate(['common', 'settings', '']) @inject("authStore") @withRouter @observer
export default class Registration extends Component {
  constructor(props) {
    super(props);
    const {t} = props;
    this.state = {

    }
  }

  render() {
    const {t} = this.props;
    return (
      <div/>
    )
  }
}
