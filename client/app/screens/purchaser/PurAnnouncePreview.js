import React, {Component, Fragment} from 'react';
import {inject, observer} from "mobx-react";
import ScreenWrapper from "../../components/ScreenWrapper";
import Toolbar, {ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import Button from "../../components/Button";
import momentbd from "moment-business-days";
import announceApi from "../../../stores/api/AnnounceApi";
import {showError, showSuccess} from "../../../utils/messages";
import {AnnounceLotsList, AnnounceMainData, AnnouncePayments} from "../AnnounceView";
import AlertView from "../../components/AlertView";
import {View} from "react-native";
import vars from "../../common/vars";

@inject('announceViewCtrl', 'mainStore') @observer
export default class PurAnnouncePreview extends Component {
  state = {
    visible: false
  };

  componentDidMount() {
    const {navigation} = this.props;
    const id = navigation.getParam('id');
    if (id) {
      this.load(id);
    }
  }

  async load(id) {
    let announce = await announceApi.get({id});

    if (announce.status !== 'Draft') {
      showError('Объявление не в статусе Черновик');
      return
    }

    let error;
    let deadline = momentbd(announce.deadline);
    let procurement = announce.dirprocurement;
    if (procurement) {
      let minDLDays = procurement.day_count;
      let minDLDate = momentbd().businessAdd(minDLDays);
      if (deadline.isBefore(minDLDate)) {
        error = `Укажите Срок подачи не менее ${minDLDays} рабочих дней`;
      }
    } else {
      error = 'Укажите метод закупок';
    }

    this.setState({
      announce,
      error,
      payments: {
        advanceEnabled: announce.data && announce.data.payments && announce.data.payments.advanceEnabled || false,
        shipmentEnabled: announce.data && announce.data.payments && announce.data.payments.shipmentEnabled || false,
        acceptEnabled: announce.data && announce.data.payments && announce.data.payments.acceptEnabled || false,
        advance: announce.data && announce.data.payments && announce.data.payments.advance || 0,
        shipment: announce.data && announce.data.payments && announce.data.payments.shipment || 0,
        accept: announce.data && announce.data.payments && announce.data.payments.accept || 0,
      }
    });
  }

  canPublish = () => {
    const {announce, error} = this.state;
    return announce.dirprocurement && announce.deadline && !error;
  };

  publish = async () => {
    let params = {
      advert: {_id: this.state.announce._id,}
    };

    await announceApi.publish(params);

    showSuccess('Успешно опубликовано');
    this.props.navigation.navigate('purchaser/announce/listing');
  };

  render() {
    const {announce, error} = this.state;
    const {navigation} = this.props;

    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>{announce && announce.code ? `Объявление № ${announce.code}` : 'Объявление'}</ToolbarTitle>
      </Toolbar>
    );

    return (
      <ScreenWrapper header={Header} loading={!announce}>
        {!!announce && <>
          {error ? <AlertView type="error" text={error}/> : <AlertView text={'Готово к публикации'}/>}
          <AnnounceMainData announce={announce}/>
          <AnnounceLotsList lots={announce.lots}/>
          <AnnouncePayments payments={announce.data && announce.data.payments}/>
          {announce.status === 'Draft' &&
          <View style={{paddingHorizontal: 10}}>
            <Button onPress={() => navigation.navigate('purchaser/basket', {id: announce._id})}
                    title={'Редактировать позиции'}/>
            <Button title={'Редактировать'}
                    onPress={() => navigation.navigate('purchaser/announce/edit', {id: announce._id})}/>
            {announce.status === 'Draft' &&
            <Button color={vars.secondary} onPress={this.publish} disabled={!this.canPublish()}
                    title={'Опубликовать'}/>}
          </View>
          }
        </>
        }
      </ScreenWrapper>
    )
  }
}
