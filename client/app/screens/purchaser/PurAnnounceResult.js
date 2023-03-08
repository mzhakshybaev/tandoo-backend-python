import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import Card from "../../components/Card";
import ScreenWrapper from "../../components/ScreenWrapper";
import Toolbar, {Title, ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import ItemView from "../../components/ItemView";
import announceApi from "../../../stores/api/AnnounceApi";
import {AnnounceMainData} from "../AnnounceView";

@inject("purchaserStore", 'mainStore')
@observer
export default class PurAnnounceResult extends Component {

  id;

  constructor(props) {
    super(props);
    this.state = {
      announce: null,
    };
  }

  componentDidMount() {
    this.id = this.props.navigation.getParam('id');
    this.load(this.id);
  }

  async load(id) {
    let announce = await announceApi.get({id});

    this.setState({announce});
  }

  render() {
    const {mainStore} = this.props;
    const {language} = mainStore;

    let label = 'name';
    if (language && language.code === 'en') {

      label = 'name_en';
    }
    if (language && language.code === 'kg') {
      label = 'name_kg';
    }


    let {announce} = this.state;


    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>Итоги</ToolbarTitle>
      </Toolbar>
    );

    return (
      <ScreenWrapper header={Header} loading={!announce}>
        {!!announce && <React.Fragment>
          <AnnounceMainData announce={announce}/>
          {announce.lots &&
          <>
            <Title>{'Выбранные поставщики'}</Title>
            {announce.lots.map((l, i) => <Card key={i}>
              <ItemView label={'Позиция'} value={l.dircategory[0][label]}/>
              <ItemView label={'Наимен-е отобр-го поставщика'} value={l.company}/>
              <ItemView label={'Цена позиции'} value={l.total}/>
              <ItemView label={'План-ая сумма'} value={l.budget}/>
            </Card>)}
          </>
          }
        </React.Fragment>
        }
      </ScreenWrapper>
    )
  }
}
