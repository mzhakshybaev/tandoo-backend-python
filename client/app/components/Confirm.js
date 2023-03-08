import React from 'react';
import {Alert} from 'react-native';

export default function (title, message, onYes, onCancel) {
  Alert.alert(
    title,
    message,
    [
      {text: 'Отмена', onPress: () => onCancel, style: 'cancel',},
      {text: 'Да', onPress: onYes},
    ],
    {cancelable: false},
  );
}
