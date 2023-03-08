import React from "react";
import {Col, Row} from "reactstrap";
import Input, {FGI} from "components/AppInput";
import Button from 'components/AppButton'
import {inject, observer} from 'mobx-react'
import {FORMAT_DATE_TIME, IMAGES_URL} from "utils/common";
import Catalog from '../operator/Catalog';
import {showSuccess, showError} from "utils/messages";
import Img from 'components/Image';
import {translate} from "react-i18next";
import DatePicker from "components/DatePicker";
import moment from "moment";

@translate(['common', 'settings', ''])
@inject('supMyProductsEditCtrl') @observer
export default class AddProduct extends React.Component {
  componentDidMount() {
    this.props.supMyProductsEditCtrl.init();
  }

  componentWillUnmount() {
    this.props.supMyProductsEditCtrl.reset();

  }

  handleSave = async () => {
    try {
      await this.props.supMyProductsEditCtrl.save();

      showSuccess("Успешно сохранен");
      this.props.history.push("/supplier/products")

    } catch (e) {
      showError(e && e.message || "Ошибка сохранения")
    }
  };

  rejectDisplayKeys = ['image', '_id', 'product_id', 'unit_price', 'date_end', 'quantity', 'date_add', 'date_update', 'status'];


  render() {

    const {t} = this.props;
    let {product, unit_price, date_end, inStock, preOrder, setProduct, setDate, setUnitPrice, setInStock, setPreOrder, canSubmit} = this.props.supMyProductsEditCtrl;

    if (typeof date_end == "string")
      date_end = moment(date_end, 'YYYY-MM-DD HH:mm:ss');

    if (!product) {
      return (
        <div>
          <h3>{t('Добавление товара')}</h3>
          <Catalog onAddProduct={(p) => setProduct({...p, product_id: p._id}, true)}/>
        </div>
      );
    }

    let displayKeys = Object.keys(product).withoutArr(this.rejectDisplayKeys);

    return (
      <div className="container addProductSupp">
        <Row>
          <Col className="d-flex justify-content-center py-3">
            <h2>{t('Добавление/редактирование продукции')}</h2>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col sm={12} md={10} className="offset-md-1">
            <div className="card">
              <div className="row ">
                <div className="col-md-5 offset-md-1 px-3 d-flex align-items-center">
                  <div className="card-block px-3">
                    <h4 className="card-title">{product["Товарные знаки(марка, бренд)"]}</h4>
                    {displayKeys.map((key, i) =>
                      <div key={i}>
                        <h6>{t(key)}: {product[key]}</h6>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-5 ">
                  <Img src={IMAGES_URL + product.image} className="w-100 p-2"/>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Row className="mt-md-3">
          <Col sm={12} md={6} className="offset-md-1">
            {/*<FGI l={t('Количество товара в наличиии')} lf="5" ls="5">*/}
            {/*<Input type="number"*/}
            {/*value={quantity}*/}
            {/*min="0"*/}
            {/*placeholder={t('количество')}*/}
            {/*autoFocus*/}
            {/*onChange={e => setQuantity(e.target.value)}/>*/}
            {/*</FGI>*/}
            <FGI l={t('Цена за единицу, сом')} lf="5" ls="5" className="mt-1">
              <Input type="number"
                     value={unit_price}
                     min="0" step="0.01"
                     placeholder={t('цена')}
                     autoFocus
                     onChange={e => setUnitPrice(e.target.value)}/>
            </FGI>
            <FGI l={t('Срок истечения цены')} lf="5" ls="5" className="mt-1">

              <DatePicker showTimeSelect timeFormat="HH:mm" timeIntervals={15} timeCaption={t("Время")}
                          dateFormat={FORMAT_DATE_TIME}
                          value={date_end}
                          minDate={moment()}
                          maxDate={moment().add(2, 'month')}
                          placeholder={'Дата, время'}
                          onChange={setDate}/>
            </FGI>
            <FGI l={t('В наличии')} lf="5" ls="5" className="mt-1">
              <Input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)}/>
            </FGI>
            <FGI l={t('Предзаказ')} lf="5" ls="5" className="mt-1">
              <Input type="checkbox" checked={preOrder} onChange={e => setPreOrder(e.target.checked)}/>
            </FGI>

          </Col>
          <Col sm={12} md={4} className=" d-flex align-items-end justify-content-end">
            <Button onClick={this.handleSave} disabled={!canSubmit}>
              {t('Сохранить и добавить в Мой каталог')}
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}
