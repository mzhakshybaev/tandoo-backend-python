import React from 'react';
import {inject, observer} from "mobx-react";
import Loading from "../components/Loading";

@inject('authStore')
@observer

export default class Login extends React.Component {
  async componentDidMount() {
    const {authStore, match, history} = this.props;
    const token = match.params.token;
    authStore.jwtLogin(token).then(() => {
      history.push('/');
    })
  }

  render() {
    return (
      <Loading/>
    )
  }
}
