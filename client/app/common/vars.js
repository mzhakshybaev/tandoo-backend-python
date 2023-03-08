import {Dimensions, Platform} from "react-native";
import DeviceInfo from 'react-native-device-info';
const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;
const platform = Platform.OS;

export default {
  platform,
  deviceWidth,
  deviceHeight,

  placeholder: '#6A8B9E',
  muted: '#7c7c7f',
  grey: '#AAAAAD',
  darkGrey: '#626264',
  text: '#0b0b0b',
  label: '#4b4b4b',
  primary: '#009fcf',
  secondary: '#15843F',

  green: '#15843F',
  blue: '#65A7EA',
  orange: '#ed6b03',
  red: '#ff3506',
  gray: '#A2ADBB',
  deepgreen: '#7FB4B5',

  iconColor: 'rgba(0,0,0,0.3)',

  blueIcon: '#1f7fb3',
  white: "#fff",
  borderColor: '#e3e3e6',
  iconGrey: '#6a6a6c',
  bg: '#ebeff7',
};

export const IMG_URL = '';
