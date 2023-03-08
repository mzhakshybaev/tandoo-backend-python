import React from 'react';
import Modal from 'react-native-modal';
import Picker from "./Picker";
import PropTypes from "prop-types";
import {SafeAreaView} from "react-navigation";
import variables from "../common/vars";
import {FlatList, Text, TextInput, View} from "react-native";
import Toolbar, {ToolbarButton} from "./Toolbar";
import Spinner, {NoDataView} from "./Spinner";
import {inject, observer} from "mobx-react";
import {observable} from "mobx";
import TouchableItem from "./TouchableItem";
import {Icon} from "react-native-elements";

const itemStyle = {
  borderBottomColor: variables.borderColor,
  borderBottomWidth: 1,
  paddingHorizontal: 5,
  paddingVertical: 10,
  backgroundColor: variables.white,
  alignItems: 'center',
  flexDirection: 'row'
};

@inject('mainStore', 'dictStore') @observer
export default class CoateSelect extends React.Component {

  @observable options = [];
  @observable isLoading = false;
  @observable data = [];

  constructor(props) {
    super(props);
    this.state = {modalVisible: false, searchText: ''};
  }

  load = async (input) => {
    if (!input || input.length <= 2) return;
    this.isLoading = true;
    this.options = await this.props.dictStore.getCoateListing(input);
    this.isLoading = false;

    this.data = this.options.map(p => ({
      id: p.id,
      name: p.list_parent.join(', ')
    }))
  };

  render() {
    const {value, label, disabled, onSelect, placeholder, required} = this.props;
    let val = value && value.name;
    return <>
      <Picker onPress={this.toggleModal} label={label} value={val} placeholder={placeholder} disabled={disabled}
              required={required}/>
      <Modal isVisible={this.state.modalVisible} onBackButtonPress={this.toggleModal} useNativeDriver
             onBackdropPress={this.toggleModal} style={{backgroundColor: 'white', margin: 0}}>
        <SafeAreaView
          style={{flex: 1, paddingTop: variables.platform === 'ios' ? 20 : 0, backgroundColor: variables.bg}}>
          <Toolbar>
            <Input value={this.state.searchText}
                   placeholder={label}
                   onChange={(searchText) => {
                     this.setState({searchText});
                     this.load(searchText);
                   }}/>
            <ToolbarButton iconType="feather" iconName="x-circle" onPress={() => {
              if (this.state.searchText) {
                this.setState({searchText: ''});
              } else {
                this.toggleModal();
              }
            }}/>

          </Toolbar>
          {this.isLoading ? <Spinner/> :
            <FlatList data={this.data}
                      keyExtractor={(item, index) => index.toString()}
                      ListEmptyComponent={NoDataView}
                      renderItem={obj =>
                        <TouchableItem key={obj.index} style={itemStyle}
                                       onPress={() => {
                                         if (onSelect)
                                           onSelect(obj.item);
                                         this.toggleModal();
                                       }}>
                          <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={{flex: 1, color: variables.text, fontSize: 16}}>{obj.item.name}</Text>
                            <Icon name='chevron-right' containerStyle={{marginRight: 10}} color={variables.primary}
                                  size={20}/>
                          </View>
                        </TouchableItem>}
            />}
        </SafeAreaView>
      </Modal>
    </>
  }

  toggleModal = () => this.setState({modalVisible: !this.state.modalVisible});
}

const Input = ({value, onChange, placeholder}) => (
  <TextInput
    style={{
      color: variables.text,
      paddingVertical: 0,
      paddingLeft: 5,
      flex: 1,
      fontSize: 16,
      backgroundColor: 'white',
      height: 35,
      borderRadius: 3,
      marginRight: 10
    }}
    onChangeText={onChange}
    placeholder={placeholder}
    placeholderTextColor={variables.grey}
    value={value}
    underlineColorAndroid="transparent"
    autoCorrect={false}
    autoCapitalize={'none'}
  />
);

CoateSelect.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.object,
  onSelect: PropTypes.function,
  required: PropTypes.bool
};
