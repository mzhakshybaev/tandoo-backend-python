import React from "react";
import ReactFileReader from 'react-file-reader';
import AppButton from "./AppButton";
import {FormText, Row} from "reactstrap";
import {translate} from "react-i18next";
import {EMPTY_PDF} from "../../../utils/common";
import Img from 'react-image';


@translate(['common', 'settings', ''])
export default class MultipleImageInput extends React.Component {

  render() {
    let {t, fileHandler, deleteHandler, btnLabel, imgPreview, comment} = this.props;

    return (
      <div>
        <ReactFileReader fileTypes={[".jpg", ".png", '.jpeg', '.gif', '.pdf']}
                         base64={true} multipleFiles={true}
                         handleFiles={fileHandler}>
          <div>
            <AppButton outline block>{btnLabel || t('Выбрать')}</AppButton>
            {comment && <FormText color="muted">{comment}</FormText>}
          </div>
        </ReactFileReader>

        <Row>
          {imgPreview && imgPreview.map((imgPreview, i) => (
            <div key={i} style={{position: 'relative'}} className="mr-1 mb-1">

              {deleteHandler &&
              <i className="fa fa-times-circle" title={t('Удалить')} onClick={() => deleteHandler(i)}
                 style={{
                   position: 'absolute',
                   top: -5,
                   right: -5,
                   zIndex: 1,
                   cursor: 'pointer'
                 }}/>
              }

              <Img src={imgPreview}
                   alt="Image preview"
                   className="file_img"
                   unloader={<img src={EMPTY_PDF} alt="Image preview"/>}/>
            </div>
          ))}
        </Row>
      </div>

    )
  }
}
