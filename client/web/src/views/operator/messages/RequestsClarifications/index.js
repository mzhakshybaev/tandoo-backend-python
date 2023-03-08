import React from "react";
import Table from "./Table";
import Builder from "./Builder";
import {EditorState} from "draft-js";

export default class Index extends React.Component {

  state = {
    isTableVisible: true,
    isViewingItem: false, // viewing created request / clarification
    notifications: [],
    recipients: [{_id: "all", name: "Все"}],
    ...this.getDefState(),
  };

  reset(extra) {
    this.setState({...this.getDefState(), ...extra})
  }

  getDefState() {
    return {editorState: EditorState.createEmpty()}
  }

  onItemClick = () => {

  };

  onSendClick = () => {

  };

  render() {
    return <div className={"animated fadeIn"}>
      {this.state.isTableVisible &&
      <Table data={[]}
             onItemClick={this.onItemClick}
             onCreateClick={() => this.setState({isTableVisible: false})}/>
      }

      {!this.state.isTableVisible && <Builder
        editorState={this.state.editorState}
        onChange={editorState => this.setState({editorState})}
        onBackClick={() => this.reset({isTableVisible: true})}
        onClearClick={() => this.reset()}
        onSendClick={this.onSendClick}/>
      }
    </div>
  }
}
