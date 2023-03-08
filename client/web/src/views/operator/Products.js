import React, {Component, Fragment} from "react";
import {inject, observer} from "mobx-react";
import {Card, CardBody, CardFooter, CardHeader, Col, Row} from "reactstrap";
import {FGI} from "components/AppInput";
import Table from "components/AppTable";
import Select from "components/Select";
import AppButton from "components/AppButton";
import {EMPTY_PDF, IMAGES_URL} from 'utils/common'
import {showError, showSuccess} from "utils/messages";
import BarcodeInput from "components/BarcodeInput";
import {translate} from "react-i18next";
import Switcher from "components/Switcher";
import {toJS, action} from "mobx";
import Loading from "components/Loading";
import {Link} from "react-router-dom";
import AppInput from "components/AppInput";
import FileUploader from "components/FileUploader";
import Img from 'react-image';

const TableHeaders = {
  "barcode": "Штрих код",
  "code": "Код",
  "image": "Изображение",
  "images": "Доп. изображения",
  "local": "Отечественный",
};

@translate(['common', 'settings', '']) @inject("productStore") @observer
export default class Products extends Component {
  state = {};

  componentDidMount() {
    this.props.productStore.load();
  }

  componentWillUnmount() {
    this.props.productStore.unload();
  }

  render() {
    let {t, productStore} = this.props;
    let {category} = productStore;

    return (
      <Card className="animated fadeIn">
        <CardHeader>{t('Описание продукции')}</CardHeader>
        <CardBody>
          <Row>
            <Col>
              <CategorySelect/>
            </Col>
          </Row>

          {category && (
            <Fragment>
              <Row className="mt-2">
                <Col>
                  <ProductForm/>
                </Col>
              </Row>
              <Row className="mt-2">
                <Col>
                  <ProductsList/>
                </Col>
              </Row>
            </Fragment>
          )}

        </CardBody>
      </Card>
    )
  }
}

@translate(['common', 'settings', '']) @inject("productStore", "mainStore") @observer
class CategorySelect extends Component {
  render() {
    const {t, productStore, language} = this.props;
    let {category, categories} = productStore;

    if (!categories)
      return <Loading/>;

    let label = 'name';
    if (language && language.code === 'en')
      label = 'name_en';
    if (language && language.code === 'kg')
      label = 'name_kg';

    return (
      <Select options={toJS(categories)}
              valueKey={"id"}
              value={category}
              placeholder={t('Выберите категорию')}
              optionRenderer={c => `${c.code}. ${c[label]}`} /*`*/
              valueRenderer={c => `${c.code}. ${c[label]}`} /*`*/
              filterOption={(option, filter) => !filter ? true : (
                (option[label].toLowerCase().indexOf(filter) !== -1) ||
                (option.code.indexOf(filter) !== -1)
              )}
              clearable={false}
              onChange={this.setCategory}/>
    )
  }

  setCategory = category => {
    this.props.productStore.setCategory(category)
  };
}

@translate(['common', 'settings', '']) @inject("productStore") @observer
class ProductsList extends Component {
  render() {
    let {productStore, t} = this.props;
    let {products, productColumns} = productStore;

    if (!(products && productColumns))
      return <Loading/>;

    let edit = [{
      Header: "",
      accessor: '_id',
      width: 42,
      filterable: false,
      Cell: row =>
        <Link to={`/products/${row.value}`} title={t('Редактировать')}
              onClick={e => this.onClickEdit(e, row.original)}> {/*`*/}
          <i className="fa fa-edit"/>
        </Link>
    }];

    let columns = productColumns.map(c => {
      let {accessor} = c;
      let header;

      if (accessor in TableHeaders) {
        header = t(TableHeaders[accessor]);
      } else {
        header = t(accessor);
      }

      let column = {...c, Header: header};

      switch (accessor) {
        case 'code':
          column.width = 120;
          column.Cell = row =>
            <Link to={`/products/${row.value}`} title={t('Редактировать')}
                  onClick={e => this.onClickEdit(e, row.original)}> {/*`*/}
              {row.value}
            </Link>;
          break;

        case 'barcode':
          column.width = 110;
          break;

        case 'image':
          column.width = 140;
          column.Cell = row =>
            <Img src={IMAGES_URL + row.value}
                 alt="Image preview"
                 className="file_img"
                 unloader={<img src={EMPTY_PDF} alt="Image preview"/>}/>;
          break;

        case 'images':
          column.Cell = row => row.value ? row.value.length : 0;
          break;

        case 'local':
          column.Cell = row => row.value ?
            <i className="fa fa-check text-success" title={t('Да')}/> :
            <i className="fa fa-times text-danger" title={t('Нет')}/>;
          break;
      }

      return column

    }).concat(edit);

    columns.unshift(edit[0]);

    return <Table data={products}
                  columns={columns}
                  pageSize={10}
                  showRowNumbers/>
  }

  onClickEdit(e, product) {
    e.preventDefault();
    this.props.productStore.setProduct(product)
  }
}

@translate(['common', 'settings', '']) @inject("productStore", "mainStore") @observer
class ProductForm extends Component {
  onClickAdd = () => {
    this.props.productStore.setEmptyProduct();
  };

  onClickClose = () => {
    this.props.productStore.setProduct(null);
  };

  onClickSave = async e => {
    e.preventDefault();
    let {productStore} = this.props;

    try {
      await productStore.saveProduct();

      showSuccess("Успешно сохранён");
      productStore.setProduct(null);
      productStore.getProducts();

    } catch (e) {
      console.warn(e);
      showError(e && e.message || "Произошла ошибка при сохранении")
    }
  };

  getDictValue = (d) => {
    let {product} = this.props.productStore;
    let dict = product.dictionaries.find({dirname: d.dirname});
    if (dict) {
      return dict.value;
    }
  };

  @action
  setDictValue = (d, val) => {
    let {product} = this.props.productStore;
    let dict = product.dictionaries.find({dirname: d.dirname});
    if (dict) {
      dict.value = val;
    }
  };

  getPropValue = (p) => {
    let {product} = this.props.productStore;
    let prop = product.properties.find({id: p.id});
    if (prop) {
      return prop.value;
    }
  };

  @action
  setPropValue = (p, val) => {
    let {product} = this.props.productStore;
    let prop = product.properties.find({id: p.id});
    if (prop) {
      prop.value = val;
    }
  };


  // TODO: status and button: create or edit product, cancel
  render() {
    let {productStore, t, language} = this.props;
    let {product, specifications, productColumns, baseProductFields} = productStore;

    if (!(productColumns && specifications))
      return null;

    if (!product)
      return <AppButton onClick={this.onClickAdd}>{t('Добавить продукт')}</AppButton>;

    let {dictionaries, properties} = specifications;
    let header = product._id ? `Продукт ${product.code}` : "Создание нового продукта"; // `
    let btnLabel = product._id ? t('Сохранить') : t('Добавить');

    let label = 'name';
    if (language && language.code === 'en')
      label = 'name_en';
    if (language && language.code === 'kg')
      label = 'name_kg';

    return (
      <Card className="animated fadeIn">
        <CardHeader>
          {t(header)}
          <div className={"card-actions"}>
            <AppButton onClick={this.onClickClose} size="sm" title={t('Закрыть')} className="mr-2">
              <i className={"fa fa-chevron-up"}/>
            </AppButton>
          </div>
        </CardHeader>

        <CardBody>
          <Row>
            <Col md={6}>
              {baseProductFields.map(f => {
                let field;

                switch (f.id) {
                  case 'code':
                    field = <AppInput value={product.code} disabled/>;
                    break;
                  case 'barcode':
                    field = <BarcodeInput value={product.barcode} callback={barcode => product.barcode = barcode}/>;
                    break;
                  case 'local':
                    field = <Switcher model={product} name="local"/>;
                    break;
                  case 'image':
                    field = <FileUploader path="products" multiple={false} files={product.image ? [product.image] : []}
                                          onChange={files => product.image = files.length ? files[0] : ''}/>;
                    break;
                  case 'images':
                    field = <FileUploader path="products" files={product.images}
                                          onChange={files => product.images = files}/>;
                    break;
                }

                return (
                  <FGI l={t(TableHeaders[f.id])} lf={4} ls={8} className="mt-2" key={f.id}>
                    {field}
                  </FGI>
                );
              })}

              {dictionaries.map((d, i) =>
                <FGI key={i} l={t(d.name)} lf={4} ls={8}>
                  <Select required
                          options={toJS(d.values)}
                          valueKey="_id"
                          labelKey={label}
                          value={this.getDictValue(d)}
                          onChange={val => this.setDictValue(d, val)}/>
                </FGI>
              )}
            </Col>

            <Col md={6}>
              {properties.map((p, i) =>
                <FGI l={t(p.name)} lf={4} ls={8} key={i}>
                  <Select required
                          options={toJS(p.values)}
                          valueKey="id"
                          labelKey={label}
                          value={this.getPropValue(p)}
                          onChange={val => this.setPropValue(p, val)}/>
                </FGI>
              )}
            </Col>
          </Row>
        </CardBody>

        <CardFooter>
          <AppButton color="success" type="submit" onClick={this.onClickSave} className="mr-2">
            {btnLabel}
          </AppButton>
          <AppButton color="danger" onClick={this.onClickClose}>
            {t('Закрыть')}
          </AppButton>
        </CardFooter>
      </Card>
    )
  }
}
