import React from 'react';
import {AsyncStorage, YellowBox} from 'react-native';
import {Provider} from 'mobx-react';
import {createStorage} from '../utils/LocalStorage';
import stores from '../stores';
import {SpinnerAlertProvider} from './components/Alert';

import '../utils/i18n';
import '../utils/lang';
import Route from './Routes';

createStorage(AsyncStorage);

YellowBox.ignoreWarnings([
  'Warning: componentWillReceiveProps',
  'Warning: componentWillMount',
  'Setting Drawer',
]);

export default () => (
  <Provider {...stores}>
    <SpinnerAlertProvider>
      <Route/>
    </SpinnerAlertProvider>
  </Provider>
);
