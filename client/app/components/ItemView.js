import React from 'react'
import vars from "../common/vars";
import {Text, View} from "react-native";

export default ({label, value}) => {
  if (typeof value === 'object') {
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: vars.borderColor,
        borderBottomWidth: .5,
        paddingVertical: 5
      }}>
        <Text style={{fontWeight: 'bold', color: vars.text}}>{label}: </Text>
        {value}
      </View>
    )
  }

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomColor: vars.borderColor,
      borderBottomWidth: .5,
      paddingVertical: 5
    }}>
      <Text style={{fontWeight: 'bold', color: vars.text}}>{label}: <Text
        style={{flex: 1, flexWrap: 'wrap', color: vars.text, fontWeight: 'normal'}}>{value}</Text>
      </Text>
    </View>
  )
};
