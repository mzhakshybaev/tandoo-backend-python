import React from 'react';
import {ActivityIndicator, Text, View} from "react-native";
import vars from "../common/vars";

const Spinner = () => (
  <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: vars.bg}}>
    <ActivityIndicator size="large" color={vars.primary}/>
  </View>
);

export default Spinner;


export const NoDataView = ({text}) => (
  <Text style={{padding: 30, textAlign: 'center', color: 'grey'}}>{text || 'Нет данных...'}</Text>);
