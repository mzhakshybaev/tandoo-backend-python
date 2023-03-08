import React, {Component} from 'react';
import {Card, CardBody, Col, Collapse, Form, FormGroup, Input, Label, Row, Button} from "reactstrap";
import {inject, observer} from "mobx-react";
import {FGI} from "components/AppInput";
import {action, observable, runInAction} from "mobx";
import Loading from "components/Loading";
import {debounce} from 'lodash-es';

@inject('categoryStore') @observer
export default class Category extends Component {
  @observable items;
  @observable item;
  @observable ready = false;
  @observable search = '';
  categories;

  constructor(props) {
    super(props);
    this.dbcSearch = debounce(this.handleSearch, 300)
  }

  componentDidMount() {
    this.loadCategories();
  }

  componentWillUnmount() {
    this.reset();
  }

  @action
  reset() {
    this.categories = null;
    this.items = null;
    this.item = null;
    this.ready = false;
    this.search = '';
  }

  async loadCategories() {
    let categories = await this.props.categoryStore.getCategories();

    categories.forEach(c => {
      c.has_child = true;
      c.children = null;
      c.is_loading = false;
    });

    runInAction(() => {
      this.categories = categories;
      this.items = categories;
      this.ready = true;
    });
  }

  onSearch = (e) => {
    this.search = e.target.value;
    this.dbcSearch();
  };

  handleSearch = async () => {
    const {categoryStore} = this.props;

    if (this.search && this.search.length >= 3) {
      this.items = await categoryStore.getCategorySearch(this.search)

    } else {
      this.items = this.categories;
    }
  };

  @action
  onItemClick = (item) => {
    this.item = item;
  };

  render() {
    if (!this.ready)
      return <Loading/>;

    let {items, item} = this;

    return (
      <div className="animated fadeIn">
        <Row>
          <Col md={6}>
            <Card>
              <CardBody>
                <Input placeholder={'поиск'} value={this.search} onChange={this.onSearch}/>
                <ItemsList items={items} onClick={this.onItemClick}/>
              </CardBody>
            </Card>
          </Col>

          <Col md={6}>
            {item &&
            <Card>
              <CardBody>
                <FGI l='Код' lf={4} ls={8}>
                  <Input value={item.code} readOnly/>
                </FGI>
                <FGI l='Наименование' lf={4} ls={8}>
                  <Input value={item.name} readOnly/>
                </FGI>
                <FGI l='name_kg' lf={4} ls={8}>
                  <Input value={item.name_kg} readOnly/>
                </FGI>
                <FGI l='name_en' lf={4} ls={8}>
                  <Input value={item.name_en} readOnly/>
                </FGI>
              </CardBody>
            </Card>}
          </Col>
        </Row>
      </div>
    )
  }
}

@inject('categoryStore') @observer
class ItemsList extends Component {
  render() {
    let {items, onClick} = this.props;

    return items.map(item =>
      <Item key={item.id} {...{onClick, item}} />
    );
  };
}

@inject('categoryStore') @observer
class Item extends Component {
  @observable item;
  @observable children;
  @observable is_loading = false;
  @observable showForm = false;

  componentDidMount() {
    this.item = this.props.item;
  }

  componentWillUnmount() {
    this.item = null;
    this.children = null;
    this.is_loading = false;
  }

  onIconClick = async (e) => {
    // e.preventDefault();
    // e.stopPropagation();

    if (this.children) {
      // close
      this.children = null;

    } else if (this.item.has_child) {
      // load
      this.is_loading = true;
      let children = await this.props.categoryStore.getCategoryById(this.item.id);

      runInAction(() => {
        this.children = children;
        this.is_loading = false;
      });

    } else {
      // no children
      this.onClick()
    }
  };

  onClick = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    let {onClick} = this.props;
    onClick && onClick(this.item);
  };

  showFormHandler = (e) =>{
    this.showForm = !this.showForm;
    e.preventDefault();
    e.stopPropagation();
  };

  registerEntry = async (data)=>{
    // let res = await this.props.categoryStore.setCategories(data); // это нужно активировать после настройки роута на бэкенде
    alert(`Вы зарегистрировали новую запись с кодом - ${data['code']}. \r\nРодительский код - ${data['parent_id']}`);
    this.showForm = false;
  };

  render() {
    if (!this.item)
      return null;

    let {item, children, is_loading, showForm} = this;
    let {has_child} = item;
    let is_open = has_child && !!children;

    return (
      <div className="item" onClick={this.onClick}>
        <a href="" onClick={this.onIconClick} style={{display:'block', color: 'inherit'}} className={'clearfix'}>
          {has_child ?
            is_loading ?
              <i className="fa fa-spinner fa-spin" title="Загрузка"/> :
              is_open ?
                <i className="fa fa-folder-open" title="Закрыть"/> :
                <i className="fa fa-folder" title="Раскрыть"/> :
            <i className="fa fa-file" title="Нет потомков"/>
          }

          <strong>{item.code} </strong>
          {item.name}

          <Button size={'sm'} onClick={this.showFormHandler} color="info" outline className={'float-right'}>
            {showForm ? 'Скрыть запись' : 'Добавить запись'}
          </Button>

        </a>

        {showForm && <AddEntryForm onClick={this.registerEntry} item={item}/>}

        {is_open &&
        <div className="children ml-1">
          <ItemsList items={children} onClick={this.props.onClick}/>
        </div>
        }
      </div>
    );
  }
}

const AddEntryForm = (props) => {
  let data = {};
  data['parent_id'] = props.item.id;

  let onChangeMeth = (event) => {
    let {value, name} = event.target;
    data[name] = value;
  };

  return (
    <Form>
      <FormGroup row>
        <Label for="nameRu" sm={2}>Русский</Label>
        <Col sm={10}>
          <Input type="text" name="name_ru" id="nameRu" placeholder="Название" onChange={onChangeMeth}/>
        </Col>
      </FormGroup>
      <FormGroup row>
        <Label for="nameKg" sm={2}>Кыргызский</Label>
        <Col sm={10}>
          <Input type="text" name="name_kg" id="nameKg" placeholder="Аталыш" onChange={onChangeMeth}/>
        </Col>
      </FormGroup>
      <FormGroup row>
        <Label for="nameEn" sm={2}>Английский</Label>
        <Col sm={10}>
          <Input type="text" name="name_en" id="nameEn" placeholder="The name" onChange={onChangeMeth} required/>
        </Col>
      </FormGroup>
      <FormGroup row>
        <Label for="codeNum" sm={2}>Код</Label>
        <Col sm={10}>
          <Input type="text" name="code" id="codeNum" placeholder="123-456" onChange={onChangeMeth} required/>
        </Col>
      </FormGroup>
      <Button color="info" block size={'sm'} onClick={()=>props.onClick(data)}>Зарегистрировать</Button>
    </Form>
  );
};
