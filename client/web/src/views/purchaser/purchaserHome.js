import React, {Component} from 'react';


export default class purchaserHome extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {


    return (
      <div className="app flex-row align-items-center justify-content-center"
           style={{minHeight: "60vh", textAlign: "center"}}>
        <h3> Добро пожаловать в личный кабинет
          закупающей организации!</h3>
      </div>
    )
  }


}
