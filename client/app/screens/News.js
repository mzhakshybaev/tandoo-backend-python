import {Text} from "react-native";

import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import Card from "../components/Card";
import Toolbar, {ToolbarButton, ToolbarTitle} from "../components/Toolbar";
import ScreenWrapper from "../components/ScreenWrapper";
import {draftHtmlToText, formatDateTime} from "../../utils/helpers";
import vars from "../common/vars";
import moment from "moment";

@inject("newsCtrl", 'mainStore') @observer
export default class News extends Component {
  lang = 'ru';
  navigation;

  componentDidMount() {
    this.lang = this.props.mainStore.language.code;
    this.navigation = this.props.navigation;
    this.props.newsCtrl.load();
  }

  componentWillUnmount() {
    this.props.newsCtrl.reset();
  }

  render() {
    const {newsCtrl} = this.props;
    let {news, ready} = newsCtrl;
    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>Новости</ToolbarTitle>
      </Toolbar>
    );


    return (
      <ScreenWrapper header={Header} loading={!ready}>
        {news && news.map(n => this.renderNews(n))}
      </ScreenWrapper>
    )
  }

  renderNews = (item) => {
    let lp = (this.lang === 'ru') ? '' : ('_' + this.lang);

    let title = item['title' + lp];
    let description = item['description' + lp];

    return (
      <Card title={title} key={item._id} onPress={this.navigation.navigate('newsItem', {id: item._id})}>
        <Text>{draftHtmlToText(description)}</Text>
        <Text style={{color: vars.muted, textAlign: 'right'}}>{formatDateTime(moment(item.created_from))}</Text>
      </Card>
    );
  }
}
