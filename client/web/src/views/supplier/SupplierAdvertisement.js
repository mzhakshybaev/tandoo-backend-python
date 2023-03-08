import React, {Component} from 'react'
import classnames from "classnames";
import {Col, ListGroup, ListGroupItem, Nav, NavItem, NavLink, Row, TabContent, TabPane,} from "reactstrap";
import {translate} from "react-i18next";

@translate(['common', 'settings', ''])
class Obyavlenia extends Component {
  state = {
    activeTab: '1'
  };

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  render() {
    const {t} = this.props;
    return (
      <div>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({active: this.state.activeTab === '1'})}
              onClick={() => {
                this.toggle('1');
              }}
            >
              {t('Все объявления')}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({active: this.state.activeTab === '2'})}
              onClick={() => {
                this.toggle('2');
              }}
            >
              {t('Запрос предложений')}
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId="1">
            <Row>
              <Col sm="12">
                <ListGroup>
                  <ListGroupItem tag="a" action>Tatatatatatat</ListGroupItem>
                  <ListGroupItem tag="a" action>dadadadadadadad</ListGroupItem>
                  <ListGroupItem tag="a" action>yeyeyeyeyeyeyeyeyeyeye</ListGroupItem>
                  <ListGroupItem tag="a" action>uiuiuiuiuiuiuiuiuiuiuiu</ListGroupItem>
                </ListGroup>
              </Col>
            </Row>
          </TabPane>
          <TabPane tabId="2">
            <Row>
              <Col sm="12">
                {t('Запрос предложений')}
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </div>
    )
  }
}

export default Obyavlenia
