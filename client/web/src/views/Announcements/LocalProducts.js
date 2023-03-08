import React from "react";
import {Row} from "reactstrap";
import {inject, observer} from "mobx-react";
import {withRouter} from "react-router-dom";
import ProductsList from "../operator/Catalog/ProductsList";

@inject("productStore") @withRouter @observer
class LocalProducts extends React.Component {

  componentWillUnmount() {
    this.props.productStore.reset();
  }

  componentDidMount() {
    this.props.productStore.getLocalProducts();
  }

  onAddProduct = product => {
    console.log('add product');
  };

  isSupplier = () => {
    return false;
  };


  render() {
    let {products} = this.props.productStore;
    return (
      <Row>
        <ProductsList products={products} isSupplier={this.isSupplier} onAddProduct={this.onAddProduct}/>
      </Row>
    )
  }
}

export default LocalProducts
