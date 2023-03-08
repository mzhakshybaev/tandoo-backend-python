import React from "react";
import {Card, Col, ListGroup, ListGroupItem, Row, TabContent, TabPane} from "reactstrap";
import PropTypes from "prop-types";
import {translate} from "react-i18next";
import {inject, observer} from "mobx-react";

@translate(['common', 'settings', ''])
export default class TabView extends React.Component {

  static defaultProps = {
    activeTab: 0,
    tabs: [{index: 0, title: "Tab", component: "div"}]
  };

  static propTypes = {
    activeTab: PropTypes.number,
    tabs: PropTypes.arrayOf(PropTypes.shape({
      index: PropTypes.number,
      title: PropTypes.object,
      // should be react component
      component: PropTypes.function
    }))
  };

  constructor(props) {
    super(props);
    let {activeTab, tabs, lazyRender} = this.props;
    activeTab = activeTab || 0;

    if (tabs.some(t => !t.index))
      tabs = this.indexTabs();

    this.state = {activeTab, tabs, lazyRender};
  }

  indexTabs() {
    let newTabs = this.props.tabs.slice();
    newTabs.forEach((t, i) => t.index = i);
    return newTabs;
  }

  onTabClick = (tab) => {
    let newState = {activeTab: tab.index};
    this.setState(newState)
  };

  render() {
    let {t, tabs} = this.props;
    return (
      <Card body>
        <Row>
          <Col sm={12} md={3}>
            <ListGroup>
              {tabs.filter(i => i.title.key === 'default').map(tab =>
                <ListGroupItem key={tab.index} action
                               active={this.state.activeTab === tab.index}
                               onClick={() => this.onTabClick(tab)}>
                  {t("" + tab.title.name)}
                </ListGroupItem>)}
              {tabs.length > 4 && <h5 className="text-center">{t('Автоуведомления')}</h5>}
              {tabs.filter(i => i.title.key === 'autoNot').map(tab =>
                <ListGroupItem className="list-group-item d-flex justify-content-between align-items-center"
                    key={tab.index} action
                    active={this.state.activeTab === tab.index}
                    onClick={() => this.onTabClick(tab)}>
                  {t("" + tab.title.name)}
                  <span className={"fa fa-bell custom-notification-bell"} style={{fontSize:'20px'}}>
                    <span className="badge badge-danger badge-pill">{tab.title.count}</span>
                  </span>
                </ListGroupItem>)}
            </ListGroup>
          </Col>
          <Col sm={12} md={9}>
            <TabContent activeTab={this.state.activeTab}>
              {tabs.map(tab => {
                if (tab.index !== this.state.activeTab && this.state.lazyRender)
                  return null;

                let Component = tab.component;
                return (
                  <TabPane key={tab.index} tabId={tab.index}>
                    <Component/>
                  </TabPane>
                )
              })}
            </TabContent>
          </Col>
        </Row>
      </Card>
    );
  }
}
