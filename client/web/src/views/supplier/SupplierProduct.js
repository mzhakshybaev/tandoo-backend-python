import React, {Component} from "react"
import {Col,Nav, NavItem, NavLink, Row, TabContent, TabPane} from 'reactstrap';
import classnames from 'classnames';
import MyProducts from './MyProducts';
import {translate} from "react-i18next";

@translate(['common', 'settings', ''])
export default class SupplierProduct extends Component {

  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: '1'
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
              {t('Товары')}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({active: this.state.activeTab === '2'})}
              onClick={() => {
                this.toggle('2');
              }}
            >
              {t('Работы')}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({active: this.state.activeTab === '3'})}
              onClick={() => {
                this.toggle('3');
              }}
            >
              {t('Услуги')}
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId="1">
            <MyProducts/>
          </TabPane>
          <TabPane tabId="2">
            <Row>
              <Col sm="12">
                <h4>{t('Таблица работ и фильтр')}</h4>
              </Col>
            </Row>
          </TabPane>
          <TabPane tabId="3">
            <Row>
              <Col sm="12">
                <h4>{t('Таблица услуг и фильтр')}</h4>
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </div>
    )
  }
}
