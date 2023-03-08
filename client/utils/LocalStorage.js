import Storage from 'react-native-storage';

// Local storage wrapper for both react-native(AsyncStorage) and browser(localStorage)
let myStorage;

export function createStorage(backend) {
  if (!myStorage) {
    myStorage = new Storage({
      size: 1000,
      storageBackend: backend,
      defaultExpires: null,
      enableCache: true,
      sync: {}
    });
  }

  return myStorage;
}

export function getStorage() {
  return myStorage;
}

// Get value
export async function storageGet(key) {
  try {
    return await myStorage.load({key})
  } catch (e) {}
}

// Save value
export function storageSave(key, data) {
  return myStorage.save({key, data});
}

// Remove value
export function storageRemove(key) {
  return myStorage.remove({key});
}
