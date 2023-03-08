import React, {Component} from 'react';
import {translate} from "react-i18next";
import {inject, observer} from "mobx-react";
import ScreenWrapper from "../components/ScreenWrapper";
import Toolbar, {ToolbarButton, ToolbarTitle} from "../components/Toolbar";
import Card from "../components/Card";
import ItemView from "../components/ItemView";

@translate(['common', 'settings', '']) @inject('dictStore') @observer
export default class InfoView extends Component {
  constructor(props) {
    super(props);
    this.state = {infos: []};
  }


  componentDidMount() {
    let id = this.props.navigation.getParam('id');
    if (id) {
      this.props.dictStore.test().then(r => {
        r = r.filter(p => p.esp_id === id);
        this.setState({infos: r});
        console.log("the testing are " + this.state.infos)
      })
    }
  }

  render() {
    let {infos} = this.state;
    const {t} = this.props;
    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>{t('Филиалы')}</ToolbarTitle>
      </Toolbar>
    );
    return (
      <ScreenWrapper header={Header} loading={!infos || infos.length === 0}>
        {infos.map((r) =>
          <Card key={r._id} title={r.name}>
            <ItemView label={t('Адрес')} value={r.address}/>
            <ItemView label={t('E-mail')} value={r.email}/>
            <ItemView label={t('Ссылка')} value={r.contact}/>
          </Card>
        )}
      </ScreenWrapper>
    )
  }

}
