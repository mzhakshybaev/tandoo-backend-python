import React, {Component} from "react";
import Img from 'react-image';
import {EMPTY_IMG} from 'utils/common';
import Loading from "./Loading";

export default class Image extends Component {
  render() {
    // TODO: add IMAGES_URL
    return <Img loader={<Loading/>}
                unloader={<img {...this.props} src={EMPTY_IMG}/>}
                {...this.props}/>;

  }
}
