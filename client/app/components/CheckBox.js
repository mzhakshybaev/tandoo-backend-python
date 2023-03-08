import React, {Component} from 'react';
import {CheckBox as Chk, Icon} from 'react-native-elements'
import {runInAction} from "mobx";
import variables from "../common/vars";
import {Text, TouchableOpacity} from "react-native";

export default class CheckBox extends Component {

  state = {value: false};

  onChange = () => {
    const {onChange, model, name} = this.props;
    let val = !this.state.value;
    if (model && name) {
      runInAction(() => model[name] = val);
    }
    if (onChange) {
      onChange(val);
    }
    this.setState({value: val})
  };

  componentDidMount() {
    let {checked, model, name} = this.props;
    let val = checked || false;
    if (model && name) {
      val = model[name] || false;
    }
    val = val === undefined || val === null ? false : val;
    this.setState({value: val})
  }

  render() {
    const {model, name, disabled, containerStyle, ...rest} = this.props;
    let val = this.state.value;
    if (model && name) {
      val = model[name] || false;
    }
    val = val === undefined || val === null ? false : val;

    return (
      <Chk
        onPress={() => {
          if (!disabled)
            this.onChange()
        }}
        checkedColor={variables.primary}
        uncheckedColor={variables.text}
        checkedIcon='checkbox-marked-outline'
        uncheckedIcon='checkbox-blank-outline'
        iconType='material-community'
        checked={val}
        containerStyle={[{
          backgroundColor: 'transparent',
          borderWidth: 0,
          marginBottom: 15,
          paddingVertical: 0,
          marginHorizontal: 0,
          paddingHorizontal: 0
        }, containerStyle]}
        textStyle={{color: variables.text, fontWeight: 'normal', fontSize: 14}}
        {...rest}/>
    )
  }
}

export const RadioBox = ({checked, label, onChange, disabled}) => (
  <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}} onPress={() => {
    if (!disabled) {
      onChange();
    }
  }}>
    <Icon name={checked ? 'radio-button-checked' : 'radio-button-unchecked'} color={variables.primary}/>
    <Text style={{flex: 1, color: variables.text, marginLeft: 10}}>{label}</Text>
  </TouchableOpacity>
);


