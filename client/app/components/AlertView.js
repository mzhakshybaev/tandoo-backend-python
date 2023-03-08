import React from 'react'
import {Text, TouchableOpacity} from "react-native";
import vars from "../common/vars";

const AlertView = ({text, type}) => {
  let color = vars.green;
  if (type === 'error') {
    color = vars.red
  }
  if (type === 'warning') {
    color = vars.orange
  }

  return (
    <TouchableOpacity style={{
      padding: 8,
      borderColor: vars.borderColor,
      borderWidth: 1,
      borderRadius: 5,
      backgroundColor: color,
      marginBottom: 10,
      marginHorizontal: 10
    }}>
      <Text style={{color: 'white', fontWeight: 'bold'}}>{text}</Text>
    </TouchableOpacity>
  )
};

export default AlertView;
