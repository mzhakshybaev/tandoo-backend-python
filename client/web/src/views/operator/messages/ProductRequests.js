import React from "react";
import AppTable from "components/AppTable";
import AppButton, {ConfirmButton} from "components/AppButton";
import Input, {FGI} from "components/AppInput";
import {Col, Collapse, FormGroup, Label} from "reactstrap";
import {inject} from "mobx-react";
import BarcodeInput from "components/BarcodeInput";
import {IMAGES_URL} from "utils/common";
import {formatDateTime} from "utils/helpers";
import Comment from "./Comment";
import {showError, showSuccess} from "utils/messages";
import {translate} from "react-i18next";

@inject("authStore", "specStore", "supplierStore", "dictStore")
@translate(['common', 'settings', ''])
export default class ProductRequests extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isTableVisible: true,
      isEditing: false,
      isCommentVisible: false,
      categories: [],
      ...this.getDefState()
    };
    // temporary Product request statuses
    this.status = {new: "В процессе", answered: "Добавлен", closed: "Отклонен"};

    this.tableHeaders = [
      {Header: "Название товара", accessor: "message.productName"},
      {Header: "Дата подачи", accessor: "message.published_date"},
      {Header: "Дата ответа", accessor: "message.answered_date"},
      {Header: "Статус", Cell: ({original}) => this.status[original.message_status], width: 120}]
  }

  getDefState() {
    // default state of New Request
    return {
      request: {
        id: null,
        category_id: null,
        barcode: null,
        productName: null,
        description: null,
        country_id: null,
        image: null,
        imagePreview: null
      }
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
    this.props.supplierStore.getProductRequests()
      .then(productRequests => {
        this.setState({productRequests})
      })
  }

  onViewClick = (pr) => {
    if (pr.message_status === "new") {
      let {categories, countries} = this.state;
      let request = {_id: pr._id, company_id: pr.company_id, ...pr.message, isTableVisible: false};
      request.imagePreview = IMAGES_URL + request.image;
      request.category = categories.find(c => c.id == pr.dircategory_id) || {};
      request.country = countries.find(c => c._id === pr.message.country_id) || {};

      this.setState({request, isTableVisible: false})
    }
  };

  onBackClick = () => {
    this.resetState({isTableVisible: true});
  };

  onRespondClick = (status) => {
    let {
      _id, category, company_id, barcode, productName,
      description, country, image, published_date
    } = this.state.request;
    let message = {
      barcode, productName, description, country_id: country._id, image,
      published_date, answered_date: formatDateTime(new Date())
    };
    let params = {
      _id,
      dircategory_id: category.id,
      message,
      message_status: status,
      company_id,
      data: {}
    };
    this.props.supplierStore.saveProductRequest(params)
      .then(() => {
        showSuccess("Статус запроса успешно обновился");
        this.getProductRequests();
        this.setState({isCommentVisible: true});
      })
      .catch(() => showError("Произошла ошибка"));

  };

  onDownloadPhotoClick = () => {
  };

  renderer = o => `${o.dircategory.code} ${o.dircategory.name}`;

  render() {
    let {request} = this.state;
    const {t} = this.props
    return <div>
      {this.state.isTableVisible &&
      <div className={"animated fadeIn"}>
        <h5>{t('Запросы на добавление товара')}</h5>
        <AppTable data={this.state.productRequests}
                  columns={this.tableHeaders}
                  onClick={this.onViewClick}
                  showRowNumbers={true}/>
      </div>
      }

      {!this.state.isTableVisible &&
      <div className={"animated fadeIn"}>
        <h5>{t('Запрос на добавление товара')}</h5>
        <Col>
          <FGI className={"mt-2"} l={"Категория"} lf={3} ls={9}>
            <Input value={request.category.dircategory && request.category.dircategory.name}/>
          </FGI>
          <FGI className={"mt-2"} l={"Название товара"} lf={3} ls={9}>
            <Input value={request.productName}/>
          </FGI>
          <FGI className={"mt-2"} l={"Описание"} lf={3} ls={9}>
            <Input value={request.description}/>
          </FGI>
          <FGI className={"mt-2"} l={"Страна"} lf={3} ls={5}>
            <Input value={request.country.name}/>
          </FGI>
          <FGI className={"mt-2"} l={"Штрих код"} lf={3} ls={4}>
            <BarcodeInput value={request.barcode}/>
          </FGI>
          <FormGroup row>
            <Label xs={3}>Фото</Label>
            <Col xs={3}>
              <img className={"file_img"}
                   src={request.imagePreview}/>
            </Col>
            <Col xs={3}>
              <AppButton onClick={this.onDownloadPhotoClick}
                         title={"Скачать"}>
                <i className={"fa fa-download"}/>
              </AppButton>
            </Col>
          </FormGroup>
        </Col>
        <Col md={8}>
          <Collapse isOpen={this.state.isCommentVisible}>
            <Comment requestId={request && request._id}/>
          </Collapse>
        </Col>
        <div className={"mt-3"}>
          <AppButton onClick={this.onBackClick}>
            Назад
          </AppButton>
          <ConfirmButton color={"danger"}
                         className={"mx-3"}
                         title={"Отклонить запрос?"}
                         onConfirm={() => this.onRespondClick("closed")}>
            Отклонить
          </ConfirmButton>
          <ConfirmButton color={"success"}
                         title={"Подтвердить добавление товара?"}
                         onConfirm={() => this.onRespondClick("answered")}>
            Добавить
          </ConfirmButton>
        </div>
      </div>
      }
    </div>;
  }
}
