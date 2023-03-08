import React, {Fragment} from "react"
import {CustomInput} from "reactstrap";
import Editor from "components/Editor";
import AppButton from "components/AppButton";
import Input, {Fg} from "components/AppInput";

// TODO: Restrict to only 1500 chars and 5 files in content
export default (props) => {
  return (
    <Fragment>
      <h5>Новое уведомление</h5>

      <Fg label={"Тема"} className={"mb-3"}>
        <Input value={props.title} onChange={props.onTitleChange}/>
      </Fg>
      <Editor
        editorState={props.editorState}
        onChange={props.onChange}/>

      <Fg className={"mt-3"} row>
        {props.recipients.map(r => <CustomInput key={r._id} type="radio"
                                                id={r._id} value={r._id}
                                                label={r.name} name="recipient"
                                                onChange={e => props.onRecipientChange(e.target.value)}/>)}

      </Fg>

      <div className={"mt-2"}>
        <AppButton color="danger" onClick={props.onBackClick}>Назад</AppButton>
        <AppButton className={"mx-2"} onClick={props.onSendClick}>Отправить</AppButton>
      </div>
    </Fragment>)
};
