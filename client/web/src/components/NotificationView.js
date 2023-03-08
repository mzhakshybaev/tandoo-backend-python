import Editor from 'components/Editor';
import Button from "components/AppButton";
import React from "react";

export default ({title, editorState, onBackClick, _created}) => {
  return <div>
    <div className={"d-flex justify-content-between"}>
      <h5 className={"text-center"}>{title}</h5> <h6 className="text-muted">{_created}</h6>
    </div>
    <Editor
      readOnly
      editorState={editorState}
      onChange={_ => {
        /*its required*/
      }}/>
    <Button color="secondary" onClick={onBackClick}>Назад</Button>
  </div>
};
