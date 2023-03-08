import React, {Component} from 'react'
import form from 'components/myAccount/ChangePassForm';
import ChangePassView from "components/myAccount/ChangePassView";

class MyAccount extends Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    return (
      <ChangePassView form={form}/>
    )
  }
}

export default MyAccount
