import React, {Component} from 'react';
import {
  Card,
  CardBody,
  Col,
  ListGroup,
  ListGroupItem,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane
} from "reactstrap";
import classnames from 'classnames';


export default class advertisement extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: '1',
      orderClicked: false
    };
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }


  render() {


    return (<div>
      <Nav tabs>
        <NavItem>
          <NavLink
            className={classnames({active: this.state.activeTab === '1'})}
            onClick={() => {
              this.toggle('1');
            }}
          >
            Все обьявления
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({active: this.state.activeTab === '2'})}
            onClick={() => {
              this.toggle('2');
            }}
          >
            Запрос предложении
          </NavLink>
        </NavItem>

      </Nav>
      <TabContent activeTab={this.state.activeTab}>
        <TabPane tabId="1">
          <Card>
            <CardBody>
              <ListGroup>

                <ListGroupItem tag="a" action>
                  Заказы
                </ListGroupItem>
                <ListGroupItem tag="a" action> Конкурс</ListGroupItem>
                <ListGroupItem tag="a" action> Аукционы</ListGroupItem>
              </ListGroup>
            </CardBody>
          </Card>
        </TabPane>
        <TabPane tabId="2">
          <Row>
            <Col sm="12">
              <h4>Аналогичные товары по характеристики </h4>
            </Col>
          </Row>
        </TabPane>

      </TabContent>
    </div>);
  }

}
