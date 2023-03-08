import React, {Fragment} from "react"
import Editor from "components/Editor";
import AppButton from "components/AppButton";
import Input, {Fg} from "components/AppInput";

export default (props) => {
  return (
    <Fragment>
      <Fg label={"Тема"} className={"mb-3"}>
        <Input value={props.title} onChange={props.onTitleChange}/>
      </Fg>
      <Editor
        editorState={props.editorState}
        onChange={props.onChange}/>
      <div className={"mt-2"}>
        <AppButton color="danger" onClick={props.onBackClick}>Назад</AppButton>
        <AppButton className={"mx-2"} onClick={props.onSendClick}>Отправить</AppButton>
      </div>
    </Fragment>)
};
