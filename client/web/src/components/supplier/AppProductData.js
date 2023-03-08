import React, {Component} from 'react';
import {Table} from "reactstrap";
import {formatMoney} from "utils/helpers";
import {observer} from 'mobx-react';
import InputMask from 'react-input-mask'
import {translate} from "react-i18next";

@translate(['common', 'settings', ''])
@observer
export default class AppProductData extends Component {
  beforeMaskedValueChange = (newState, oldState, userInput) => {
    var { value } = newState;
    var selection = newState.selection;
    var cursorPosition = selection ? selection.start : null;

    // keep minus if entered by user
    if (value.endsWith('-') && userInput !== '-' && !this.state.value.endsWith('-')) {
      if (cursorPosition === value.length) {
        cursorPosition--;
        selection = { start: cursorPosition, end: cursorPosition };
      }
      value = value.slice(0, -1);
    }

    return {
      value,
      selection
    };
  };
  render() {
    let {app, lot, product, editablePrice, onChangePrice, index, t} = this.props;

    let price = (app && (typeof app.unit_price !== 'undefined')) ? app.unit_price : product.unit_price;
    let quantity = (lot && (typeof lot.quantity !== 'undefined')) ? lot.quantity : product.quantity;

    return (
      <Table bordered>
        <tbody>
        <tr>
          <td>{t('Позиция №')}</td>
          <td>{index}</td>
        </tr>
        <tr>
          <td>{lot && lot.dircategory}</td>
          <td>{product.dircategory}</td>
        </tr>
        {product.specs && Object.keys(product.specs).map((item, i) =>
          <tr key={i}>
            <td>{item}</td>
            <td>{product.specs[item]}</td>
          </tr>)}
        {product.dicts && Object.keys(product.dicts).map((item, i) =>
          <tr key={i}>
            <td>{item}</td>
            <td>{product.dicts[item]}</td>
          </tr>)}
        <tr>
          <td>{t('Кол-во')}</td>
          <td>{quantity}</td>
        </tr>
        <tr className="bg-info text-body">
          <td>{t('Цена за ед.')}</td>
          <td>
            {editablePrice ?
              <InputMask className="form-control"
                         mask="999999999999"
                         placeholder={t('Введите число')}
                         maskChar={null}
                         value={price}
                         onChange={e => onChangePrice && onChangePrice(e.target.value)}
                         beforeMaskedValueChange={this.beforeMaskedValueChange} />:
              formatMoney(price)
            }
          </td>
        </tr>
        <tr className="bg-info text-body">
          <td>{t('ИТОГО за позицию')}</td>
          <td>{formatMoney(quantity * price)}</td>
        </tr>
        </tbody>
      </Table>
    )
  }
}
