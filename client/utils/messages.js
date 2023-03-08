import mainStore from '../stores/MainStore';

export function showSuccess(message) {
  showMessage('success', message);
}

export function showError(message) {
  showMessage('error', message);
}

export function showInfo(message) {
  showMessage('info', message);
}

export function showWarning(message) {
  showMessage('warn', message);
}

export function showLogin() {
  showMessage('login');
}

export function showMessage(level, message) {
  // TODO: refactor
  mainStore.setMessage(level, message);
}

export function hideMessage() {
  mainStore.setMessage(null, null);
}
