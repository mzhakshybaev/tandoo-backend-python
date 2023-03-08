import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import Card from "../components/Card";
import Image from "../components/AppImage";
import {IMAGES_URL} from "../../utils/common";
import ScreenWrapper from "../components/ScreenWrapper";
import Toolbar, {ToolbarButton, ToolbarTitle} from "../components/Toolbar";
import ItemView from "../components/ItemView";

@inject('mainStore', 'productCtrl') @observer
export default class ProductView extends Component {


  componentWillUnmount() {
    this.props.productCtrl.reset();
  }

  componentDidMount() {
    const {navigation, productCtrl} = this.props;
    const id = navigation.getParam('id');
    console.log({navigation}, {id});
    productCtrl.load(id);
  }


  render() {
    const {mainStore, productCtrl} = this.props;
    let {product} = productCtrl;
    const {language} = mainStore;

    let label = 'dir_title';
    let name = 'name';
    if (language && language.code === 'en') {
      label = 'dirname';
      name = 'name_en'
    }

    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>{`Продукт ${product ? product.code : ''}`}</ToolbarTitle>
      </Toolbar>
    );

    return (
      <ScreenWrapper header={Header} loading={mainStore.isBusy}>
        {!!product &&
        <Card>
          <Image source={{uri: IMAGES_URL + product.image}} resizeMode={'contain'}
                 style={{width: "100%", height: 250}}/>
          {product.dircategory && product.dircategory.map((d, i) =>
            <ItemView key={i} label={'Категория'} value={d[name]}/>
          )}
          {product.dictionaries && product.dictionaries.map((d, i) =>
            <ItemView key={i} label={d[label]} value={d.value[name]}/>
          )}
          <ItemView label={'Штрих код'} value={product.barcode}/>

          {product.specifications && product.specifications.map((s, i) =>
            <ItemView key={i} label={s.property[name]} value={s.value[name]}/>
          )}
        </Card>}
      </ScreenWrapper>
    )
  }
}


