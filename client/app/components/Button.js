import React from 'react';
import {inject, observer} from 'mobx-react';
import TouchableItem from "./TouchableItem";
import {Text, ActivityIndicator, View, TouchableOpacity} from 'react-native';
import PropTypes from "prop-types";
import vars from "../common/vars";
import Confirm from "./Confirm";
import {Icon} from "react-native-elements";

@inject('mainStore') @observer
export default class Button extends React.Component {

  static propTypes = {
    title: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    danger: PropTypes.bool,
    loading: PropTypes.bool,
    color: PropTypes.string,
  };


  render() {
    const {title, disabled, onPress, style, upperCase, textStyle, loading, mainStore, danger, height, color} = this.props;
    let d = disabled || mainStore.isBusy;
    return (
      <TouchableItem
        disabled={d}
        style={[{
          backgroundColor: d ? vars.borderColor : (danger ? vars.red : (color || vars.primary)),
          borderRadius: 10,
          flexDirection: 'row',
          height: height || 45,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 8,
          marginBottom: 15
        }, style]}
        onPress={onPress}
      >
        {loading && mainStore.isBusy && <ActivityIndicator size="small" color={vars.blueIcon}/>}
        <Text style={[{color: vars.white, textAlign: 'center', fontSize: 18}, textStyle]}>
          {title}
        </Text>
      </TouchableItem>
    )
  }
}

@inject('mainStore') @observer
export class FloatingButton extends React.Component {
  render() {
    const {style, children, onPress, disabled} = this.props;
    return (
      <View style={{position: 'absolute', bottom: 10, width: vars.deviceWidth, alignItems: 'center'}}>
        <TouchableOpacity
          disabled={this.props.mainStore.isBusy || disabled}
          style={[{
            width: 50,
            height: 50,
            borderRadius: 25,
            right: 10,
            backgroundColor: vars.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 5},
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 3,
          }, style]} onPress={onPress}>
          {children}
        </TouchableOpacity>
      </View>
    )
  }
}

export const ConfirmButton = ({buttonTitle, message, onYes, onCancel, ...btnProps}) => (
  <Button title={buttonTitle} onPress={() => {
    Confirm('', message, onYes, onCancel)
  }} {...btnProps}/>
);

export const ActionButton = ({name, onPress, color}) => (
  <TouchableOpacity style={{marginLeft: 20}} onPress={onPress}>
    <Icon name={name} type='font-awesome' color={color || vars.primary}/>
  </TouchableOpacity>
);
