import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {Card, CardBody, CardText, CardHeader, Col, Row} from "reactstrap";
import {FGI} from "components/AppInput";
import {translate} from "react-i18next";
import {withRouter} from "react-router-dom";
import {Image, Loading, Button} from "components";
import {IMAGES_URL} from "utils/common";


@translate(['common', 'settings', ''])
@withRouter @inject('mainStore', 'productCtrl') @observer
export default class ProductView extends Component {
  componentDidMount() {
    this.load(this.props.match.params.id);
  }

  load(id) {
    this.id = id;
    this.props.productCtrl.load(id);
  }

  componentWillUnmount() {
    this.id = null;
    this.props.productCtrl.reset();
  }

  componentDidUpdate() {
    let {id} = this.props.match.params;

    if (this.id !== id) {
      this.load(id)
    }
  }

  render() {
    const {t} = this.props;
    let {ready, product} = this.props.productCtrl;
    const {mainStore} = this.props;
    const {language} = mainStore;

    let label = 'dir_title';
    let name = 'name'
    if (language && language.code === 'en') {
      label = 'dirname';
      name = 'name_en'
    }
    if (!ready) return <Loading/>;

    return (
      <Card>
        <h3 className="text-center">{t('Продукт')} {product.code}</h3>
        <CardBody>
          <Row className="no-padding-paragraph">

            <Col md={6} className="text-center">
              <Image className="mw-100" src={IMAGES_URL + product.image}/>

            </Col>

            <Col md={6}>
              {product.dircategory && product.dircategory.map((d, i) =>
                <p key={i}>
                  <strong>{t('Категория') + ": "} </strong>
                  {d[name]}
                </p>
              )}
              {product.dictionaries && product.dictionaries.map((d, i) =>
                <p key={i}>
                  <strong> {d[label] + ": "} </strong>
                  {d.value[name]}
                </p>
              )}
              <p>
                <strong>{t('Штрих код') + ": "}</strong>
                {product.barcode}
              </p>

              {product.specifications && product.specifications.map((s, i) =>
                <p key={i}>
                  <strong>{s.property[name] + ": "}</strong>
                  {s.value[name]}
                </p>
              )}
            </Col>

          </Row>
          <Button color="secondary" to="/purchaser/catalog"> {t('Назад')}</Button>
        </CardBody>
      </Card>)
  }
}
