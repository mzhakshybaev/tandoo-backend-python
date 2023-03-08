import React from "react";
import {FGI} from "components/AppInput";
import {Input} from "reactstrap";
import {inject} from "mobx-react";
import AppButton from "components/AppButton";
import {showError, showSuccess} from "utils/messages";

@inject("adminStore")
export default class extends React.Component {

  state = {};

  onSendComment = () => {
    let comment = {
      message_id: this.props.requestId,
      comment: "",
      data: {...this.state}
    };
    this.props.adminStore.saveComment(comment)
      .then(() => showSuccess("Комментарий отправлен"))
      .catch(() => showError("Произошла ошибка"));
  };

  render() {
    return <div className={"p-4"}>
      <h5>Комментарий</h5>
      <FGI l={"Код"} lf={3} ls={9}>
        <Input value={this.state.code}
               onChange={e => this.setState({code: e.target.value})}/>
      </FGI>
      <FGI l={"Раздел"} lf={3} ls={9}>
        <Input value={this.state.section}
               onChange={e => this.setState({section: e.target.value})}/>
      </FGI>
      <FGI l={"Категория"} lf={3} ls={9}>
        <Input value={this.state.category}
               onChange={e => this.setState({category: e.target.value})}/>
      </FGI>
      <FGI l={"Комментарий"} lf={3} ls={9}>
        <Input value={this.state.comment}
               onChange={e => this.setState({comment: e.target.value})}/>
      </FGI>
      <AppButton onClick={this.onSendComment}>Отправить</AppButton>
    </div>
  }
}
