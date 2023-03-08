import React, {Component} from 'react';
import {Card, CardBody, CardHeader, Collapse} from "reactstrap";
import AppButton from "components/AppButton";

export default class ExpandablePanel extends Component {
  state = {open: true};

  render() {
    const {title, children, onHeaderClick} = this.props;
    return (
      <Card>
        <CardHeader className='cursor-pointer'
                    onClick={() => {
                      if (onHeaderClick)
                        onHeaderClick();
                    }}>
          {title}
          <div className="card-actions">
            <AppButton onClick={() => this.setState({open: !this.state.open})}>
              {this.state.open ? <i className="icon-chevron-up"/> : <i className="icon-chevron-down"/>}
            </AppButton>
          </div>
        </CardHeader>
        <Collapse isOpen={this.state.open}>
          <CardBody>
            {children}
          </CardBody>
        </Collapse>
      </Card>
    )
  }
}
