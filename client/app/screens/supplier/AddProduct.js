import React, {Component} from 'react'
import {Dimensions, SafeAreaView, ScrollView, TouchableOpacity, View} from 'react-native';
import {inject, observer} from 'mobx-react';
import Toolbar, {Title, ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import Image from "../../components/AppImage";
import {IMAGES_URL} from "../../../utils/common";
import Button from "../../components/Button";
import {showError, showSuccess} from "../../../utils/messages";
import Input from "../../components/Input";
import ScreenWrapper from "../../components/ScreenWrapper";
import Card from "../../components/Card";
import ItemView from "../../components/ItemView";
import DatePicker from "../../components/DatePicker";
import moment from "moment";
import vars from "../../common/vars";
import {PopupList} from "../../components/PopupList";
import {toJS} from "mobx";
import {Icon, Text} from "react-native-elements";
import Spinner, {NoDataView} from "../../components/Spinner";
import TouchableItem from "../../components/TouchableItem";
import CheckBox from "../../components/CheckBox";

const rejectDisplayKeys = ['image', '_id', 'product_id', 'unit_price', 'date_end', 'quantity', 'date_add', 'date_update', 'status'];

const screenWidth = Math.round(Dimensions.get('window').width);
const itemWidth = screenWidth / 2 - 20;

@inject('supMyProductsEditCtrl', 'catalogStore') @observer
export default class AddProduct extends React.Component {
  componentDidMount() {
    this.props.supMyProductsEditCtrl.init();
  }

  componentWillUnmount() {
    this.props.supMyProductsEditCtrl.reset();

  }

  handleSave = async () => {
    const {supMyProductsEditCtrl, navigation} = this.props;
    try {
      await supMyProductsEditCtrl.save();

      showSuccess("Успешно сохранен");
      navigation.navigate("supplier/products");

    } catch (e) {
      showError(e && e.message || "Ошибка сохранения")
    }
  };

  render() {
    const {navigation, supMyProductsEditCtrl, catalogStore} = this.props;
    const {product, unit_price, date_end, setProduct, setDate, setUnitPrice, canSubmit} = supMyProductsEditCtrl;
    const {filters} = catalogStore;

    const Header = (
      <Toolbar>
        <ToolbarButton back onPress={() => navigation.popToTop()}/>
        <ToolbarTitle>{!product ? 'Добавление товара' : 'Продукт'}</ToolbarTitle>
        {!product &&
        <ToolbarButton disabled={!filters} onPress={() => navigation.toggleDrawer()} iconType='feather'
                       iconName='list' color={filters ? 'white' : vars.muted}/>}
      </Toolbar>
    );

    const displayKeys = product ? Object.keys(product).withoutArr(rejectDisplayKeys) : [];

    return (
      <ScreenWrapper header={Header}>
        {!product ? <Catalog onAddProduct={(p) => setProduct({...p, product_id: p._id}, true)}/> :
          <>
            <Title style={{textAlign: 'center', fontSize: 20, padding: 10}}>Добавление/редактирование продукции</Title>
            <Card style={{padding: 10, backgroundColor: 'white', margin: 5}}
                  title={product["Товарные знаки(марка, бренд)"]}>
              <Image style={{width: '100%', height: 250}} resizeMode={'contain'}
                     source={{uri: IMAGES_URL + product.image}}/>
              {displayKeys.map((key, i) => <ItemView key={i} label={key} value={product[key]}/>)}
              {false &&
              <Input placeholder='0'
                     label={'Количество товара в наличиии'}
                     value={0}
                     keyboardType='numeric'
                     onChange={v => console.log(v)}/>}

              <Input placeholder='0'
                     label={'Цена за единицу, сом'}
                     keyboardType='numeric'
                     value={unit_price}
                     onChange={value => setUnitPrice(value)}/>

              <DatePicker label={'Срок истечения цены'}
                          value={date_end}
                          minimumDate={moment()}
                          maximumDate={moment().add(2, 'month')}
                          placeholder={'Дата, время'}
                          onChange={setDate}/>

              <Button title={'Сохранить и добавить в Мой каталог"'}
                      disabled={!canSubmit}
                      onPress={this.handleSave}
              />
            </Card>
          </>}
      </ScreenWrapper>
    )
  }
}

@inject("catalogStore", "authStore", 'mainStore') @observer
class Catalog extends React.Component {

  componentDidMount() {
    this.props.catalogStore.load();
  }

  componentWillUnmount() {
    this.props.catalogStore.reset();
  }

  onAddProduct = product => {
    const {onAddProduct, catalogStore} = this.props;
    if (onAddProduct) {
      onAddProduct(product);
      return;
    }

    catalogStore.selectedProduct = {
      ...product,
      product_id: product._id
    };
    // navigation.navigate('supplier/products/add');
  };

  isSupplier = () => {
    let {company} = this.props.authStore;
    return !!company;
  };

  render() {
    const {catalogStore} = this.props;
    const {products, sections, sectionCategories, section, onSelectSection, onSelectCategory, category} = catalogStore;

    return (
      <>
        <PopupList items={toJS(sections)}
                   disabled={!sections || sections.length === 0}
                   placeholder="Выберите раздел"
                   valueCode={'_id'}
                   valueName={'name'}
                   value={section}
                   onChange={onSelectSection}
                   style={{marginBottom: 0}}
        />

        <PopupList items={toJS(sectionCategories)}
                   placeholder="Выберите категорию"
                   disabled={!section}
                   valueCode={'id'}
                   valueName={'name'}
                   renderItem={(item) => <View style={{flexDirection: 'row', alignItems: 'center'}}>
                     <Text style={{color: vars.text, fontSize: 16, flex: 1}}>{item.dircategory.name}</Text>
                     <Icon name='chevron-right' containerStyle={{marginRight: 10}} color={vars.primary}
                           size={20}/>
                   </View>}
                   renderValue={(val) => <Text style={{
                     flex: 1, backgroundColor: 'transparent', fontSize: 16, color: vars.text,
                   }}> {val.dircategory.name}
                   </Text>}
                   value={category}
                   onChange={onSelectCategory}
                   style={{marginTop: 5, marginBottom: 10}}
        />
        {this.renderProducts(products)}
      </>
    )
  }

  renderProducts = (products) => {
    const {mainStore} = this.props;
    if (!products || !products.length) {
      if (mainStore.isBusy)
        return <Spinner/>;
      else
        return <NoDataView/>;
    }

    return (
      <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around'}}>
        {products.map(p =>
          <TouchableOpacity key={p._id}
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
            <Image style={{width: '100%', height: 100}} resizeMode={'contain'} source={{uri: IMAGES_URL + p.image}}/>
            <View style={{padding: 5}}>
              <Text style={{color: vars.muted, fontSize: 14, textAlign: 'center'}}>Код {p.code}</Text>
              <Text style={{color: vars.text, textAlign: 'center'}}>{p["Товарные знаки(марка, бренд)"]}</Text>
            </View>
            {this.isSupplier() &&
            <>
              {p.exist ?
                <Text style={{textAlign: 'center', backgroundColor: vars.green, color: vars.white, fontWeight: 'bold'}}>
                  Уже добавлен
                </Text>
                :
                <TouchableItem style={{backgroundColor: vars.primary, padding: 5, paddingVertical: 10}}
                               onPress={() => this.onAddProduct(p)}>
                  <Text style={{color: vars.white, textAlign: 'center'}}>Добавить товар</Text>
                </TouchableItem>
              }
            </>
            }
          </TouchableOpacity>
        )}
      </View>
    )
  };
}

@inject("catalogStore") @observer
export class AddProductFilter extends Component {

  render() {
    const {catalogStore} = this.props;
    let {filters, selectDict, selectSpec} = catalogStore;
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: vars.white}}>
        <ScrollView>
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
            </View>)}
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
      </SafeAreaView>)
  }
}








