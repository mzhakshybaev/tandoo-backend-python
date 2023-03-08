import React, {Component} from 'react'
import {Dimensions, Modal, SafeAreaView, ScrollView, TextInput, TouchableOpacity, View} from 'react-native';
import {inject, observer} from 'mobx-react';
import {Icon, Text} from "react-native-elements";
import vars from "../../common/vars";
import Toolbar, {ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import {PopupList} from "../../components/PopupList";
import {toJS} from "mobx";
import CheckBox from "../../components/CheckBox";
import Image from "../../components/AppImage";
import {IMAGES_URL} from "../../../utils/common";
import {formatMoney} from "../../../utils/helpers";
import TouchableItem from "../../components/TouchableItem";
import ScreenWrapper from "../../components/ScreenWrapper";
import Spinner, {NoDataView} from "../../components/Spinner";
import {showError} from "../../../utils/messages";

const screenWidth = Math.round(Dimensions.get('window').width);
const itemWidth = screenWidth / 2 - 20;

@inject('mainStore', 'authStore', 'purCatalogCtrl') @observer
export default class Catalog extends Component {

  componentDidMount() {
    const {purCatalogCtrl, navigation} = this.props;
    this.ctrl = purCatalogCtrl;
    let ann_id = navigation.getParam('id');
    this.load(ann_id);
  }

  componentWillUnmount() {
    this.ann_id = null;
    this.ctrl.reset();
  }

  setItem(lang = this.props.mainStore.language.code) {
    this.lang = lang;
  }

  load(ann_id) {
    this.ann_id = ann_id;
    this.ctrl.load(ann_id);
  }

  render() {
    const {navigation, purCatalogCtrl} = this.props;
    let {sections, sectionCategories, section, selectSection, filters} = purCatalogCtrl;

    const Header = (
      <Toolbar>
        <ToolbarButton back onPress={() => navigation.popToTop()}/>
        <ToolbarTitle>Каталог</ToolbarTitle>
        <ToolbarButton disabled={!filters} onPress={() => navigation.toggleDrawer()} iconType='feather'
                       iconName='list' color={filters ? 'white' : vars.muted}/>
      </Toolbar>
    );

    return (
      <ScreenWrapper header={Header}>
        <PopupList items={toJS(sections)}
                   disabled={!sections || sections.length === 0}
                   placeholder="Выберите раздел"
                   valueCode={'_id'}
                   valueName={'name'}
                   model={purCatalogCtrl} name={'section'}
                   onChange={selectSection}
                   style={{marginBottom: 0}}
        />

        <PopupList items={toJS(sectionCategories)}
                   placeholder="Выберите категорию"
                   disabled={!section}
                   valueCode={'id'}
                   valueName={'name'}
                   model={purCatalogCtrl} name={'category'}
                   renderItem={(item) => <View style={{flexDirection: 'row', alignItems: 'center'}}>
                     <Text style={{color: vars.text, fontSize: 16, flex: 1}}>{item.dircategory.name}</Text>
                     <Icon name='chevron-right' containerStyle={{marginRight: 10}} color={vars.primary}
                           size={20}/>
                   </View>}
                   renderValue={(val) => <Text style={{
                     flex: 1, backgroundColor: 'transparent', fontSize: 16, color: vars.text,
                   }}> {val.dircategory.name}
                   </Text>}
                   onChange={this.selectCategory}
                   style={{marginTop: 5, marginBottom: 10}}
        />
        {this.renderProducts()}
      </ScreenWrapper>
    )
  }

  selectCategory = (category) => {
    const {purCatalogCtrl} = this.props;
    purCatalogCtrl.setBreadcrumbSection();
    purCatalogCtrl.selectCategory(category);
    purCatalogCtrl.setBreadcrumbCategory(category, true);
  };

  renderProducts = () => {
    const {purCatalogCtrl, navigation, mainStore} = this.props;
    let {products, section, category} = purCatalogCtrl;

    if (!products || !products.length) {
      if (mainStore.isBusy)
        return <Spinner/>;
      else if (section && category)
        return <NoDataView/>;
      else
        return null;
    }

    return (
      <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around'}}>
        {products.map(p =>
          <TouchableOpacity key={p._id}
                            onPress={() => navigation.navigate('productView', {id: p._id})}
                            style={{
                              backgroundColor: vars.white, margin: 5,
                              shadowColor: vars.grey,
                              shadowOffset: {
                                width: 0,
                                height: 3
                              },
                              shadowRadius: 5,
                              shadowOpacity: .5,
                              elevation: 3,
                              width: itemWidth,
                              borderRadius: 3
                            }}>
            <Text style={{
              position: 'absolute',
              zIndex: 100,
              top: 0,
              right: 0,
              backgroundColor: '#FFD071',
              color: '#684802',
              fontSize: 12,
              padding: 3,
              fontWeight: 'bold'
            }}>{formatMoney(p.unit_price)}</Text>
            <Image style={{width: '100%', height: 100}} resizeMode={'contain'} source={{uri: IMAGES_URL + p.image}}/>
            <View style={{padding: 5}}>
              <Text style={{color: vars.muted, fontSize: 14, textAlign: 'center'}}>Код {p.code}</Text>
              <Text style={{color: vars.text, textAlign: 'center'}}>{p["Товарные знаки(марка, бренд)"]}</Text>
            </View>
            {this.props.authStore.isPurchaser &&
            <TouchableItem style={{backgroundColor: vars.primary, padding: 5, paddingVertical: 10}}
                           onPress={() => this.handleAddLot(p)}>
              <Text style={{color: vars.white, textAlign: 'center'}}>Добавить товар</Text>
            </TouchableItem>}

          </TouchableOpacity>
        )}

      </View>
    )
  };

  handleAddLot = async (p) => {
    let {navigation} = this.props;
    try {
      await this.ctrl.addLot(p);
      navigation.navigate('purchaser/basket', {id: this.ann_id});
    } catch (e) {
      showError(e.message || 'Ошибка');
    }
  };
}

@inject('mainStore', 'authStore', 'purCatalogCtrl') @observer
export class CatalogFilter extends Component {
  render() {
    const {purCatalogCtrl} = this.props;
    let {filters, selectSpec, setLocal, local, selectDict} = purCatalogCtrl;

    if (!filters) return <NoDataView/>;

    return (
      <SafeAreaView style={{flex: 1, backgroundColor: vars.white}}>
        <ScrollView>
          <CheckBox title={"Отечественная продукция"}
                    checked={local}
                    onPress={() => setLocal(local === undefined ? false : !local)}/>

          {filters.dictionaries && filters.dictionaries.map((d, i) =>
            <View key={i}>
              <Text style={{
                fontWeight: 'bold',
                marginBottom: 5,
                padding: 5,
                backgroundColor: vars.bg,
              }}>{d.displayName}</Text>
              {d.values.map((dv, j) =>
                <CheckBox key={j} id={dv.name}
                          title={dv.name}
                          checked={dv.checked}
                          disabled={dv._disabled}
                          onPress={() => selectDict(dv, !dv.checked)}
                />
              )}
            </View>
          )}

          {filters.specifications && filters.specifications.map((s, i) =>
            <View key={i}>
              <Text style={{fontWeight: 'bold', marginBottom: 5, backgroundColor: vars.bg,}}>{s.property}</Text>
              {s.values.map((sv, j) =>
                <CheckBox key={j} id={sv.name}
                          title={sv.name}
                          checked={sv.checked}
                          onPress={() => selectSpec(sv, !sv.checked)}
                />
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    )
  }
}


@inject('catalogStore') @observer
class Search extends React.Component {
  state = {visible: false, value: '', item: null};

  componentDidMount() {
    this.setState({items: this.props.catalogStore.categories.slice()});
  }

  filterItems = (i) => {
    if (this.state.value) {
      return i.dircategory.name.includes(this.state.value.toLocaleLowerCase());
    } else return true;
  };

  render() {
    const {onPress, catalogStore, items, item} = this.props;
    return (
      <View>
        <TouchableOpacity
          style={{flexDirection: 'row', backgroundColor: 'white', padding: 15, alignItems: 'center'}}
          activeOpacity={0.3}
          onPress={() => this.setState({visible: true})}>
          <Text
            style={{
              flex: 1,
              fontSize: 16
            }}>{this.state.item ? this.state.item.dircategory.code + ' : ' + this.state.item.dircategory.name : 'Выберите категорию'}</Text>
          <Icon name='keyboard-arrow-down' size={25}/>
        </TouchableOpacity>

        <Modal direction="alternate" visible={this.state.visible}
               onBackButtonPress={() => this.setState({visible: false})}
               animationType={'fade'} transparent={true}
               onRequestClose={() => this.setState({visible: false})}>

          <TouchableOpacity style={{backgroundColor: 'rgba(0,0,0, .5)', flex: 1}} activeOpacity={1}
                            onPress={() => this.setState({visible: false})}>
            <View style={{
              backgroundColor: 'white',
              paddingHorizontal: 15,
              paddingVertical: 3,
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: 10, marginTop: 5, borderRadius: 3
            }}>
              <Icon name='search' type='feather' color={vars.muted} size={22}/>
              <TextInput style={{flex: 1, height: 50, fontSize: 16, paddingLeft: 8}}
                         underlineColorAndroid="transparent"
                         autoCapitalize={'none'}
                         placeholder={'Поиск...'}
                         value={this.state.value}
                         onChangeText={(v) => this.setState({value: v})}/>
              {this.state.value === '' ? <Icon name='close-circle' color={vars.muted} type='material-community'
                                               onPress={() => this.setState({visible: false})}/> :
                <Icon name='close-circle' color={vars.muted} type='material-community'
                      onPress={() => this.setState({value: ''})}/>}
            </View>

            <View style={{backgroundColor: 'white', marginHorizontal: 10, marginTop: 3, borderRadius: 3,}}>
              <ScrollView>
                {catalogStore.categories.filter(this.filterItems).map(item =>
                  <TouchableOpacity key={item.id} style={{
                    borderBottomColor: '#ddd',
                    borderBottomWidth: .5,
                    padding: 10,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }} onPress={() => {
                    if (onPress) {
                      onPress(item);
                    }
                    this.setState({visible: false, item: item});
                  }}>
                    <Text style={{color: vars.text}}>{item.dircategory.name}</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    )
  }
}






