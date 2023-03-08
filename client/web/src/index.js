import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'mobx-react';
import 'utils/helpers';
import 'utils/lang';

import Root from './root';
import {createStorage} from 'utils/LocalStorage';
import stores from 'stores';
import 'nodelist-foreach-polyfill';

import 'react-table/react-table.css';
import 'react-select/dist/react-select.css';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.css';
import '../scss/style.scss';

import Keycloak from 'keycloak-js'
import {KeycloakProvider} from '@react-keycloak/web'

createStorage(window.localStorage);

let serverUrl = 'https://eds.zakupki.gov.kg/auth/'; // prod
// let serverUrl = 'https://cs.zakupki.gov.kg/auth/'; // test

if (window.location.origin === "http://t-tandoo.ictlab.kg") {
  serverUrl = 'https://cs.zakupki.gov.kg/auth/';
}

console.log(window.location.origin, serverUrl);

const keycloak = new Keycloak({
  url: serverUrl,
  realm: 'etender',
  clientId: 'tandoo-service-frontend',
  onLoad: 'login-required',
  "ssl-required": "all",
  "resource": 'tandoo-service-frontend',
  "public-client": true,
  "confidential-port": 0,
});

const redirectUrl = window.location.origin + '/#/keycloak';

const keycloakInit = {
  // onLoad: 'login-required',
  onLoad: 'check-sso',
  // redirectUri: redirectUrl,
  enableLogging: true,
  responseMode: 'query',
};

const App = () => {

  const [busy, setBusy] = React.useState(true);

  const onKeycloakEvent = (event, error) => {
    // console.log('onKeycloakEvent', event, error)
  };

  const onKeycloakTokens = (tokens) => {
    if (tokens.token) {
      stores.authStore.userToken(tokens.token).then((res) => {
        setBusy(false);
        if (res.company.company_status === "draft" && res.company.company_type === "supplier") {
          window.location.replace('/#/supplier/company/qualification');
        }
      }).catch(e => {
        setBusy(false);
        console.log(e);
        keycloak.logout();
      });
    } else {
      stores.authStore.logout();
      setBusy(false);
    }
  };

  return (
    <KeycloakProvider
      keycloak={keycloak}
      initConfig={keycloakInit}
      onEvent={onKeycloakEvent}
      onTokens={onKeycloakTokens}
    >
      <Provider {...stores}>
        <Root/>
      </Provider>
    </KeycloakProvider>)
};

ReactDOM.render(<App/>, document.getElementById('root'));


