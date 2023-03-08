import React, {Component} from 'react';
import {Col, Label, Row, Collapse, CustomInput} from "reactstrap";
import Input from 'components/AppInput';
import {translate} from "react-i18next";
import {getPayTypeTr} from "utils/helpers";

@translate(['common', 'settings', ''])
export default class AnnouncePayments extends Component {
  render() {
    const {t, editable, payments, onChange} = this.props;

    if (!payments) {
      return null;
    }

    return (
      <div>
        <Row>
          <Col>
            <h4>{t('Платежи')}</h4>
          </Col>
        </Row>

        {!editable ? <AnnPaymentsView {...{payments}}/> : <AnnPaymentsEdit {...{payments, onChange}}/>}

      </div>
    )
  }
}

@translate(['common', 'settings', ''])
class AnnPaymentsView  extends Component {
  render() {
    const {advanceEnabled, shipmentEnabled, acceptEnabled, advance, shipment, accept} = this.props.payments;

    return (
      <div>

        {advanceEnabled &&
        <Row>
          <Col>
            <Label>{getPayTypeTr('advance')}:</Label>
            {' '}
            {advance} %
          </Col>
        </Row>}

        {shipmentEnabled &&
        <Row>
          <Col>
            <Label>{getPayTypeTr('shipment')}: </Label>
            {' '}
            {shipment} %
          </Col>
        </Row>}

        {acceptEnabled &&
        <Row>
          <Col>
            <Label>{getPayTypeTr('accept')}: </Label>
            {' '}
            {accept} %
          </Col>
        </Row>}

      </div>
    )
  }
}

@translate(['common', 'settings', ''])
class AnnPaymentsEdit extends Component {
  inputRefs = [];

  render() {
    const {t, onChange} = this.props;
    const {advanceEnabled, shipmentEnabled, acceptEnabled, advance, shipment, accept} = this.props.payments;

    return (
      <div>
        <Row className={"mb-2"}>
          <Col sm="5">
            <CustomInput type="checkbox" id="advancePayment" label={getPayTypeTr('advance') + ' (%)'}
                         checked={advanceEnabled}
                         onChange={e => onChange('advanceEnabled', e.target.checked)}/>
          </Col>
          <Collapse isOpen={advanceEnabled} tag={Col} sm="5" xs="6" onEntered={this.onCollapseOpen(0)}>
            <Input type="number" placeholder={t('(число)')} value={advance} min="0" max="100"
                   onChange={e => onChange('advance', e.target.value)} innerRef={this.setInputRef(0)}/>
          </Collapse>
        </Row>

        <Row className={"mb-2"}>
          <Col sm="5">
            <CustomInput type="checkbox" id="afterShipment" label={getPayTypeTr('shipment') + ' (%)'}
                         checked={shipmentEnabled}
                         onChange={e => onChange('shipmentEnabled', e.target.checked)}/>
          </Col>
          <Collapse isOpen={shipmentEnabled} tag={Col} sm="5" xs="6" onEntered={this.onCollapseOpen(1)}>
            <Input type="number" placeholder={t('(число)')} value={shipment} min="0" max="100"
                   onChange={e => onChange('shipment', e.target.value)} innerRef={this.setInputRef(1)}/>
          </Collapse>
        </Row>

        <Row className={"mb-2"}>
          <Col sm="5">
            <CustomInput type="checkbox" id="afterAcceptance" label={getPayTypeTr('accept') + ' (%)'}
                         checked={acceptEnabled}
                         onChange={e => onChange('acceptEnabled', e.target.checked)}/>
          </Col>
          <Collapse isOpen={acceptEnabled} tag={Col} sm="5" xs="6" onEntered={this.onCollapseOpen(2)}>
            <Input type="number" placeholder={t('(число)')} value={accept} min="0" max="100"
                   onChange={e => onChange('accept', e.target.value)} innerRef={this.setInputRef(2)}/>
          </Collapse>
        </Row>
      </div>
    )
  }

  setInputRef = idx => input => {
    this.inputRefs[idx] = input;
  };

  onCollapseOpen = idx => () => {
    this.inputRefs[idx].focus()
  }
}
