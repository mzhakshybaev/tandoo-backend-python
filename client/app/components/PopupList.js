import React, {Component} from 'react';
import {FlatList, Text, TextInput, TouchableOpacity, View} from "react-native";
import {Icon} from "react-native-elements";
import Modal from "react-native-modal";
import {runInAction} from "mobx";
import Toolbar, {ToolbarButton, ToolbarTitle} from "./Toolbar";
import variables from "../common/vars";
import {inject, observer} from 'mobx-react';
import TouchableItem from "./TouchableItem";
import {SafeAreaView} from "react-navigation";
import PropTypes from "prop-types";
import {NoDataView} from "./Spinner";

@inject('mainStore') @observer
export class PopupList extends Component {

  static propTypes = {
    label: PropTypes.string,
    items: PropTypes.array,
    valueCode: PropTypes.string,
    valueName: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    required: PropTypes.bool
  };


  constructor(props) {
    super(props);
    this.state = {modalVisible: false, items: [], value: ''}
  }

  toggleModal = () => this.setState({modalVisible: !this.state.modalVisible, value: ''});

  componentWillMount() {
    this.setState({items: this.props.items || []});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.items !== this.props.items) {
      this.setState({items: nextProps.items || []});
    }
  }

  render() {

    let {style, disabled, model, name, placeholder, renderValue, textColor, valueCode, valueName, clearable, onClearPress, label, value, required} = this.props;

    if (!disabled) {
      disabled = this.props.mainStore.isBusy;
    }

    valueName = valueName || 'name';
    valueCode = valueCode || 'code';
    if (model && name) {
      value = model[name];
    }

    let text = '';
    if (!value && placeholder)
      text = placeholder;
    if (value && typeof value === "object")
      text = value[valueName];
    if (value && typeof value !== "object") {
      let i = this.state.items.find(i => i[valueCode] === value);
      text = i ? i[valueName] : value;
    }

    return (
      <View style={[{marginBottom: 15}, style]}>
        {!!label && <View style={{flexDirection: 'row'}}>
          <Text style={{color: variables.text, fontSize: 14}}>{label}</Text>
          {required && <Text style={{color: 'red'}}>*</Text>}
        </View>}
        <View style={{
          borderColor: variables.borderColor,
          borderWidth: 1,
          borderRadius: 5,
          backgroundColor: disabled ? variables.borderColor : variables.white,
        }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              minHeight: 40,
              alignItems: 'center',
              paddingLeft: 5
            }}
            onPress={this.toggleModal}
            disabled={disabled}>
            {renderValue && value ? renderValue(value) :
              <Text style={{
                flex: 1, backgroundColor: 'transparent', fontSize: 16,
                color: value ? (textColor ? textColor : variables.text) : variables.grey,
              }}>
                {text}
              </Text>
            }
            {clearable && value &&
            <Icon size={22} name='delete' type={'feather'} iconStyle={{color: variables.grey}}
                  onPress={() => {
                    if (model && name) {
                      runInAction(() => model[name] = null);
                    }
                    if (onClearPress)
                      onClearPress();
                  }}/>}
            <Icon size={30} name='arrow-drop-down' iconStyle={{color: variables.text}}/>
          </TouchableOpacity>

          <Modal isVisible={this.state.modalVisible} onBackButtonPress={this.toggleModal} useNativeDriver
                 onBackdropPress={this.toggleModal} style={{backgroundColor: 'white', margin: 0}}>
            <SafeAreaView
              style={{flex: 1, paddingTop: variables.platform === 'ios' ? 20 : 0, backgroundColor: variables.primary}}>
              {this.renderToolbar()}
              <View style={{flex: 1, backgroundColor: variables.bg}}>
                {this.renderItems()}
              </View>
            </SafeAreaView>
          </Modal>
        </View>
      </View>
    )
  }

  renderToolbar() {
    const {searchable, title, label} = this.props;

    return (
      <Toolbar>
        {searchable ? <View/> :
          <ToolbarButton iconType="feather" iconName="x-circle" onPress={() => this.toggleModal()}/>}
        {searchable ?
          <View style={{
            flexDirection: 'row',
            paddingHorizontal: 5,
            marginVertical: 5,
            borderColor: variables.borderColor,
            borderWidth: 1,
            borderRadius: 3,
            flex: 1,
            alignItems: 'center',
            backgroundColor: '#eee'
          }}>
            <Icon name='search' type='feather' color={variables.muted} size={22}/>
            <TextInput
              placeholder={'Поиск...'}
              underlineColorAndroid="transparent"
              style={{flex: 1, height: 40, fontSize: 16}}
              value={this.state.value}
              autoFocus={true}
              onChangeText={(v) => this.setState({value: v})}/>
            <TouchableOpacity onPress={() => this.toggleModal()}>
              <Icon name='close-circle' color={variables.muted} type='material-community'/>
            </TouchableOpacity>
          </View> : <ToolbarTitle>{title ? title : (label || 'Список')}</ToolbarTitle>}
        {searchable ? <View/> : <View style={{width: 40}}/>}
      </Toolbar>
    )
  }

  renderItems() {
    let {valueName, renderItem} = this.props;
    const {items} = this.state;
    valueName = valueName || 'name';
    if (!items || items.length === 0)
      return (<NoDataView/>);

    let style = {
      borderBottomColor: variables.borderColor,
      borderBottomWidth: 1,
      paddingHorizontal: 5,
      paddingVertical: 10,
      backgroundColor: variables.white,
      alignItems: 'center',
      flexDirection: 'row'
    };

    let data = items;
    if (this.state.value) {
      data = items.filter(i => i[valueName].toLocaleLowerCase().includes(this.state.value.toLocaleLowerCase()));
    }

    return (
      <FlatList data={data} keyExtractor={(item, index) => index.toString()} renderItem={obj =>
        <TouchableItem key={obj.index} style={style}
                       onPress={() => {
                         const {model, name, onChange} = this.props;
                         let val = obj.item;
                         if (model && name) {
                           runInAction(() => model[name] = val);
                         }
                         if (onChange)
                           onChange(val);
                         this.toggleModal();
                       }}>
          {renderItem ? renderItem(obj.item) :
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{flex: 1, color: variables.text, fontSize: 16}}>{obj.item[valueName]}</Text>
              <Icon name='chevron-right' containerStyle={{marginRight: 10}} color={variables.primary} size={20}/>
            </View>}
        </TouchableItem>}
      />
    )
  }
}
