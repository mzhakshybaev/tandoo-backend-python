import React from "react";
import {Breadcrumb, BreadcrumbItem, Col, Row} from "reactstrap";
import {inject, observer} from "mobx-react";
import {withRouter} from "react-router-dom";
import Filter from "./Filter";
import ProductsList from "./ProductsList";

@inject("catalogStore", "authStore") @withRouter @observer
class Catalog extends React.Component {

  componentDidMount() {
    this.props.catalogStore.load();
  }

  componentWillUnmount() {
    this.props.catalogStore.reset();
  }

  onAddProduct = product => {
    if (this.props.onAddProduct) {
      return this.props.onAddProduct(product);
    }

    this.props.catalogStore.selectedProduct = {
      ...product,
      product_id: product._id
    };
    this.props.history.push('/supplier/products/add');
  };

  isSupplier = () => {
    let {company} = this.props.authStore;
    return !!company;
  };

  handleClickBreadcrumbItem = (s, e, i) => {
    e.preventDefault();
    switch (s.type) {
      case 'section':
        this.props.catalogStore.setBreadcrumbSection();
        break
      case 'spec':
        this.props.catalogStore.updateBreadCrumb(i);
        break
      case 'dict':
        this.props.catalogStore.updateBreadCrumb(i);
        break
      case 'category':
        this.props.catalogStore.updateBreadCrumb(i);
        break

    }
  };

  render() {
    let {products, breadcrumb} = this.props.catalogStore;
    return (
      <Row>
        <Col xs={12} sm={3} md={3} xl={2}>
          <Filter/>
        </Col>
        <Col xs={12} sm={9} md={9} xl={10}>
          {breadcrumb.length > 0 &&
          <Row>
            <Col xs={12}>
              <Breadcrumb tag="nav" listTag="div" className='my-catalog-breadcrumb'>
                {breadcrumb && breadcrumb.map((s, i) =>
                  <BreadcrumbItem key={i} onClick={e => this.handleClickBreadcrumbItem(s, e, i)} tag='a' href="">
                    {s.name}
                  </BreadcrumbItem>
                )}
              </Breadcrumb>
            </Col>
          </Row>}
          <Row>
            <ProductsList products={products}
                          isSupplier={this.isSupplier}
                          onAddProduct={this.onAddProduct}/>
          </Row>
        </Col>
      </Row>
    )
  }
}

export default Catalog
