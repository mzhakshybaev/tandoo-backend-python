import React from "react";
import ReactFileReader from 'react-file-reader';
import AppButton from "./AppButton";
import {FormText} from "reactstrap";

export default class FileInput extends React.Component {

  render() {
    let {fileHandler, btnLabel, comment, filename} = this.props;
    return (
      <div>
        <ReactFileReader fileTypes={['.doc', '.pdf']}
                         base64={true}
                         handleFiles={fileHandler}>
          <div>
            <AppButton outline block>{btnLabel || "Выбрать"}</AppButton>
            {comment && <FormText color="muted">{comment}</FormText>}
          </div>
        </ReactFileReader>
        {
          filename &&
          <h6>{}</h6>
        }
      </div>
    )
  }
}
