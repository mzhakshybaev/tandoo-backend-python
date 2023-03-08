import React, {Component} from 'react';
import moment from "moment";
import {runInAction} from "mobx";
import DateTimePicker from 'react-native-modal-datetime-picker';
import {inject, observer} from 'mobx-react';
import Picker from "./Picker";
import PropTypes from "prop-types";

@inject('mainStore') @observer
export default class DatePicker extends Component {

  static propTypes = {
    onPress: PropTypes.func,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    label: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {isVisible: false, dt: null}
  }

  componentWillMount() {
    let {model, name, value} = this.props;
    let dt = value;
    if (model && name) {
      dt = model[name];
      if (dt) {
        if (!moment.isMoment(dt))
          dt = moment(dt);
      }
    }
    this.setState({dt});
  }

  _hidePicker = () => {
    this.setState({isVisible: false});
  };

  _handleDatePicked = (date) => {
    let dt = moment(date);
    this.setState({dt: dt});
    this._hidePicker();

    let {model, name, onChange} = this.props;
    if (model && name) {
      runInAction(() => model[name] = dt);
    }
    if (onChange) {
      onChange(dt);
    }
  };

  render() {
    let {minimumDate, maximumDate, disabled, mainStore, value, model, name, placeholder, label} = this.props;

    if (minimumDate && moment.isMoment(minimumDate)) {
      minimumDate = minimumDate.toDate();
    }

    if (maximumDate && moment.isMoment(maximumDate)) {
      maximumDate = maximumDate.toDate();
    }

    let dt = value;
    if (model && name) {
      dt = model[name];
      if (dt) {
        if (!moment.isMoment(dt))
          dt = moment(dt);
      }
    }

    return (
      <React.Fragment>
        <Picker
          label={label}
          value={!!dt ? moment(dt).format('DD.MM.YYYY') : undefined}
          disabled={disabled || mainStore.isBusy}
          onPress={() => this.setState({isVisible: true})}
          placeholder={placeholder ? placeholder : 'дд.мм.гггг'}/>
        <DateTimePicker
          date={dt ? moment(dt).toDate() : new Date()}
          cancelTextIOS="Отмена"
          confirmTextIOS="ОК"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          isVisible={this.state.isVisible}
          onConfirm={this._handleDatePicked}
          onCancel={this._hidePicker}
        />
      </React.Fragment>
    );
  }
}
