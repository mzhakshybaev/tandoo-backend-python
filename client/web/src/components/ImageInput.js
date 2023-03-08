import React from "react";
import ReactFileReader from 'react-file-reader';
import AppButton from "./AppButton";
import {FormText} from "reactstrap";
import {translate} from "react-i18next";

@translate(['common', 'settings', ''])
export default class ImageInput extends React.Component {

  render() {
    const {t} = this.props;
    let {fileHandler, btnLabel, comment, imgPreview} = this.props;
    return (
      <div>
        <ReactFileReader fileTypes={[".jpg", ".png", '.jpeg', '.gif']}
                         base64={true}
                         handleFiles={fileHandler}>
          <div>
            <AppButton outline block>{btnLabel || t('Выбрать')}</AppButton>
            {comment && <FormText color="muted">{comment}</FormText>}
          </div>
        </ReactFileReader>
        {
          imgPreview &&
          <img src={imgPreview}
               alt="Image preview"
               className={"file_img"}/>
        }
      </div>
    )
  }
}
