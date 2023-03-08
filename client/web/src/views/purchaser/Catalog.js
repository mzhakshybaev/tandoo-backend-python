import React, {Component} from "react";
import {
  Card,
  Nav,
  NavItem,
  NavLink,
  CardBody,
  Col,
  CustomInput,
  Row,
  TabPane,
  TabContent,
  Breadcrumb, BreadcrumbItem
} from "reactstrap";
import Button from "components/AppButton";
import {inject, observer} from "mobx-react";
import {IMAGES_URL} from "utils/common";
import {formatMoney} from "utils/helpers";
import {withRouter} from "react-router-dom";
import Img from 'components/Image';
import Loading from 'components/Loading';
import {translate} from "react-i18next";
import {showError} from "utils/messages";

@translate(['common', 'settings', '']) @inject('mainStore', 'authStore', 'purCatalogCtrl') @withRouter @observer
export default class Catalog extends Component {
  componentDidMount() {
    this.ctrl = this.props.purCatalogCtrl;
    let ann_id = this.props.match.params.id;
    this.load(ann_id);
  }

  componentWillUnmount() {
    this.ann_id = null;
    this.ctrl.reset();
  }

  load(ann_id) {
    this.ann_id = ann_id;
    this.ctrl.load(ann_id);
  }

  toggleSection = (section, e) => {
    e.preventDefault();
    this.ctrl.selectSection(section);
    // this.ctrl.setBreadcrumbSection();
  };

  handleClickBreadcrumbItem = (s, e, i) => {
    e.preventDefault();
    switch (s.type) {
      case 'section':
        this.ctrl.setBreadcrumbSection(true);
        break;
      case 'spec':
        this.ctrl.updateBreadCrumb(i);
        break;
      case 'dict':
        this.ctrl.updateBreadCrumb(i);
        break;
      case 'national':
        this.ctrl.updateBreadCrumb(i);
        break;
      case 'category':
        this.ctrl.updateBreadCrumb(i);
        break;
    }
  };

  toggleCategory = (category, e) => {
    e.preventDefault();
    this.ctrl.setBreadcrumbSection();
    this.ctrl.selectCategory(category);
    this.ctrl.setBreadcrumbCategory(category, true);
  };

  handleAddLot = async (p) => {
    let {t} = this.props;
    try {
      await this.ctrl.addLot(p);
      this.props.history.push('/purchaser/basket' + (this.ann_id ? ('/' + this.ann_id) : ''));
    } catch (e) {
      showError(t(e.message || 'Ошибка'))
    }
  };

  render() {
    if (!(this.ctrl && this.ctrl.ready))
      return <Loading/>;

    const {mainStore} = this.props;
    const {language} = mainStore;

    let label = 'name';
    if (language && language.code === 'en') {
      label = 'name_en';
    }
    if (language && language.code === 'kg') {
      label = 'name_kg';
    }

    let {
      sections, sectionCategories, section: currentSection, category: currentCategory,
      disableSectionSelect, breadcrumb
    } = this.ctrl;


    return (
      <div className="animated fadeIn">

        <Nav tabs id="catalog-menu-sections">
          {sections && sections.map((s, i) =>
            <NavItem key={i}>
              <NavLink onClick={e => this.toggleSection(s, e)} href="" active={s === currentSection}
                       disabled={disableSectionSelect}>
                {s[label]}
              </NavLink>
            </NavItem>
          )}
        </Nav>

        <TabContent>
          <TabPane>
            <Nav id="catalog-menu-categories">
              {sectionCategories && sectionCategories.map((s, i) =>
                <NavItem key={i}>
                  <NavLink onClick={e => this.toggleCategory(s, e)} href="" active={s === currentCategory}>
                    {s.dircategory[label]}
                  </NavLink>
                </NavItem>
              )}
            </Nav>

            <Breadcrumb tag="nav" listTag="div">
              {breadcrumb && breadcrumb.map((s, i) =>
                <BreadcrumbItem key={i} onClick={e => this.handleClickBreadcrumbItem(s, e, i)} tag='a' href=""
                                active={i === currentSection}>
                  {s.name}
                </BreadcrumbItem>
              )}
            </Breadcrumb>

            <Row>
              <Col xs={12} sm={3} md={3} xl={2}>
                {this.renderFilter()}
              </Col>

              <Col xs={12} sm={9} md={9} xl={10}>
                {this.renderProducts()}
              </Col>
            </Row>

          </TabPane>
        </TabContent>
      </div>
    );
  }

  renderFilter() {
    const {t, mainStore} = this.props;
    const {language} = mainStore;
    let label = 'name';
    if (language && language.code === 'en')
      label = 'name_en';
    if (language && language.code === 'kg')
      label = 'name_kg';

    let {
      sections, sectionCategories, section, category, filters, local,
      selectSection, selectCategory, selectDict, selectSpec, setLocal
    } = this.ctrl;

    return (
      <div>
        {section && category &&
        <Card>
          <CardBody>
            <CustomInput type="checkbox" label={t('Отечественная продукция')} className="mt-2"
                         onChange={setLocal} id="is-local-manufacture"/>

            {filters && filters.dictionaries && filters.dictionaries.map((d, i) =>
              <div key={i} className="mt-2">
                <strong>{t("" + d.displayName + "")}</strong>

                {d.values.map((dv, j) =>
                  <CustomInput key={j} type="checkbox" className="ml-2"
                               id={dv.name} label={t(dv.name)} checked={dv.checked} disabled={dv._disabled}
                               onChange={e => selectDict(dv, e.target.checked)}/>
                )}
              </div>
            )}

            {filters && filters.specifications && filters.specifications.map((s, i) =>
              <div key={i} className="mt-2">
                <strong>{s.property}</strong>

                {s.values.map((sv, j) =>
                  <CustomInput key={j} type="checkbox" className="ml-2"
                               id={sv.name} label={t("" + sv.name + "")} checked={sv.checked}
                               onChange={e => selectSpec(sv, e.target.checked)}/>
                )}
              </div>
            )}
          </CardBody>
        </Card>
        }
      </div>)
  }

  renderProducts() {
    const {t} = this.props;
    let {products, section, category} = this.ctrl;

    if (!products || !products.length) {
      if (this.props.mainStore.isBusy)
        return <Loading/>;
      else if (section && category)
        return t('Не найдено');
      else
        return <span>&nbsp;</span>; // IE11 compat
    }

    return (
      <Row>
        {products.map(p =>
          <Col key={p._id} xs={6} sm={4} md={3} xl={2}>
            <div className="product cat">
              <div className="img ">
                <Img src={IMAGES_URL + p.image} onClick={() => {
                  this.props.history.push(`/product/${p._id}`)
                }}/>
              </div>
              <p>{t('Код') + ' ' + p.code}</p>
              <span>{p["Товарные знаки(марка, бренд)"]}</span>
              <p className='price'>{formatMoney(p.unit_price)}</p>

              {this.props.authStore.isPurchaser &&
              <div className='mt-1'>
                <Button size={'sm'} outline color="success"
                        onClick={() => this.handleAddLot(p)}>{t('Добавить товар')}</Button>
              </div>}
            </div>
          </Col>
        )}
      </Row>
    )
  }
}
