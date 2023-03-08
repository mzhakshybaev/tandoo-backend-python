import React from "react";
import Product from "./Product";

export default (props) => {
  let products = props.products || [];
  return products.map(p =>
    <Product key={p._id}
             product={p}
             isSupplier={props.isSupplier}
             onAddProduct={props.onAddProduct}/>
  )
};
