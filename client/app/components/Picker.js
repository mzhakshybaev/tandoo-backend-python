import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import vars from "../common/vars";
import {Icon} from "react-native-elements";

export default ({label, placeholder, value, disabled, onPress, required}) => (
  <View style={{marginBottom: 15,}}>
    {!!label && <View style={{flexDirection: 'row'}}>
      <Text style={{color: vars.text, fontSize: 14}}>{label}</Text>
      {required && <Text style={{color: 'red'}}>*</Text>}
    </View>}
    <TouchableOpacity
      style={{
        borderWidth: 1,
        borderColor: vars.borderColor,
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 5,
        backgroundColor: disabled ? vars.borderColor : vars.white,
        minHeight: 35
      }}
      disabled={disabled}
      onPress={onPress}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {!!value ?
          <Text style={{flex: 1, color: vars.text, fontSize: 16}}>{value} </Text> :
          <Text style={{flex: 1, color: vars.grey, fontSize: 16}}>{placeholder}</Text>
        }
        <Icon name={'arrow-drop-down'} size={30}/>
      </View>
    </TouchableOpacity>
  </View>
)
