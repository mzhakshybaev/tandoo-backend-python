import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {inject, observer} from 'mobx-react';
import {translate} from "react-i18next";
import {Button} from 'components';
import {Badge} from 'reactstrap';
import {storageGet} from "utils/LocalStorage";
import {observable, runInAction} from "mobx";


@translate(['common', 'settings', '']) @inject('authStore') @withRouter @observer
export default class PurBasket extends Component {
  @observable show = false;
  @observable items = 0;

  componentDidMount() {
    this.load();
    this.interval = setInterval(this.load, 2000);
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  load = async () => {
    let {isPurchaser} = this.props.authStore;
    if (!isPurchaser) {
      this.show = false;
      return;
    }

    let basket = await storageGet('basket');
    runInAction(() => {
      this.items = basket && basket.lots && basket.lots.length || 0;
      this.show = true;
    })
  };

  render() {
    if (!this.show)
      return null;

    let {t} = this.props;

    return (
      <Button className="btn-sm" title={t('Корзина')} to="/purchaser/basket">
        <i className="fa fa-lg fa-shopping-cart"/>
        {this.items > 0 &&
        <Badge color="secondary" className="ml-1">{this.items}</Badge>
        }
      </Button>
    );
  }
}
