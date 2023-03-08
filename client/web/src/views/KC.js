import React from 'react';
import {withKeycloak} from '@react-keycloak/web'
import Loading from "../components/Loading";

@withKeycloak
export default class KC extends React.Component {

  componentDidMount() {
    const {keycloak, history} = this.props;
    if (keycloak.authenticated) {
      history.push('/');
    } else {
      keycloak.login();
    }
  }

  render() {
    return (
      <Loading/>
    );
  }
}
