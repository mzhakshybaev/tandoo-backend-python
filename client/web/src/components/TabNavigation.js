import React from 'react';
import {NavLink} from "react-router-dom";

export default class Tabs extends React.Component {
  render() {

    const {items} = this.props;

    return (
      <ul className="tabMenu">
        {items.map(i =>
          <li key={i.route}><NavLink to={i.route}>{i.title}</NavLink></li>
        )}
      </ul>
    )
  }
}
