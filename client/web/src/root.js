import React, {Component} from 'react';
import {HashRouter as Router} from 'react-router-dom';
import {Container} from 'reactstrap';
import NotificationSystem from 'react-notification-system';
import {inject, observer} from 'mobx-react';
import {Header, Footer, Loading} from 'components';
import Routes from './routes';

import {compose, lifecycle, setDisplayName, branch, renderComponent} from 'recompact';


const withAuthCheck = lifecycle({
  async componentDidMount() {
    await this.props.authStore.check();
  }
});

const isLoading = props => {
  // DO NOT REMOVE!
  let level = props.mainStore.level;

  return !props.authStore.isReady
};

const withLoading = branch(isLoading, renderComponent(Loading));

const enhance = compose(
  setDisplayName('Root'),
  inject('mainStore', 'authStore', 'menuStore'),
  observer,
  withAuthCheck,
  withLoading,
);


@enhance
export default class Root extends Component {
  render() {
    const {mainStore} = this.props;
    const {level, message} = mainStore;

    return (
      <Router>
        <div className="app">
          <NotificationSystem
            ref="notificationSystem"
            autoDismiss={5}
            onRemove={() => mainStore.clearAlert()}/>
          <Header {...this.props}/>

          <div className="app-body">
            {message && this.renderAlert(level, message)}

            <Container fluid>
              <Routes/>
            </Container>
          </div>
          <Footer/>
        </div>
      </Router>
    );
  }

  renderAlert = (level, message) => {
    if (this.refs.notificationSystem) {
      this.refs.notificationSystem.clearNotifications();
      this.refs.notificationSystem.addNotification({message, level});
      this.props.mainStore.clearAlert();
    }
  }
}
