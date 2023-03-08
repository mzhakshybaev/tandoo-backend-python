import Swal from "sweetalert2";
import React from 'react';
import {Button} from "reactstrap";
import {inject, observer} from 'mobx-react';
import MDSpinner from "react-md-spinner";
import {Link} from 'react-router-dom';
import cx from 'classnames';

@inject('mainStore') @observer
export default class AppButton extends React.Component {
  render() {
    let {mainStore, onClick, color, disabled, children, busy, className, to, ...rest} = this.props;

    color = color || 'primary';
    disabled = disabled || mainStore.isBusy;

    if (to) {
      className = cx('btn', className, 'btn-' + color, {disabled});

      return (
        <Link to={to}
              onClick={onClick}
              disabled={disabled}
              className={className}
              {...rest}>
          {busy && <MDSpinner size={16} singleColor='#fff' style={{marginRight: 10}}/>}
          {children}
        </Link>
      )
    }
    return (
      <Button onClick={onClick}
              color={color}
              disabled={disabled}
              className={className}
              {...rest}>
        {busy && <MDSpinner size={16} singleColor='#fff' style={{marginRight: 10}}/>}
        {children}
      </Button>
    )
  }
}

export class ConfirmButton extends React.Component {

  handleClick = () => {
    let {title, question, onConfirm, onCancel} = this.props;
    Swal({
      title: title,
      text: question,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Да',
      cancelButtonText: 'Отмена'
    }).then((result) => {
      if (result.value) {
        if (onConfirm)
          onConfirm();
      }
      else {
        if (onCancel)
          onCancel();
      }
    });
  };

  render() {
    let props = {...this.props};
    delete props.onConfirm;
    delete props.onCancel;
    return (
      <AppButton onClick={this.handleClick} {...props}>
        {this.props.children}
      </AppButton>
    )
  }
}


