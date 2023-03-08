import React from 'react'
import {FlatList, TouchableOpacity, View} from 'react-native';
import {inject, observer} from 'mobx-react';
import {Text} from "react-native-elements";
import Toolbar, {ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import Image from "../../components/AppImage";
import {IMAGES_URL} from "../../../utils/common";
import {formatDateTime, formatMoney} from "../../../utils/helpers";
import Button from "../../components/Button";
import TabView from "../../components/TabView";
import ScreenWrapper from "../../components/ScreenWrapper";
import Card from "../../components/Card";
import ItemView from "../../components/ItemView";
import Spinner from "../../components/Spinner";
import vars from "../../common/vars";


export default class SupplierProducts extends React.Component {
  render() {
    const {navigation} = this.props;
    const Header = (
      <Toolbar hasTabs>
        <ToolbarButton back/>
        <ToolbarTitle>Мой каталог</ToolbarTitle>
      </Toolbar>
    );

    return (
      <ScreenWrapper header={Header} tab={<TabView>
        <Products tabLabel='Товары' navigation={navigation}/>
        <Text tabLabel='Работы'>Таблица работ и фильтр</Text>
        <Text tabLabel='Услуги'>Таблица услуг и фильтр</Text>
      </TabView>}/>
    )
  }
}


@inject('supMyProductsCtrl', 'catalogStore', 'mainStore') @observer
class Products extends React.Component {

  componentDidMount() {
    this.props.supMyProductsCtrl.load();
  }

  componentWillUnmount() {
    this.props.supMyProductsCtrl.reset();
  }

  handleEdit(product) {
    this.props.catalogStore.selectedProduct = product;
    this.props.history.push('/supplier/products/add');
  };

  render() {
    const {navigation, supMyProductsCtrl} = this.props;
    let {ready, products, categories, currentCategory, toggleCategory} = supMyProductsCtrl;

    if (!ready) return <Spinner/>;

    return (
      <FlatList data={products}
                ListHeaderComponent={
                  <>
                    <View style={{flexDirection: 'row'}}>
                      <Button title={'Добавить товар'}
                              style={{margin: 10, flex: 0.5}}
                              onPress={() => navigation.navigate('supplier/products/add')}/>
                      <Button title={'Создать запрос'}
                              style={{margin: 10, flex: 0.5}}
                              onPress={() => navigation.navigate('supplier/products/request')}/>
                    </View>

                    <Card>
                      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                        <TouchableOpacity
                          style={{
                            padding: 5,
                            borderWidth: 1,
                            borderRadius: 5,
                            borderColor: vars.borderColor,
                            marginLeft: 5,
                            marginTop: 5,
                            backgroundColor: !currentCategory ? vars.primary : vars.white
                          }}
                          onPress={() => toggleCategory(null, null)}>
                          <Text style={{color: !currentCategory ? 'white' : vars.text}}>Все категории</Text>
                        </TouchableOpacity>

                        {categories && categories.map((category, i) =>
                          <TouchableOpacity
                            style={{
                              padding: 5,
                              borderWidth: 1,
                              borderRadius: 5,
                              borderColor: vars.borderColor,
                              marginLeft: 5,
                              marginTop: 5,
                              backgroundColor: category === currentCategory ? vars.primary : vars.white
                            }}
                            key={i} onPress={() => toggleCategory(null, category)}>
                            <Text style={{color: category === currentCategory ? vars.white : vars.text}}>
                              {category.name ? category.name : category}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </Card>
                  </>
                }
                renderItem={obj => this.renderItem(obj)}
                keyExtractor={(item, index) => index.toString()}/>
    )
  }

  renderItem = (obj) => {
    const {index, item} = obj;
    return (
      <Card key={index}
            title={`(Торг.знак-Страна): ${(item['Товарные знаки(марка, бренд)'] || '') + (item['Страны'] ? (' - ' + item['Страны']) : '')}`}
            onPress={() => {
              this.props.catalogStore.selectedProduct = item;
              this.props.navigation.navigate('supplier/products/add');
            }}
      >
        <View style={{flexDirection: 'row'}}>
          <Image style={{width: 100, height: 100}} source={{uri: IMAGES_URL + item.image}}/>
          <View style={{flexGrow: 1, marginLeft: 5}}>
            <ItemView label={'Производитель'} value={item['Производители']}/>
            <ItemView label={'Ед.изм'} value={item['Единицы измерения']}/>
            <ItemView label={'Цена за ед.'} value={formatMoney(item.unit_price)}/>
            <ItemView label={'Добавлен'} value={formatDateTime(item.date_add)}/>
            <ItemView label={'Срок истечения'} value={formatDateTime(item.date_end)}/>
          </View>
        </View>
      </Card>
    )
  };
}






