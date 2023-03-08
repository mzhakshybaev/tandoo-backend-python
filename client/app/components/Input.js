import React, {Component} from 'react';
import {Text, TextInput, View} from "react-native";
import {runInAction} from "mobx";
import {inject, observer} from 'mobx-react';
import {Icon} from 'react-native-elements'
import vars from "../common/vars";
import {TextInputMask} from 'react-native-masked-text'
import PropTypes from "prop-types";

@inject('mainStore') @observer
export default class Input extends Component {

  static propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    keyboardType: PropTypes.oneOf(['default', 'email-address', 'numeric', 'phone-pad', 'url', 'number-pad', 'name-phone-pad', 'decimal-pad',]),
    onChange: PropTypes.func,
    required: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {isFocused: false};
  }

  onChange = (value) => {
    let {model, name, onChange} = this.props;
    if (model && name) {
      runInAction(() => model[name] = value);
    }
    if (onChange) {
      onChange(value);
    }
  };

  render() {
    let {
      disabled, keyboardType, placeholder, iconName, iconType, autoFocus, maxLength, placeholderTextColor,
      textColor, containerStyle, model, name, label, onBlur, required,
      mustField, secureTextEntry, multiline, numberOfLines, value, mainStore, ...rest
    } = this.props;

    let text = value;
    if (model && name) {
      text = model[name];
      if (!text) {
        text = value;
      }
    }

    if (!disabled) {
      disabled = mainStore.isBusy;
    }

    text = text ? text.toString() : '';

    return (
      <View style={[{marginBottom: 15,}, containerStyle]}>
        {!!label && <View style={{flexDirection: 'row'}}>
          <Text style={{color: vars.text, fontSize: 14}}>{label}</Text>
          {required && <Text style={{color: 'red'}}>*</Text>}
        </View>}
        <View style={{
          flexDirection: 'row',
          backgroundColor: disabled ? vars.borderColor : vars.white,
          height: 40,
          paddingLeft: 10,
          alignItems: 'center',
          marginTop: 5,
          borderRadius: 5,
          borderColor: this.state.isFocused ? vars.primary : vars.borderColor,
          borderWidth: 1,
        }}>
          {!!iconName &&
          <Icon size={18} name={iconName} type={iconType ? iconType : 'material'}
                iconStyle={{color: vars.text, width: 25}}/>
          }
          <TextInput
            style={{
              color: textColor ? textColor : vars.text,
              paddingVertical: 0,
              paddingLeft: 3,
              flex: 1,
              fontSize: 16
            }}
            onChangeText={this.onChange}
            placeholder={placeholder}
            placeholderTextColor={vars.grey}
            value={text}
            underlineColorAndroid="transparent"
            editable={!disabled}
            autoCorrect={false}
            autoFocus={autoFocus || false}
            keyboardType={keyboardType || 'default'}
            maxLength={maxLength}
            secureTextEntry={secureTextEntry}
            multiline={multiline}
            numberOfLines={numberOfLines}
            autoCapitalize={'none'}
            onFocus={() => this.setState({isFocused: true})}
            onBlur={() => {
              this.setState({isFocused: false});
              if (onBlur) {
                onBlur();
              }
            }}
            {...rest}
          />
        </View>
      </View>
    );
  }
}

@inject('mainStore') @observer
export class InputMask extends Component {

  static propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    keyboardType: PropTypes.oneOf(['default', 'email-address', 'numeric', 'phone-pad', 'url', 'number-pad', 'name-phone-pad', 'decimal-pad',]),
    onChange: PropTypes.func,
    mask: PropTypes.string
  };

  state = {isFocused: false};

  _onChangeText = (text) => {
    const {onChange} = this.props;
    if (onChange) {
      onChange(text);
    }
  };

  render() {
    let {textStyle, containerStyle, value, mask, keyboardType, placeholder, label, disabled, onBlur, mainStore, required, ...rest} = this.props;
    if (!disabled) {
      disabled = mainStore.isBusy;
    }
    return (
      <View style={{marginBottom: 15}}>
        {!!label && <View style={{flexDirection: 'row'}}>
          <Text style={{color: vars.text, fontSize: 14}}>{label}</Text>
          {required && <Text style={{color: 'red'}}>*</Text>}
        </View>}
        <View style={[{
          borderColor: this.state.isFocused ? vars.primary : vars.borderColor,
          paddingLeft: 3,
          borderWidth: 1,
          borderRadius: 5,
          height: 40,
          backgroundColor: disabled ? vars.borderColor : vars.white,
        }, containerStyle]}>

          <TextInputMask
            type={'custom'}
            options={{mask: mask}}
            style={[{fontSize: 16, color: vars.text}, textStyle]}
            placeholder={placeholder}
            underlineColorAndroid="transparent"
            onChangeText={(val) => {
              this._onChangeText(val);
            }}
            value={value || ''}
            keyboardType={keyboardType}
            editable={!disabled}
            onFocus={() => this.setState({isFocused: true})}
            onBlur={() => {
              this.setState({isFocused: false});
              if (onBlur) {
                onBlur();
              }
            }}
            {...rest}
          />
        </View>
      </View>
    )
  }
}
