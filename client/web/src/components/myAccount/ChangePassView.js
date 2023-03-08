import React, {Component} from 'react'
import {inject, observer} from "mobx-react";
import {Button, Col, Form, FormGroup, FormText, Label, Row} from "reactstrap";
import Input, {FGI} from "components/AppInput";
import TelInput from "components/TelInput";
import {DEFAULT_AVA, IMAGES_URL} from 'utils/common'
import ReactFileReader from "react-file-reader";
import AppButton from "components/AppButton";
import {showError, showSuccess} from "utils/messages";
import {translate} from "react-i18next";
import {FormInput} from "../AppInput";
import Swal from "sweetalert2";

@translate(['common', 'settings', '']) @inject('authStore', "mainStore") @observer
class ChangePassView extends Component {
  constructor(...args) {
    super(...args);

    let {user} = this.props.authStore;

    this.state = {
      fullname: user.fullname,
      inn: user.inn,
      email: user.email,
      phone: user.phone,
      avatarPreview: user.data && user.data.avatar_img ? (IMAGES_URL + user.data.avatar_img) : DEFAULT_AVA,
      avatarFile: null,
    };
  }

  componentWillUnmount() {
    this.props.form.unmount()
  }

  togglePassword = e => {
    this.setState({showPasswordChange: e.target.checked})
  };

  save = async e => {
    e.preventDefault();
    let res = await Swal({
      title: 'Вы действительно хотите поменять аватар?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Да',
      cancelButtonText: 'Отмена'
    });

    if (!res.value) {
      return
    }
    let {user} = this.props.authStore;
    let avatar_img = user.data.avatar_img;

    if (this.state.avatarFile) {
      try {
        console.log(this.state.avatarFile);
        let avatarFile = this.state.avatarFile.base64.split(',')[1];
        let r = await this.props.authStore.uploadAvatar(avatarFile);
        avatar_img = r.file;
        let r1 = await this.props.authStore.saveData({avatar_img: r.file});
      } catch (e) {
        showError(e.message || 'Не удалось загрузить аватар');
        return;
      }
    }
    await this.props.authStore.check(true);

    user = this.props.authStore.user;

    this.setState({
      avatarPreview: IMAGES_URL + user.data.avatar_img,
      avatarFile: null,
    });

    showSuccess('Успешно сохранено!')

  };

  render() {
    const {t, form} = this.props;
    let $password = form.$('password'),
      $current_password = form.$('current_password'),
      $password_confirmation = form.$('password_confirmation');
    let {state} = this;

    return (
      <div className="container justify-content-center">
        <div className="d-flex justify-content-center pb-sm-3 pt-sm-2">
          <h3>{t('Мой аккаунт')}</h3>
        </div>

        <Row>
          <Col md={8} className="order-1 order-md-0">
            <Form onSubmit={form.onSubmit}>

              <Row className="mb-2">
                <Col md="7">
                  <FGI l={t('ФИО')} lf="5" ls="7">
                    <Input type="text" disabled
                           value={state.fullname}
                           onChange={e => this.setState({fullname: e.target.value})}/>
                  </FGI>
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md="7">
                  <FGI l={t('Email')} lf="5" ls="7">
                    <Input type="email" value={state.email} disabled
                           onChange={e => this.setState({email: e.target.value})}/>
                  </FGI>
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md="7">
                  <FGI l={t('Моб. телефон')} lf="5" ls="7">
                    <TelInput value={state.phone} disabled
                              onChange={phone => this.setState({phone})}/>
                  </FGI>
                </Col>
              </Row>

              <Row className={"mb-2"}>
                <Col md={3}/>
                <Col md="4">
                  <FormGroup check>
                    <Label check>
                      <Input type="checkbox" value={state.showPasswordChange} onChange={this.togglePassword}/>
                      &nbsp;{t('изменить пароль')}
                    </Label>
                  </FormGroup>
                </Col>
              </Row>

              {state.showPasswordChange && (
                <>
                  <Row className="mb-2">
                    <Col md="7">
                      <FormInput label={t('Текущий пароль')} fb={$current_password.error}>
                        <Input {...$current_password.bind()} className={$current_password.error ? 'is-invalid' : ''}
                               autoFocus/>
                      </FormInput>
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col md="7">
                      <FormInput label={t('Новый пароль')} fb={$password.error}>
                        <Input {...$password.bind()} className={$password.error ? 'is-invalid' : ''}/>
                        <FormText color="muted">{t('Не менее 6 символов (букв, цифр)')}</FormText>
                      </FormInput>
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col md="7">
                      <FormInput label={t('Повторите новый пароль')} fb={$password_confirmation.error}>
                        <Input {...$password_confirmation.bind()}
                               className={$password_confirmation.error ? 'is-invalid' : ''}/>
                      </FormInput>
                    </Col>
                  </Row>

                  <AppButton color="primary" disabled={!form.canSubmit()}>
                    {t('Сохранить изменения')}
                  </AppButton>
                </>
              )}
            </Form>
          </Col>

          <Col md={4} sm={12} className="d-flex flex-column align-items-center order-0 order-md-1 ">
            <div>
              <img className="Ellipse_1" src={state.avatarPreview} alt="avatar"/>
            </div>
            <div>
              <div className="d-flex">
                <ReactFileReader
                  fileTypes={[".jpg", ".png", '.jpeg', '.gif']}
                  base64={true}
                  handleFiles={avatarFile => this.setState({avatarPreview: avatarFile.base64, avatarFile})}>

                  <div>
                    <Button color="primary">{t('Прикрепить фото')}</Button>{' '}
                  </div>
                </ReactFileReader>
                {state.avatarFile &&
                <div className={'ml-1'}>
                  <Button color="success" onClick={this.save}>{t('Сохранить')}</Button>{' '}
                </div>
                }
              </div>
            </div>
          </Col>
        </Row>
      </div>

    )
  }
}

export default ChangePassView
