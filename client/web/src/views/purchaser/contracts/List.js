import React, {Component} from 'react'
import {inject, observer} from "mobx-react";
import {Col, Row, TabContent, TabPane} from "reactstrap";
import PurAppTabs from "components/purchaser/AnnTabs";
import Loading from "components/Loading";
import {translate} from "react-i18next";
import ContractsList from 'components/contract/List';

@translate(['common', 'settings', '']) @inject('purContractListCtrl') @observer
export default class PurchaserContractsList extends Component {
  componentDidMount() {
    this.props.purContractListCtrl.load();
  }

  componentWillUnmount() {
    this.props.purContractListCtrl.reset();
  }

  render() {
    const {t} = this.props;
    let {ready, contracts} = this.props.purContractListCtrl;
    let {status} = this;

    return (
      <div className="animated fadeIn">
        <h3>{t('Мои объявления')}</h3>

        <PurAppTabs/>

        <TabContent>
          <TabPane>
            <Row>
              <Col>
                {!ready ?
                  <Loading/> :
                  <ContractsList contracts={contracts} tabStatus={status} view="purchaser"/>
                }
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </div>
    )
  }
}
