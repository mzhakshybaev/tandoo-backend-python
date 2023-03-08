import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ActivityIndicator, View, StatusBar} from 'react-native';
import DropDownAlert from 'react-native-dropdownalert';
import hoistNonReactStatic from 'hoist-non-react-statics';
import {inject, observer} from 'mobx-react';
import vars from "../common/vars";

@inject('mainStore') @observer
export class SpinnerAlertProvider extends Component {
  static childContextTypes = {
    alertWithType: PropTypes.func,
    alert: PropTypes.func,
  };

  // componentWillReact() {
  //   let {level, message} = this.props.mainStore;
  //   if (message) {
  //     this.dropdown.alertWithType(level, '', message);
  //   }
  // }

  getChildContext() {
    return {
      alert: (...args) => this.dropdown.alert(...args),
      alertWithType: (...args) => this.dropdown.alertWithType(...args),
    }
  }

  render() {
    let {mainStore} = this.props;
    const {isBusy, message, level} = mainStore;
    if (message) {
      if (this.dropdown) {
        this.dropdown.alertWithType(level, '', message);
        // TODO: refactor
        mainStore.clearAlert();
      }
    }

    return (
      <View style={{flex: 1}}>
        {React.Children.only(this.props.children)}
        <DropDownAlert ref={e => this.dropdown = e} showCancel={true} closeInterval={5000}
                       onClose={() => {
                         mainStore.clearAlert();
                         StatusBar.setBackgroundColor(vars.primary);
                       }} onCancel={mainStore.clearAlert}
                       cancelBtnImageStyle={{height: 25, width: 25, alignSelf: 'center'}}
                       imageStyle={{height: 25, width: 25, alignSelf: 'center'}}
        />
        {false && isBusy && <View style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(52, 52, 52, 0.5)'
        }}><ActivityIndicator size="large" color={vars.primary}/></View>}
      </View>
    );
  }
}

const connectAlert = (WrapperComponent) => {
  class ConnectedAlert extends Component {
    render() {
      const {props, context} = this;
      return (
        <WrapperComponent {...props} alertWithType={context.alertWithType} alert={context.alert}/>
      )
    }
  }

  ConnectedAlert.contextTypes = {
    alertWithType: PropTypes.func,
    alert: PropTypes.func,
  };

  return hoistNonReactStatic(ConnectedAlert, WrapperComponent);
};

export default connectAlert;
