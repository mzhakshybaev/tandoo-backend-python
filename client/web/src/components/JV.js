// JSON Viewer
import RJV from "react-json-view";
import React from "react";
import {toJS} from 'mobx'

export default props => {
  let {
    src,
    name = "root",
    indentWidth = 2,
    collapsed = 1,
    collapseStringsAfterLength = 15,
    displayDataTypes = false,
    ...rest
  } = props;

  let rjvProps = {
    src: toJS(src),
    name,
    indentWidth,
    collapsed,
    collapseStringsAfterLength,
    displayDataTypes,
    ...rest
  };

  return (
    <RJV {...rjvProps}/>
  )
}
