import React, {Component} from 'react';
import {Row, Col} from "reactstrap";
import {translate} from "react-i18next";
import CompanyInfo from './View/CompanyInfo';
import AnnounceInfo from './View/AnnounceInfo';
import Lots from './View/Lots';
import ConsList from './Consignments/List';
import InvsList from './Invoices/List';
import {getStatusTr} from "utils/helpers";

@translate(['common', 'settings', ''])
export default class ContractView extends Component {
  render() {
    const {t} = this.props;
    let {contract, columns, showLots, preTitle, consignments, invoices} = this.props;
    let {announce, lots} = contract;
    let {pur_company, sup_company} = contract;

    let showLink = contract.status.in_('Active', 'Finished');
    let statusClass = '';

    if (contract.status.in_('Schedule', 'Pending')) {
      statusClass = 'text-warning';
    } else if (contract.status.in_('Active')) {
      statusClass = 'text-success';
    } else if (contract.status.in_('Finished')) {
      statusClass = 'text-primary';
    } else if (contract.status.in_('Canceled', 'Declined')) {
      statusClass = 'text-danger';
    }

    return (
      <div>
        <h3 className="text-center">
          {preTitle && (preTitle + '. ')}
          {t('Договор')} № {contract.code}
        </h3>

        <Row className="mb-2 no-padding-paragraph">
          <CompanyInfo title="Закупщик" company={pur_company}/>
          <CompanyInfo title="Поставщик" company={sup_company}/>
        </Row>

        {announce &&
        <Row className="mb-2 no-padding-paragraph">
          <AnnounceInfo announce={announce} contract={contract}/>
        </Row>
        }

        {showLots &&
        <Row className="mb-2">
          <Lots columns={columns} lots={lots} accessorTotal="total"/>
        </Row>
        }

        {consignments && (consignments.length > 0) &&
        <Row className="mb-2">
          <ConsList items={consignments} showLink={showLink}/>
        </Row>
        }

        {invoices && (invoices.length > 0) &&
        <Row className="mb-2">
          <InvsList items={invoices} showLink={showLink}/>
        </Row>
        }

        <Row className="mb-2 font-weight-bold">
          <Col>
            {t('Статус')}: {' '}
            <span className={statusClass}>
              {getStatusTr('contract', contract.status, {long: true})}
            </span>
          </Col>
        </Row>

      </div>
    )
  }
}
