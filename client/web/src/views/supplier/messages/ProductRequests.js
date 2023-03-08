import React from "react";
import AppTable from "components/AppTable";
import AppButton from "components/AppButton";
import Input, {FGI} from "components/AppInput";
import Select from "components/Select";
import {Card, CardBody, CardHeader, CardTitle, Col, FormGroup, Label} from "reactstrap";
import ImageInput from "components/ImageInput";
import {inject} from "mobx-react"
import BarcodeInput from "components/BarcodeInput";
import {showError, showSuccess} from "utils/messages";
import {IMAGES_URL} from "utils/common";
import {formatDateTime} from "utils/helpers";
import {translate} from "react-i18next";

@translate(['common', 'settings', '']) @inject("authStore", "specStore", "supplierStore", "dictStore")
export default class ProductRequests extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isTableVisible: true,
      isEditing: false,
      categories: [],
      ...this.getDefState()
    };

    // temporary Product request statuses
    this.status = {new: "В процессе", answered: "Добавлен", closed: "Отклонен"};

    // this.tableHeaders = [
    //   {Header: "Название товара", accessor: "message.productName"},
    //   {Header: "Дата подачи", accessor: "message.published_date"},
    //   {Header: "Дата ответа", accessor: "message.answered_date"},
    //   {Header: "Статус", Cell: ({original}) => this.status[original.message_status], width: 120},
    //   {
    //     Cell: ({original}) => [
    //       <AppButton key={1} size={"sm"} outline
    //                  disabled={original.message_status !== "new"}
    //                  onClick={() => this.onEditClick(original)}>
    //         <i className={"fa fa-edit"}/>
    //       </AppButton>, " ",
    //       <AppButton key={2} size={"sm"} outline color={"danger"}
    //                  onClick={() => this.onRemoveClick(original)}>
    //         <i className={"fa fa-trash"}/>
    //       </AppButton>,
    //     ], width: 72
    //   }]
  }

  getDefState() {
    // default state of New Request
    return {
      id: null,
      category_id: null,
      comment: null,
      barcode: null,
      productName: null,
      description: null,
      country_id: null,
      manufacturer: null,
      brand: null,
      image: null,
      imagePreview: null,
      message_status: 'new',
    };
  }

  resetState(extra) {
    this.setState({...this.getDefState(), ...extra})
  }

  componentDidMount() {
    this.resetState();
    this.getData();
  }

  async getData() {
    let p = this.props;
    let [categories, countries] = await Promise.all([
      p.specStore.getSpecifications(),
      p.dictStore.getDictData("DirCountry")]);
    this.setState({categories, countries}, this.getProductRequests);
  }

  getProductRequests() {
    let company_id = this.props.authStore.company._id;
    this.props.supplierStore.getProductRequests({filter: {company_id}, with_related: true})
      .then(productRequests => {
        this.setState({productRequests})
      })
  }

  handleFiles(imgName, previewName, file) {
    this.setState({[previewName]: file.base64});
    this.props.supplierStore.uploadImage(file.base64.split(',')[1]).then(r => {
      this.setState({[imgName]: r.file})
    })
  }

  onNewRequestClick = () => {
    this.setState({isTableVisible: false});
  };

  onRemovePhotoClick = () => {
    this.setState({image: null, imagePreview: null})
  };

  onCancelClick = () => {
    this.resetState({isTableVisible: true, isEditing: false});
  };

  onSaveClick = () => {
    let {
      category_id, barcode, productName,
      description, country_id, image, isEditing, manufacturer, brand
    } = this.state;
    let message = {
      barcode, productName, description, country_id, image,
      published_date: formatDateTime(new Date())
    };
    let company_id = this.props.authStore.company._id;
    let params = {
      dircategory_id: category_id,
      message,
      message_status: "new",
      company_id,
      manufacturer,
      brand,
      data: {}
    };
    if (isEditing) params._id = this.state.id;
    this.props.supplierStore.saveProductRequest(params)
      .then(r => {
        let message = isEditing ? "Запрос успешно сохранен" : "Запрос успешно создан";
        showSuccess(message);
        this.resetState({isTableVisible: true, isEditing: false});
        this.getProductRequests();
      })
      .catch(e => showError("Произошла ошибка"))
  };

  onEditClick = (pr) => {
    let {categories, countries} = this.state;
    let state = {
      id: pr._id, ...pr.message, manufacturer: pr.manufacturer, brand: pr.brand, comment: pr.comment,
      message_status: pr.message_status, isTableVisible: false, isEditing: true
    };
    state.imagePreview = IMAGES_URL + state.image;
    let category = categories.find(c => c.id == pr.dircategory_id);
    if (category) state.category_id = category.id;

    let country = countries.find(c => c._id === pr.message.country_id);
    if (country) state.country_id = country._id;

    this.setState(state)
  };

  onRemoveClick = (pr) => {

  };

  renderer = o => `${o.dircategory.code} ${o.dircategory.name}`;

  render() {
    const {t} = this.props;
    let state = this.state;
    let buttonTitle = state.isEditing ? "Сохранить" : "Отправить";
    return <div>
      {state.isTableVisible &&
      <Card>
        <CardHeader>
          <div className="card-actions">
            <AppButton className={"mt-2"}
                       onClick={this.onNewRequestClick}>
              <i className={"fa fa-plus"}/>{t('Создать запрос')}
            </AppButton>
          </div>
        </CardHeader>
        <CardBody>
          <CardTitle>{t('Запросы на добавление товара')}</CardTitle>
          <div className={"animated fadeIn"}>
            <AppTable data={state.productRequests}
                      columns={[
                        {Header: t("Наименование товара"), accessor: "message.productName"},
                        {Header: t("Дата подачи"), accessor: "message.published_date"},
                        {Header: t("Дата ответа"), accessor: "message.answered_date"},
                        {Header: t("Статус"), Cell: ({original}) => this.status[original.message_status], width: 120},
                        {
                          Cell: ({original}) => [
                            <AppButton key={1} size={"sm"} outline
                              // disabled={original.message_status !== "new"}
                                       onClick={() => this.onEditClick(original)}>
                              <i className={"fa fa-edit"}/>
                            </AppButton>, " ",
                            <AppButton key={2} size={"sm"} outline color={"danger"}
                                       onClick={() => this.onRemoveClick(original)}>
                              <i className={"fa fa-trash"}/>
                            </AppButton>,
                          ], width: 72
                        }]}
                      showRowNumbers={true}/>
          </div>
        </CardBody>
      </Card>

      }

      {!state.isTableVisible &&
      <div className={"animated fadeIn"}>
        <h5>{t('Запрос на добавление товара')}</h5>
        <Col>

          <FGI className={"mt-2"} l={t('Название')} lf={3} ls={9}>
            <Input value={state.productName}
                   onChange={e => this.setState({productName: e.target.value})}/>
          </FGI>
          <FGI className={"mt-2"} l={t('Описание')} lf={3} ls={9}>
            <Input value={state.description}
                   onChange={e => this.setState({description: e.target.value})}/>
          </FGI>
          <FGI className={"mt-2"} l={t('Производитель')} lf={3} ls={9}>
            <Input value={state.manufacturer}
                   onChange={e => this.setState({manufacturer: e.target.value})}/>
          </FGI>
          <FGI className={"mt-2"} l={t('Товарные знаки (марка, бренд)')} lf={3} ls={9}>
            <Input value={state.brand}
                   onChange={e => this.setState({brand: e.target.value})}/>
          </FGI>
          <FGI className={"mt-2"} l={t('Страна')} lf={3} ls={5}>
            <Select placeholder={t('Страна производителя')}
                    value={state.country_id}
                    valueKey={"_id"}
                    labelKey={"name"}
                    simpleValue
                    options={state.countries}
                    onChange={country_id => this.setState({country_id})}/>
          </FGI>
          <FGI className={"mt-2"} l={t('Штрих код')} lf={3} ls={4}>
            <BarcodeInput value={state.barcode}
                          callback={barcode => this.setState({barcode})}/>
          </FGI>
          <FormGroup row>
            <Label xs={3}>{t('Фото')}</Label>
            <Col xs={4}>
              <ImageInput fileHandler={file => this.handleFiles("image", "imagePreview", file)}
                          comment={state.image || t('Загрузить файл')}
                          imgPreview={state.imagePreview}/>
            </Col>
            <Col xs={3}>
              <AppButton color={"danger"}
                         onClick={this.onRemovePhotoClick}>
                <i className={"fa fa-trash"}/>
              </AppButton>
            </Col>
          </FormGroup>
          {state.message_status === 'closed' &&
          <div className={"animated fadeIn"}>
            <h5>Комментарий</h5>
            <FGI className={"mt-2"} l={t('Описание')} lf={3} ls={9}>
              {state.comment[0].data.code}
            </FGI>
            <FGI className={"mt-2"} l={t('Описание')} lf={3} ls={9}>
              {state.comment[0].data.section}
            </FGI>
            <FGI className={"mt-2"} l={t('Описание')} lf={3} ls={9}>
              {state.comment[0].data.category}
            </FGI>
            <FGI className={"mt-2"} l={t('Описание')} lf={3} ls={9}>
              {state.comment[0].data.comment}
            </FGI>
          </div>
          }
        </Col>
        {state.message_status === 'new' &&
        <div className={"mt-3"}>
          <AppButton color={"danger"}
                     className={"mx-3"}
                     onClick={this.onCancelClick}>
            {t('Отменить')}
          </AppButton>
          <AppButton color={"success"}
                     onClick={this.onSaveClick}>
            {t("" + buttonTitle + "")}
          </AppButton>
        </div>
        }
        {state.message_status === 'closed' &&
        <div className={"mt-3"}>
          <AppButton color={"danger"}
                     className={"mx-3"}
                     onClick={this.onCancelClick}>
            {t('Отменить')}
          </AppButton>
        </div>
        }
      </div>
      }
    </div>;
  }
}
