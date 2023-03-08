import React from 'react';
import ScreenWrapper from "../../components/ScreenWrapper";
import {inject, observer} from "mobx-react";
import Toolbar, {ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import Card from "../../components/Card";
import ItemView from "../../components/ItemView";
import {formatMoney, getStatusTr} from "../../../utils/helpers";

@inject('supContractListCtrl', 'mainStore') @observer
export default class SupContractsList extends React.Component {
  componentDidMount() {
    this.props.supContractListCtrl.load();
  }

  componentWillUnmount() {
    this.props.supContractListCtrl.reset();
  }

  render() {
    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>Мои договора</ToolbarTitle>
      </Toolbar>
    );
    const {navigation, supContractListCtrl} = this.props;

    let {ready, contracts} = supContractListCtrl;
    return (
      <ScreenWrapper header={Header} loading={!ready} noData={!contracts || contracts.length === 0}>
        {contracts && contracts.map(c =>
          <Card key={c.id} title={`№ Договора: ${c.code}`}
                onPress={() => navigation.navigate('contracts/view', {id: c.id})}>
            <ItemView label={'Закупающая организация'} value={c.pur_company}/>
            <ItemView label={'Предмет закупки'} value={c.dirsection}/>
            <ItemView label={'Поставщик'} value={c.sup_company}/>
            <ItemView label={'Статус'} value={getStatusTr('contract', c.status)}/>
            <ItemView label={'Сумма'} value={formatMoney(c.total)}/>
          </Card>
        )}
      </ScreenWrapper>
    )
  }
}
