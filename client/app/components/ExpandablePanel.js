import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {Icon} from "react-native-elements";
import vars from "../common/vars";
import Collapsible from 'react-native-collapsible';
import Card from "./Card";

export default ({expanded, onPress, title, children}) => (
  <Card>
    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={onPress}>
      <Text style={{flex: 1, fontWeight: 'bold'}}>{title}</Text>
      <Icon name={expanded ? 'arrow-drop-up' : 'arrow-drop-down'}/>
    </TouchableOpacity>
    <Collapsible collapsed={!expanded}>
      <View style={{padding: 1, backgroundColor: vars.borderColor, marginVertical: 10}}/>
      {children}
    </Collapsible>
  </Card>
);
