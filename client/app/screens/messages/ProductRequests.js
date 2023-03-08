import React from "react";
import {inject} from "mobx-react"
import {showError, showSuccess} from "../../../utils/messages";
import {IMAGES_URL} from "../../../utils/common";
import {formatDateTime} from "../../../utils/helpers";
import {translate} from "react-i18next";
import Toolbar, {Title, ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import ScreenWrapper from "../../components/ScreenWrapper";
import Card from "../../components/Card";
import Input from "../../components/Input";
import {PopupList} from "../../components/PopupList";
import ItemView from "../../components/ItemView";
import Button, {ActionButton} from "../../components/Button";
import vars from "../../common/vars";
import {NoDataView} from "../../components/Spinner";
import {View} from "react-native";

@translate(['common', 'settings', '']) @inject("authStore", "specStore", "supplierStore", "dictStore")
export default class AddProductRequests extends React.Component {
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
      imagePreview: null
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
    let category = categories.find(c => c.id === pr.dircategory_id);
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

    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>Запросы на добавление товара</ToolbarTitle>
      </Toolbar>
    );

    return <ScreenWrapper header={Header}>
      {state.isTableVisible &&
      <>
        <Button onPress={this.onNewRequestClick} title={t('Создать запрос')}/>
        {state.productRequests ? state.productRequests.map((p, i) => <Card key={i} title={p.message.productName}>
          <ItemView label={t("Дата подачи")} value={p.message.published_date}/>
          <ItemView label={t("Дата ответа")} value={p.message.answered_date}/>
          <ItemView label={t("Статус")} value={<View style={{flexDirection: 'row', alignItems: 'center'}}>
            <ActionButton name={'edit'} onPress={() => this.onEditClick(p)}/>
            <ActionButton name={'trash'} onPress={() => this.onRemoveClick(p)} color={vars.red}/>
          </View>}/>
        </Card>) : <NoDataView/>}
      </>
      }

      {!state.isTableVisible &&
      <Card>
        <Input label={t('Название')} value={state.productName}
               onChange={productName => this.setState({productName})}/>
        <Input label={t('Описание')} value={state.description}
               onChange={description => this.setState({description})}/>
        <Input label={t('Производитель')} value={state.manufacturer}
               onChange={manufacturer => this.setState({manufacturer})}/>
        <Input l={t('Товарные знаки (марка, бренд)')} value={state.brand}
               onChange={brand => this.setState({brand})}/>
        <PopupList placeholder={t('Страна производителя')}
                   label={t('Страна')}
                   value={state.country_id}
                   valueCode={"_id"}
                   valueName={"name"}
                   items={state.countries}
                   onChange={country_id => this.setState({country_id})}/>
        <Input label={t('Штрих код')} value={state.barcode}
               onChange={barcode => this.setState({barcode})}/>

        {state.message_status === 'closed' &&
        <>
          <Title>Комментарий</Title>
          <ItemView label={t('Описание')} value={state.comment[0].data.code}/>
          <ItemView label={t('Описание')} value={state.comment[0].data.section}/>
          <ItemView label={t('Описание')} value={state.comment[0].data.category}/>
          <ItemView label={t('Описание')} value={state.comment[0].data.comment}/>
        </>
        }
        {state.message_status === 'new' &&
        <>
          <Button color={vars.red} onPress={this.onCancelClick} title={t('Отменить')}/>
          <Button color={vars.secondary} onPress={this.onSaveClick} title={t("" + buttonTitle + "")}/>
        </>
        }
        {state.message_status === 'closed' &&
        <Button color={vars.red} onPress={this.onCancelClick} title={t('Отменить')}/>
        }
      </Card>
      }
    </ScreenWrapper>;
  }
}
