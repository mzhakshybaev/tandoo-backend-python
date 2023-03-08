import React, {Component} from 'react'
import {inject, observer} from "mobx-react";
import Loading from "components/Loading";
import {Card, CardBody} from "reactstrap";
import {translate} from "react-i18next";
import ContractsList from 'components/contract/List';


@translate(['common', 'settings', '']) @inject('supContractListCtrl') @observer
export default class SupplierContractsList extends Component {
  componentDidMount() {
    this.props.supContractListCtrl.load();
  }

  componentWillUnmount() {
    this.props.supContractListCtrl.reset();
  }

  render() {
    const {t} = this.props;
    let {ready, contracts} = this.props.supContractListCtrl;

    if (!ready) return <Loading/>;

    return (
      <Card>
        <CardBody>
          <h3 className="text-center">{t('Мои договора')}</h3>

          <ContractsList contracts={contracts}/>
        </CardBody>
      </Card>
    )
  }
}
