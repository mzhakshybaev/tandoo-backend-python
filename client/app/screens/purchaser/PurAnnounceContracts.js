import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import Card from "../../components/Card";
import {formatMoney, getStatusTr} from "../../../utils/helpers";
import ScreenWrapper from "../../components/ScreenWrapper";
import Toolbar, {Title, ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import ItemView from "../../components/ItemView";
import {AnnounceMainData} from "../AnnounceView";

@inject('purAnnContractsListCtrl') @observer
export default class PurAnnounceResult extends Component {
  id;

  componentDidMount() {
    this.id = this.props.navigation.getParam('id');
    this.load(this.id);
  }

  load(id) {
    this.props.purAnnContractsListCtrl.load(id);
  }

  componentWillUnmount() {
    this.props.purAnnContractsListCtrl.reset();
  }

  render() {
    let {ready, announce, contracts, isOwner} = this.props.purAnnContractsListCtrl;

    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>Договора</ToolbarTitle>
      </Toolbar>
    );

    return (
      <ScreenWrapper header={Header} loading={!ready}>
        {!!announce && <React.Fragment>
          <AnnounceMainData announce={announce}/>
          <Title>Список контрактов</Title>

          {contracts && contracts.map((c, i) => <Card key={i} title={`№ Договора ${c.code}`}>
            <ItemView label={'Закупающая организация'} value={c.pur_company}/>
            <ItemView label={'Предмет закупки'} value={c.dirsection}/>
            <ItemView label={'Поставщик'} value={c.sup_company}/>
            <ItemView label={'Статус'} value={getStatusTr('contract', c.status)}/>
            <ItemView label={'Сумма'} value={formatMoney(c.total)}/>
          </Card>)}

        </React.Fragment>
        }
      </ScreenWrapper>
    )
  }
}
