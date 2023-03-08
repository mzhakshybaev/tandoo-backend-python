import React, {Component} from 'react'
import {Card, CardBody, CardTitle, Col, FormGroup, Label, Row} from "reactstrap";
import Auc from "components/Hoc";
import {FGI, Required} from "components/AppInput";
import Select from "components/Select";
import TelInput from "components/TelInput";
import Input from "components/AppInput";
import {inject, observer} from "mobx-react";
import Button from "components/AppButton";
import {translate} from "react-i18next";
import {MaskedInput} from "components/MaskedInput";
import CoateSelect from "../../components/CoateSelect";

@translate(['common', 'settings', '']) @inject("dictStore", "supplierStore",) @observer
class PurchaserRegistration extends Component {

  state = {
    resident_state: null,
    ownership_type: null,
    name: '',
    inn: '',
    short_name: '',
    email: '',
    phone: null,
    street: '',
    house: '',
    apt: '',
    //DICTS
    ownerships: [], ownership: null,
    countries: [], country: null,
    banks: [], bank: null,
    coates: [], coate: null,
    //owner
    owner_fio: '',
    owner_inn: '',
    owner_email: '',
    owner_phone: '',
    owner_pos: '',
    //user
    user_email: '',
    user_phone: '',
    user_password: '',
    user_new_password: '',
    //bank
    okpo: '',
    bik: '',
    account_number: '',
  };

  componentDidMount() {
    this.props.dictStore.getDictData2({type: 'Typeofownership'}).then(r => {
      this.setState({ownerships: r});
    });
    this.props.dictStore.getCoateListing().then(r => {
      this.setState({coates: r});
    });
    this.props.dictStore.getDictData2({type: 'DirBank'}).then(r => {
      this.setState({banks: r});
    });
  }


  saveHandler = () => {
    const state = this.state;
    let params = {
      main_info: {
        name:  state.name,
        short_name: state.short_name,
        user_id: null,
        company_type: 'supplier',
        inn: state.inn,
        resident_state: null,
        typeofownership: null,
        typeofownership_id: state.ownership._id,
        // dircountry_id: state.country._id,
        dircoate_id: state.coate._id,
        main_doc_img: state.main_doc_image,
        owner_data: {
          fio: state.owner_fio,
          inn: state.owner_inn,
          pos: state.owner_pos,
          email: state.owner_email,
          phone: state.owner_phone,
        },
        data: {
          phone: state.phone,
          email: state.email,
          address: {
            street: state.street,
            house: state.house,
            apt: state.apt,
          }
        },
      },
      bank_info: {
        dirbank_id: state.bank._id,
        bank_name: null,
        account_number: state.account_number,
        bik: state.bik,
        okpo: state.okpo,
      },
      user: {

      }
    }
    this.props.supplierStore.saveCompanyInfo(params).then(r => {

    });
  }
  canSend = () => {

  }

  render() {
    const {t} = this.props;
    const state = this.state;
    return (
      <Auc>
        <Row>
          <Col xs={12} className="text-center mt-3">
            <h2>{t('Регистрация закупающей организации')}</h2>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Card className="animated fadeIn">
              <CardBody className="p-3">
                <Row>
                  <Col md={6} className="mt-3">
                    <CardTitle>{t('Основные данные')}</CardTitle>

                    <FGI l={t('Форма собственности')} lf={5} ls={7} className="mt-2">
                      <Select options={state.ownerships} placeholder={t('Выберите')}
                              valueKey="_id" labelKey="name" value={state.ownership}
                              onChange={ownership => this.setState({ownership})}/>
                    </FGI>
                    <FGI l={t('ИНН')} lf={5} ls={7} className="mt-2" required key={0}>
                      <MaskedInput mask="99999999999999" value={state.inn}
                                   callback={inn => this.setState({inn})}/>
                    </FGI>
                    <FGI l={t('Наименование организации')} lf={5} ls={7} className="mt-2" required key={1}>
                      <Input type="text" value={state.name}
                             placeholder={t('Введите наимен. организации')}
                             onChange={e => this.setState({name: e.target.value})}/>
                    </FGI>

                    <FGI l={t('Сокращенное наименование')} lf={5} ls={7} className="mt-2" required>
                      <Input type="text" value={state.short_name}
                             placeholder={t('Введите сокращенное наимен.')}
                             onChange={e => this.setState({short_name: e.target.value})}/>
                    </FGI>

                    <FGI l={t('Email')} lf={5} ls={7} className="mt-2" required>
                      <Input type="email" value={state.email}
                             placeholder={t('Email')}
                             onChange={e => this.setState({email: e.target.value})}/>
                    </FGI>

                    <FGI l={t('Контактный телефон')} lf={5} ls={7}>
                      <TelInput value={state.phone}
                                onChange={phone => this.setState({phone})}/>
                    </FGI>

                    <FGI l={t('Населенный пункт')} lf={5} ls={7} className="mt-2" required>
                      <CoateSelect  placeholder={t('Выберите')}
                              valueKey="_id" value={state.coate}
                              onChange={coate => this.setState({coate})}/>
                    </FGI>

                    <FormGroup row className="mt-2">
                      <Label sm={2}>
                        {t('Улица')}
                        <Required/>
                      </Label>
                      <Col sm={2}>
                        <Input type="text" value={state.street}
                               placeholder={t('Улица')}
                               onChange={e => this.setState({street: e.target.value})}/>
                      </Col>

                      <Label sm={2}>
                        {t('№ дома')}
                        <Required/>
                      </Label>
                      <Col sm={2}>
                        <Input type="text" value={state.house}
                               placeholder={t('№ дома')}
                               onChange={e => this.setState({house: e.target.value})}/>
                      </Col>

                      <Label sm={2}>
                        {t('Квартира')}
                      </Label>
                      <Col sm={2}>
                        <Input type="text" value={state.apt}
                               placeholder={t('№ кв')}
                               onChange={e => this.setState({apt: e.target.value})}/>
                      </Col>
                    </FormGroup>

                  </Col>
                  <Col md={6} className="mt-3">
                    <CardTitle>{t('Сведения о руководителе')}</CardTitle>
                    <FGI l={t('ИНН')} lf={5} ls={7} className="mt-2" required>
                      <MaskedInput mask="99999999999999" value={state.owner_inn}
                                   onChange={e => this.setState({owner_inn: e.target.value})}/>
                    </FGI>

                    <FGI l={t('ФИО')} lf={5} ls={7} className="mt-2" required>
                      <Input type="text" value={state.owner_fio}
                             placeholder={t('ФИО')}
                             onChange={e => this.setState({owner_fio: e.target.value})}/>
                    </FGI>

                    <FGI l={t('Должность')} lf={5} ls={7} className="mt-2" required>
                      <Input type="text" value={state.owner_pos}
                             placeholder={t('Должность')}
                             onChange={e => this.setState({owner_pos: e.target.value})}/>
                    </FGI>
                    <FGI l={t('Email')} lf={5} ls={7} className="mt-2" required>
                      <Input type="email" value={state.owner_email}
                             placeholder={t('Email')}
                             onChange={e => this.setState({owner_email: e.target.value})}/>
                    </FGI>
                    <FGI l={t('Номер моб. телефона')} lf={5} ls={7} className="mt-2" required>
                      <TelInput value={state.owner_phone}
                                onChange={owner_phone => this.setState({owner_phone})}/>
                    </FGI>
                  </Col>

                  <Col md={6} className="mt-3">
                    <CardTitle>{t('Банковские реквизиты')}</CardTitle>
                    <FGI l="Банк" lf={5} ls={7} className="mt-2" required>
                      <Select options={state.banks} placeholder={t('Выберите')}
                              labelKey="name" valueKey="_id" value={state.bank}
                              onChange={bank => this.setState({bank})}/>
                    </FGI>
                    <FGI l={t('Номер расчетного счета')} lf={5} ls={7} className="mt-2" required>
                      <MaskedInput mask="9999999999999999" value={state.account_number}
                                   onChange={e => this.setState({account_number: e.target.value})}/>
                    </FGI>

                    <FGI l={t('БИК')} lf={5} ls={7} className="mt-2" required>
                      <MaskedInput mask="99999999" value={state.bik}
                                   onChange={e => this.setState({bik: e.target.value})}/>
                    </FGI>

                    <FGI l={t('Код ОКПО')} lf={5} ls={7} className="mt-2" required>
                      <MaskedInput mask="99999999" value={state.okpo}
                                   onChange={e => this.setState({okpo: e.target.value})}/>
                    </FGI>
                  </Col>
                  <Col md={6} className="mt-3">
                    <CardTitle>{t('Данные владельца')}</CardTitle>
                    <FGI l={t('Email')} lf={5} ls={7} className="mt-2" required>
                      <Input type="email" value={state.user_email}
                             placeholder={t('Email')}
                             onChange={e => this.setState({user_email: e.target.value})}/>
                    </FGI>
                    <FGI l={t('Номер моб. телефона')} lf={5} ls={7} className="mt-2" required>
                      <TelInput value={state.user_phone}
                                onChange={user_phone => this.setState({user_phone})}/>
                    </FGI>
                    <FGI l={t('Пароль')} lf={5} ls={7} className="mt-2" required>
                      <Input value={state.user_password} type="password" placeholder={t('Введите свой пароль')}
                             onChange={e => this.setState({user_password: e.target.value})}/>
                    </FGI>
                    <FGI l={t('Потвердите пароль')} lf={5} ls={7} className="mt-2" required>
                      <Input value={state.user_new_password}
                             type="password"
                             placeholder={t('Введите еще раз пароль')}
                             onChange={e => this.setState({user_new_password: e.target.value})}/>
                    </FGI>
                  </Col>
                  <Col xs={12} md={6} className="offset-md-6">
                    <FGI l="" lf={5} ls={7} className="mt-2">
                      <Button title={t('Добавить')} type="primary" className="px-4 py-2"
                              onClick={this.saveHandler}>
                        {t('Добавить')}
                      </Button>
                    </FGI>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Auc>
    )
  }
}

export default PurchaserRegistration
