import {inject, observer} from "mobx-react";
import React, {Component} from "react";
import Toolbar, {ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import ScreenWrapper from "../../components/ScreenWrapper";
import {AnnounceMainData} from "../AnnounceView";
import {formatDateTime, formatMoney} from "../../../utils/helpers";
import Card from "../../components/Card";
import ItemView from "../../components/ItemView";
import vars from "../../common/vars";
import Button from "../../components/Button";
import {Text} from "react-native";
import {Icon} from "react-native-elements";

@inject('supPropEditCtrl') @observer
export default class SupProposalEdit extends Component {
  componentDidMount() {
    const id = this.props.navigation.getParam('id');
    this.load(id);
  }

  load(id) {
    this.props.supPropEditCtrl.load(id);
  }

  render() {
    const {t, navigation} = this.props;
    let {
      ready, announce, announce_app, isApplicable, myApps, selectedLotsCount, totalLotsCount, lotsCount,
      selectedProductsCount
    } = this.props.supPropEditCtrl;

    // if (!isApplicable) {
    //   navigation.navigate('announcements');
    //   return null;
    // }

    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>Проектирование предложения</ToolbarTitle>
      </Toolbar>
    );

    return (
      <ScreenWrapper header={Header} loading={!ready}>

        <AnnounceMainData announce={announce} title={'Данные объявления'}/>

        {myApps && myApps.length > 0 && <AppInfo apps={myApps}/>}

        <Card title={'Параметры предложения'}>
          <Card>
            <ItemView label={'Содержание предложения'}
                      value={<Text style={{color: vars.primary}}
                                   onPress={() => navigation.navigate('supplier/proposal/lots', {id: announce._id})}>
                        Выбор позиций из объявления {selectedLotsCount} / {totalLotsCount}
                      </Text>}/>
            <ItemView label={'Статус'} value={<Icon type={'font-awesome'}
                                                    name={selectedLotsCount === totalLotsCount ? 'check-circle' : 'exclamation-triangle'}/>}
            />

          </Card>

          <Card>
            <ItemView label={'Содержание предложения'}
                      value={<Text style={{color: vars.primary}}
                                   onPress={() => navigation.navigate('supplier/proposal/products', {id: announce._id})}>
                        Выбор подходящего товара и таблица цен {selectedProductsCount} / {lotsCount}
                      </Text>}/>
            <ItemView label={'Статус'} value={<Icon type={'font-awesome'}
                                                    name={selectedProductsCount === lotsCount ? 'check-circle' : 'exclamation-triangle'}/>}
            />
          </Card>

          <Card>
            <ItemView label={'Содержание предложения'}
                      value={<Text style={{color: vars.primary}}
                                   onPress={() => navigation.navigate('supplier/proposal/oferta', {id: announce._id})}>
                        Коммерческое предложение
                      </Text>}/>
            <ItemView label={'Статус'} value={<Icon type={'font-awesome'}
                                                    name={selectedProductsCount === lotsCount ? 'check-circle' : 'exclamation-triangle'}/>}
            />
          </Card>
        </Card>

        <Button title={'Подать предложение'}
                onPress={() => navigation.navigate('supplier/proposal/submit', {id: announce._id})}
                disabled={selectedProductsCount !== lotsCount}/>
      </ScreenWrapper>
    );
  }
}

export const AppInfo = ({apps}) => {
  let app = apps[0].app;
  let total = apps.reduce((a, v) => {
    return a + v.app.total
  }, 0);
  return (
    <Card title={'Данные предложения'}>
      <ItemView label={'Статус'} value={app.status}/>
      <ItemView label={'Дата публикации'} value={app._created && formatDateTime(app._created)}/>
      <ItemView label={'Кол-во позиций'} value={app.length}/>
      <ItemView label={'Сумма'} value={formatMoney(total)}/>
    </Card>
  )
};
