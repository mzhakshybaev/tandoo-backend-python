import React from "react";
import {MaskedInput} from "components/MaskedInput"

export default (props) => {
  return <MaskedInput mask="9999999999999"
                      value={props.value}
                      callback={props.callback}/>
}
