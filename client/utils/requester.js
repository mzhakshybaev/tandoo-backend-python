import axios from 'axios';
import mainStore from '../stores/MainStore';
import authStore from '../stores/AuthStore';
import {hideMessage, showError} from './messages';
import {get as getValue} from 'lodash-es';

import {getApi, isDevMode} from './common';

const REQUEST_TIMEOUT = 'Время запроса истекло';
const SYSTEM_ERROR = 'Системная ошибка';
const NETWORK_ERROR = 'Ошибка связи';

const API = getApi();

const instance = axios.create({
  baseURL: API,
  timeout: 30000,
  responseType: 'json',
  headers: {},
});

// instance.defaults.headers.post['Content-Type'] = 'multipart/form-data';

let deviceId;

function beforeRequest(config) {
  deviceId = deviceId || mainStore.getDeviceId();

  config.auth = {
    username: deviceId,
    password: authStore.token || '',
  };
  // if (isDevMode()) {
  //   console.log('REQUEST:', config.url, config);
  // }
  hideMessage();
  return config;
}

function afterRequest(response) {
  // if (isDevMode()) {
  //   console.log('RESPONSE:', response.config.url, response);
  // }
  mainStore.setBusy(false);
  const result = response.data.result;
  if (result === 0) {
    return response.data;
  } else {
    if (result === 107) {
      // TODO: mainStore.logout();
    }
    showError(response.data.message || SYSTEM_ERROR);
    return Promise.reject(response);
  }
}

function onRejected(error) {
  mainStore.setBusy(false);
  let msg = error.message || SYSTEM_ERROR;
  if (msg.includes('timeout')) {
    msg = REQUEST_TIMEOUT;
  }
  if (msg.toLowerCase().includes('network error')) {
    msg = NETWORK_ERROR;
  }
  showError(msg);
  return Promise.reject(error);
}

instance.interceptors.request.use(beforeRequest);

instance.interceptors.response.use(afterRequest, onRejected);

export function get(url, params, silent) {
  if (!silent) {
    mainStore.setBusy(true);
  }
  return instance.get(url, {params});
}

export function post(url, param, silent) {
  if (!silent) {
    mainStore.setBusy(true);
  }
  param = param || {};
  param.client = mainStore.getClient();
  param.lang = mainStore.language.code;
  return instance.post(url, param);
}

export async function getAsync(url, prop, param) {
  let r = await get(url, param);
  return prop ? getValue(r, prop) : r;
}

export async function postAsync(url, prop, param) {
  let r = await post(url, param);
  return prop ? getValue(r, prop) : r;
}
