import React, {Component} from 'react'
import {View} from 'react-native';
import {inject, observer} from 'mobx-react';
import {Text} from "react-native-elements";
import Toolbar, {ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import TabView from "../../components/TabView";
import ScreenWrapper, {ScrollContainer} from "../../components/ScreenWrapper";
import Card from "../../components/Card";
import Button, {ActionButton} from "../../components/Button";
import Image from "../../components/AppImage";
import DatePicker from "../../components/DatePicker";
import {IMAGES_URL} from "../../../utils/common";
import ItemView from "../../components/ItemView";
import {formatDate} from "../../../utils/helpers";
import moment from "moment";
import vars from "../../common/vars";
import {PopupList} from "../../components/PopupList";
import {clone} from "lodash-es";
import {showError, showSuccess} from "../../../utils/messages";
import Input from "../../components/Input";
import Spinner, {NoDataView} from "../../components/Spinner";
import ExpandablePanel from "../../components/ExpandablePanel";
import Confirm from "../../components/Confirm";

@inject('adminStore', 'authStore', 'supplierStore')
export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {company: null, loading: false};
  }

  componentDidMount() {
    this.setState({loading: true});
    this.props.supplierStore.getCompanies({
      current: true,
      with_related: true
    })
      .then(companies => {
        this.setState({company: companies[0]});
        if (!this.props.authStore.isSupplier) {
          this.setState({activeTab: '1'})
        }
      })
      .finally(() => this.setState({loading: false}))
  }

  render() {
    const Header = (
      <Toolbar hasTabs>
        <ToolbarButton back/>
        <ToolbarTitle>Профиль</ToolbarTitle>
      </Toolbar>
    );

    let {company} = this.state;
    let {isSupplier} = this.props.authStore;

    const tab = !!company &&
      <TabView>
        {isSupplier && <DebtInfo tabLabel='Задолженности' company={company}/>}
        <GeneralInfo tabLabel='Основные данные' company={company}/>
        <BankDetails tabLabel='Банковские реквизиты' company={company}/>
        {isSupplier && <Prequalification tabLabel='Предквалификация' company={company}/>}
        {isSupplier && <Text tabLabel='Реклама'>Реклама</Text>}
        <Employees tabLabel='Сотрудники' company={company}/>
        <MyDocuments tabLabel='Мои документы' company={company}/>
        <Text tabLabel='Архив'>Архив</Text>
      </TabView>;

    return <ScreenWrapper header={Header} tab={tab} loading={this.state.loading}/>
  }
}

@inject('supplierStore', 'mainStore', 'dictStore') @observer
class DebtInfo extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      img: null,
      imgPreview: null,
      textDebtNumber: null,
      taxDebtDate: null,
      data: [],
      references: null,
      reference: null,
      show: false
    };
  }

  componentDidMount() {
    this.props.dictStore.getDictData2({type: 'DirDocument'}).then(r => {
      this.setState({references: r});
    });

    this.getMyDebts();
  }

  async getMyDebts() {
    let data = await this.props.supplierStore.getMyDebt();
    this.setState({data});
  }

  findRef = (refId) => {
    const ref = this.state.references && this.state.references.find(r => r._id === refId);
    return ref || {};
  };

  render() {
    const {mainStore} = this.props;

    if (mainStore.isBusy) return <Spinner/>;

    let lang = mainStore.language.code;
    let name_key = (lang === 'ru') ? 'name' : ('name_' + lang);
    const {data, references, reference} = this.state;

    return (
      <ScrollContainer>
        <Card>
          <PopupList items={references}
                     value={reference}
                     disabled={!references || references.length === 0}
                     placeholder="Выберите тип справки"
                     valueCode={'_id'}
                     valueName={name_key}
                     onChange={reference => this.setState({reference})}/>
          {false && <Button title={'Прикрепить справку'}
                            color={vars.secondary}
                            onPress={() => console.log('')}/>}
          <DatePicker value={this.state.taxDebtDate} onChange={(value) => this.setState({taxDebtDate: value})}/>
          <Button title={'Сохранить'} onPress={() => console.log('')}/>
        </Card>
        {!!data && data.map((d, i) => {
            let date_end = moment(d.date_end, 'YYYY-MM-DD').endOf('day');
            const status = date_end.isBefore(moment()) ? 'Истек' : 'Валидный';
            return (
              <Card key={i} title={d.dirdocument_id && this.findRef(d.dirdocument_id)[name_key]}>
                <View style={{flexDirection: 'row'}}>
                  <Image source={{uri: IMAGES_URL + d.file}} style={{width: 90, height: 70}}/>
                  <View style={{flex: 1, marginLeft: 5}}>
                    <ItemView label={'Дата выдачи'} value={formatDate(d.date_start)}/>
                    <ItemView label={'Дата окончания'} value={formatDate(d.date_end)}/>
                    <ItemView label={'Статус'} value={status}/>
                  </View>
                </View>
              </Card>
            )
          }
        )}

      </ScrollContainer>
    )
  }
}

@inject('dictStore', "adminStore", "supplierStore", "authStore", "mainStore") @observer
class GeneralInfo extends React.Component {
  state = {
    /* Dicts */
    ownerships: [],
    ea_types: [], ea_type: null,
    coates: [],
    countries: [], country: '',
    /* MAIN State */
    resident_state: 'noresident',
    ownership_type: 'ip',
    ownership: null,
    inn: '',
    name: '', // name - org
    ip_fio: '', // name - ip
    short_name: '',
    main_doc_img: [], //main_doc_preview: [],main_doc_img_old: [],
    main_logo_img: null, main_logo_preview: null,
    phone: '',
    email: '',
    coate: null,
    street: '',
    house: '',
    apt: '',
    // owner
    owner_fio: '',
    owner_inn: '',
    owner_pos: '',
    owner_email: '',
    owner_phone: '',
    //
    company: null
  };

  componentDidMount() {
    this.props.dictStore.getDictData2({type: 'Typeofownership'}).then(r => {
      this.setState({ownerships: r});
    });
    this.props.dictStore.getCoateListing().then(r => {
      this.setState({coates: r});
    });
    this.props.dictStore.getDictData2({type: 'DirCountry'}).then(r => {
      this.setState({countries: r});
    });
    this.props.dictStore.getDictData2({type: 'DirTypesofeconomicactivity'}).then(r => {
      this.setState({ea_types: r});
    });

    let company = this.props.company;
    this.setState({
      company,
      ownership: company.typeofownership,
      ownership_type: company.typeofownership.data.type,
      resident_state: company.typeofownership.type_owner,
      inn: company.inn,
      name: company.name,
      ip_fio: company.name,
      short_name: company.short_name,
      main_doc_img: company.main_doc_img,
      country: company.dircountry_id,
      owner_fio: company.owner_data && company.owner_data.fio || '',
      owner_inn: company.owner_data && company.owner_data.inn || '',
      owner_pos: company.owner_data && company.owner_data.pos || '',
      owner_email: company.owner_data && company.owner_data.email || '',
      owner_phone: company.owner_data && company.owner_data.phone || '',
      phone: company.data && company.data.phone,
      email: company.data && company.data.email || '',
      coate: company.dircoate_id,
      street: company.data && company.data.address && company.data.address.street || '',
      house: company.data && company.data.address && company.data.address.house || '',
      apt: company.data && company.data.address && company.data.address.apt || '',
      _id: company._id && company._id && company._id || '',
      _rev: company._rev && company._rev && company._rev || '',
      roles_id: company.roles_id && company.roles_id && company.roles_id || [],
      dircoate_id: company.dircoate_id && company.dircoate_id && company.dircoate_id || [],
    })
  }

  handleFiles(imgName, previewName, file) {
    let model = {};
    model[previewName] = file.base64;
    this.setState(model);
    this.props.supplierStore.uploadImage(file.base64.split(',')[1]).then(r => {
      let model = {};
      model[imgName] = r.file;
      this.setState(model)
    })
  }

  handleMultipleFiles = (imgName, preview, files) => {
    let images = clone(this.state[imgName]);
    let previews = clone(this.state[preview]);

    files.base64.forEach((base64, i) => {
      let img = {
        file: base64.split(',')[1],
        ext: files.fileList[i]['name'].split('.')[1],
      };

      images.push(img);
      previews.push(base64);
    });

    this.setState({
      [preview]: previews,
      [imgName]: images
    });
  };

  get isIP() {
    let {resident_state: rs, ownership_type: ot} = this.state;
    return ot && (rs === 'resident') && (ot === 'ip');
  }

  get isOrg() {
    let {resident_state: rs, ownership_type: ot} = this.state;
    return ot && (rs === 'resident') && (ot === 'org');
  }

  get isResident() {
    let {resident_state: rs} = this.state;
    return rs && (rs === 'resident');
  }

  get isNoResident() {
    let {resident_state: rs} = this.state;
    return rs && (rs === 'noresident');
  }

  saveHandler = async () => {
    const ifRes = (yes, no) => this.isResident ? yes : no;
    const ifIP = (yes, no) => this.isIP ? yes : no;
    const state = this.state;
    // let main_doc_img_result = clone(state.main_doc_img_old);
    // let images = [
    //   state.main_doc_img
    // ];
    // let images_upl = await Promise.all(images.map(img => {
    //   return this.props.supplierStore.uploadImages(img)
    // }));
    // images_upl.map(img => img.files.map( item => main_doc_img_result.push(item)));
    const company = state.company;
    const bank = company.companybank[0];
    const qual = company.companuqualifications[0];
    let params = {
      main_info: {
        _rev: state._rev,
        _id: state._id,
        name: ifIP(state.ip_fio, state.name),
        short_name: state.short_name,
        company_type: 'supplier',
        inn: state.inn,
        resident_state: state.resident_state,
        typeofownership: state.ownership_type,
        typeofownership_id: state.ownership && state.ownership._id,
        dircountry_id: ifRes(undefined, state.country && state.country._id),
        dircoate_id: state.coate && state.coate._id,
        main_doc_img: state.main_doc_img,
        owner_data: ifIP({
          fio: state.owner_fio,
          inn: state.owner_inn,
          pos: state.owner_pos,
          email: state.owner_email,
          phone: state.owner_phone,
        }),
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
        dirbank_id: bank.dirbank_id,
        bank_name: bank.bank_name,
        account_number: bank.account_number,
        bik: bank.bik,
        okpo: bank.okpo,
      },
      prequal_info: {
        dirtypesofeconomicactivity_id: qual.dirtypesofeconomicactivity_id,
        fin_report_img: qual.fin_report_img,
        supplies: qual.data.supplies,
        experiences: qual.data.experiences,
      },
    };

    try {
      await this.props.supplierStore.saveCompanyInfo(params);
      showSuccess('Успешно сохранено!')

    } catch (e) {
      showError(e.message || "Ошибка")
    }
  };

  canSendForm = () => {
    const {
      street, house, ownership, name, inn,
      country, coate, main_doc_image,
    } = this.state;
    let res = (street && house && ownership && name && inn && coate &&
      country && main_doc_image);
    return res;
  };

  render() {
    const {mainStore} = this.props;
    if (mainStore.isBusy) return <Spinner/>;

    if (!this.state.company) return null;

    const {language} = mainStore;
    let label = 'name';
    if (language && language.code !== 'ru') {
      label = [label, language.code].join('_')
    }
    let {state, isIP, isOrg, isResident, isNoResident} = this;


    return (
      <ScrollContainer>
        <Card title={'Основные данные'}>

          {isResident &&
          <PopupList label={'Форма собственности'}
                     items={state.ownerships}
                     value={state.ownership}
                     placeholder="Форма собственности"
                     valueCode={'_id'}
                     valueName={label}
                     onChange={ownership => this.setState({ownership})}/>
          }

          {isNoResident &&
          <PopupList label={'Страна'}
                     items={state.countries}
                     value={state.country}
                     placeholder="Страна"
                     valueCode={'_id'}
                     valueName={'name'}
                     onChange={country => this.setState({country})}/>
          }

          {(isIP || isNoResident) &&
          <Input label={'ФИО'} value={state.ip_fio} onChange={ip_fio => this.setState({ip_fio})}/>
          }

          {(isOrg || isNoResident) && [
            <Input label={'ИНН организации'} value={state.inn} onChange={inn => this.setState({inn})}/>,
            <Input label={'Наименование организации'} value={state.name} onChange={name => this.setState({name})}/>,
          ]}

          {isNoResident &&
          <PopupList label={'Вид экономической деятельности'}
                     items={state.ea_types}
                     value={state.ea_type}
                     valueCode={'_id'}
                     valueName={'name'}
                     onChange={ea_type => this.setState({ea_type})}/>
          }

          <Input label={'Сокращенное наименование'} value={state.short_name}
                 onChange={short_name => this.setState({short_name})}/>
          {false && <Button title={'Документ'} onPress={() => console.log('')} color={vars.secondary}/>}
          {false && isOrg && <Button title={'Устав'} onPress={() => console.log('')} color={vars.secondary}/>}
          <Input label={'Email'} keyboardType='email-address' value={state.email}
                 onChange={email => this.setState({email})}/>

          <Input label={'Контактный телефон'} keyboardType='phone-pad' value={state.phone}
                 onChange={phone => this.setState({phone})}/>

          <PopupList label={'Населенный пункт'}
                     items={state.coates}
                     value={state.coate}
                     valueCode={'_id'}
                     valueName={'name'}
                     onChange={coate => this.setState({coate})}/>

          <Input label={'Улица'} value={state.street} onChange={street => this.setState({street})}/>
          <View style={{flexDirection: 'row'}}>
            <Input containerStyle={{flex: 0.5}} label={'№ дома'} value={state.house}
                   onChange={house => this.setState({house})}/>
            <Input containerStyle={{flex: 0.5, marginLeft: 10}} label={'Квартира'} value={state.apt}
                   onChange={apt => this.setState({apt})}/>
          </View>
        </Card>

        {(isOrg || isNoResident) &&
        <Card title={'Сведения о руководителе'}>
          <Input label={'ИНН'} value={state.owner_inn} onChange={owner_inn => this.setState({owner_inn})}/>
          <Input label={'ФИО'} value={state.owner_fio} onChange={owner_fio => this.setState({owner_fio})}/>
          <Input label={'Должность'} value={state.owner_pos} onChange={owner_pos => this.setState({owner_pos})}/>
          <Input label={'Email'} keyboardType='email-address' value={state.owner_email}
                 onChange={owner_email => this.setState({owner_email})}/>
          <Input label={'Номер моб. телефона'} keyboardType='phone-pad' value={state.owner_phone}
                 onChange={owner_phone => this.setState({owner_phone})}/>
        </Card>
        }
        <Button title={'сохранить'} onPress={this.saveHandler}/>
      </ScrollContainer>
    )
  }
}

@inject('dictStore', "adminStore", "supplierStore", "authStore", "mainStore") @observer
class BankDetails extends React.Component {
  state = {
    resident_state: '',
    ownership_type: '',
    banks: [], selBank: null,
    bank_name: '',//for not Resident
    account_number: null,
    bik: null,
    okpo: null,
    isSent: false,
    _id: null,
    company: null,
  };

  componentWillMount() {
    this.props.dictStore.getDictData2({type: 'DirBank'}).then(r => {
      this.setState({banks: r});
    });
    let {company} = this.props;
    this.getCompanyData(company);
    if (company && company.companybank) {
      let param = {company_id: company._id, with_releated: true}
      this.props.supplierStore.getCompanyBank(param).then(bank => {
        this.setState({
          company,
          _id: bank._id,
          resident_state: company.typeofownership.type_owner,
          ownership_type: company.typeofownership.data.type,
          account_number: bank.account_number,
          bik: bank.bik,
          okpo: bank.okpo
        });
      })
    }
  }

  getCompanyData(company) {
    let store = this.props.adminStore;
    if (company.companybank && company.companybank.length) {
      store.getData({type: "DirBank", id: company.companybank[0].dirbank_id}).then(r =>
        this.setState({selBank: r}));
    }

  }

  get isIP() {
    let {resident_state: rs, ownership_type: ot} = this.state;
    return ot && (rs === 'resident') && (ot === 'ip');
  }

  get isResident() {
    let {resident_state: rs} = this.state;
    return rs && (rs === 'resident');
  }

  saveHandler = () => {
    const ifRes = (yes, no) => this.isResident ? yes : no;
    const ifIP = (yes, no) => this.isIP ? yes : no;
    const state = this.state;
    let params = {
      dirbank_id: state.selBank._id,
      company_id: state.company._id,
      bank_name: ifRes(undefined, state.bank_name),
      account_number: state.account_number,
      bik: state.bik,
      okpo: state.okpo,
      _id: state._id,
    };
    this.props.supplierStore.saveCompanyBank(params).then(r => {
    });
  };


  render() {
    const {mainStore} = this.props;
    if (mainStore.isBusy) return <Spinner/>;
    const {language} = mainStore;
    let label = 'name';
    if (language && language.code !== 'ru') {
      label = [label, language.code].join('_')
    }
    let bankName = (
      <PopupList label={'Банк'}
                 items={this.state.banks}
                 value={this.state.selBank}
                 placeholder="Банк"
                 valueCode={'_id'}
                 valueName={label}
                 onChange={selBank => this.setState({selBank})}/>
    );
    if (this.state.resident_state === 'noresident') {
      bankName = (
        <Input label={'Банк'} value={this.state.bank_name} onChange={bank_name => this.setState({bank_name})}/>
      )
    }
    return (
      <ScrollContainer>
        <Card>
          {bankName}
          <Input label={'Номер расчетного счета'} value={this.state.account_number}
                 onChange={account_number => this.setState({account_number})}/>
          <Input keyboardType='numeric' label={'БИК'} value={this.state.bik} onChange={bik => this.setState({bik})}/>
          <Input keyboardType='numeric' label={'Код ОКПО'} value={this.state.okpo}
                 onChange={okpo => this.setState({okpo})}/>
        </Card>
        <Button title={'Сохранить'}
                onPress={this.saveHandler}
                disabled={!(this.state.selBank && this.state.account_number && this.state.bik && this.state.okpo)}>
        </Button>
      </ScrollContainer>
    )
  }

}

@inject('adminStore', 'dictStore', "supplierStore", "mainStore") @observer
class Prequalification extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resident_state: '',
      ownership_type: '',
      finReportPreview: null,
      fin_report_image: null,
      reportPreview: null,
      report: null,
      supplies: [],
      experiences: [],
      ea_types: [], ea_type: null,
      _id: null,
      // supplies
      goods_type: '',
      date_contract: '',
      buyer_info: '',
      cost: '',
      // experience
      office: '',
      fio: '',
      gen_expr: '',
      sup_expr: '',
      collapseExpr: false,
      collapseSupplies: false,
      company: null,
    };
  }

  componentDidMount() {
    this.props.dictStore.getDictData2({type: 'DirTypesofeconomicactivity'}).then(r => {
      this.setState({ea_types: r});
    });
    let {company} = this.props;
    this.getCompanyData(company);
    if (company) {
      let param = {company_id: company._id, with_releated: true};
      this.props.supplierStore.getCompanyQual(param).then(qual => {
        this.setState({
          company,
          resident_state: company.typeofownership.type_owner,
          ownership_type: company.typeofownership.data.type,
          finReportPreview: IMAGES_URL + qual.fin_report_img,
          supplies: qual.data && qual.data.supplies || [],
          experiences: qual.data && qual.data.experiences || [],
          _id: qual._id,
          _rev: qual._rev,
        })
      })
    }
  }

  getCompanyData(company) {
    let store = this.props.adminStore;
    store.getData({
      type: "DirTypesofeconomicactivity",
      id: company.companuqualifications[0].dirtypesofeconomicactivity_id
    }).then(r => {
      this.setState({ea_type: r});
    });
  }

  handleFiles(imgName, previewName, file) {
    let model = {};
    model[previewName] = file.base64;
    this.setState(model);
    this.props.supplierStore.uploadImage(file.base64.split(',')[1]).then(r => {
      let model = {};
      model[imgName] = r.file;
      this.setState(model)
    })
  }

  addSupplyData = () => {
    let supplyData = {
      goods_type: this.state.goods_type,
      date_contract: this.state.date_contract,
      buyer_info: this.state.buyer_info,
      cost: this.state.cost
    };
    this.setState({supplies: [...this.state.supplies, supplyData]});
    this.setState({goods_type: '', date_contract: '', buyer_info: '', cost: '', report: null, reportPreview: null});
  };
  addExprData = () => {
    let exprData = {
      office: this.state.office,
      fio: this.state.fio,
      gen_expr: this.state.gen_expr,
      sup_expr: this.state.sup_expr
    };
    this.setState({experiences: [...this.state.experiences, exprData]});
    this.setState({office: '', fio: '', gen_expr: '', sup_expr: ''});
  };

  get isResident() {
    let {resident_state: rs} = this.state;
    return rs && (rs === 'resident');
  }

  get isIP() {
    let {resident_state: rs, ownership_type: ot} = this.state;
    return ot && (rs === 'resident') && (ot === 'ip');
  }

  get isOrg() {
    let {resident_state: rs, ownership_type: ot} = this.state;
    return ot && (rs === 'resident') && (ot === 'org');
  }

  saveHandler = async () => {
    const ifRes = (yes, no) => this.isResident ? yes : no;
    const ifIP = (yes, no) => this.isIP ? yes : no;
    const state = this.state;
    let params = {
      company_id: state.company._id,
      _id: state._id,
      _rev: state._rev,
      dirtypesofeconomicactivity_id: state.ea_type._id,
      fin_report_img: state.fin_report_image,
      data: {
        supplies: ifRes(state.supplies, []),
        experiences: ifIP([], state.experiences),
      }
    };

    try {
      await this.props.supplierStore.saveCompanyQual(params);
      showSuccess('Успешно сохранено!');
    } catch (e) {
      console.error(e);
      showError(e.message)
    }
  };

  render() {
    const {mainStore} = this.props;
    const {language} = mainStore;
    const {experiences, supplies, collapseSupplies, collapseExpr} = this.state;
    let label = 'name';
    if (language && language.code !== 'ru') {
      label = [label, language.code].join('_')
    }
    return (
      <ScrollContainer>
        <Card title={'Предквалификационная форма поставщика'}>
          <PopupList label={'Вид экономической деятельности'} items={this.state.ea_types} placeholder={'Выберите'}
                     valueCode={label} value={this.state.ea_type}
                     onChange={value => this.setState({ea_type: value})}
          />
        </Card>
        <Card title={'Сведения о выполненных поставках товаров'}>
          <ExpandablePanel onPress={() => this.setState({collapseSupplies: !collapseSupplies})}
                           expanded={collapseSupplies}
                           title={'Добавить'}>
            <Input label={'Наименование договора'} value={this.state.goods_type}
                   onChange={(goods_type) => this.setState({goods_type})}/>
            <Input label={'Дата выполнения договора'} value={this.state.date_contract}
                   onChange={(date_contract) => this.setState({date_contract})}/>
            <Input label={'Покупатель (наименование,адрес,контактные телефоны)'} value={this.state.buyer_info}
                   onChange={(buyer_info) => this.setState({buyer_info})}/>
            <Input label={'Стоимость договора, тыс. сом'} value={this.state.cost}
                   onChange={(cost) => this.setState({cost})}/>
            <Button onPress={() => this.addSupplyData()} title={'Добавить'}/>
          </ExpandablePanel>

          {supplies && supplies.map((s, i) => <Card key={i} title={s.goods_type}>
            <ItemView label={'Дата выполнения договора'} value={s.date_contract}/>
            <ItemView label={'Покупатель (наименование,адрес,контактные телефоны)'} value={s.buyer_info}/>
            <ItemView label={'Стоимость договора, тыс. сом'} value={s.cost}/>
          </Card>)}
        </Card>

        {!!this.isOrg &&
        <Card title={'Квалификация и опыт работников ключевых должностей Поставщика'}>
          <ExpandablePanel onPress={() => this.setState({collapseExpr: !collapseExpr})}
                           expanded={collapseExpr}
                           title={'Добавить'}>
            <Input label={'Должность'} type={"text"} value={this.state.office}
                   onChange={(office) => this.setState({office})}/>
            <Input label={'ФИО'} value={this.state.fio}
                   onChange={(fio) => this.setState({fio})}/>
            <Input label={'Общий опыт работы(лет)'} value={this.state.gen_expr}
                   onChange={(gen_expr) => this.setState({gen_expr})}/>
            <Input label={'Опыт работы в качестве Поставщика (лет)'} value={this.state.sup_expr}
                   onChange={(sup_expr) => this.setState({sup_expr})}/>
            <Button onPress={() => this.addExprData()} title={'Добавить'}/>
          </ExpandablePanel>

          {!!experiences && experiences.map((ex, i) =>
            <Card key={i}>
              <ItemView label={"Должность"} value={ex.office}/>
              <ItemView label={"ФИО"} value={ex.fio}/>
              <ItemView label={"Общий опыт работы(лет)"} value={ex.gen_expr}/>
              <ItemView label={"Опыт работы в качестве Поставщика (лет)"} value={ex.sup_expr}/>
            </Card>
          )}
        </Card>}

        <Button title={'Сохранить изменения'} onPress={this.saveHandler}
                disabled={!(this.state.finReportPreview && this.state.ea_type)}/>

      </ScrollContainer>
    )
  }
}

@inject("supplierStore", "authStore")
class Employees extends Component {
  constructor(props) {
    super(props);

    this.state = {employee: {}, employees: [], btnTitle: 'Добавить', users: []};
    this.dateFormat = "DD.MM.YYYY";
  }

  componentDidMount() {
    this.props.supplierStore.getPositions()
      .then(positions => {
        this.setState({positions});
        this.getEmployees();
      });
    this.props.supplierStore.getRoles({})
      .then(roles => {
        this.setState({roles});
      });

    this.props.supplierStore.getUsers().then(users => this.setState({users}));
    this.getEmployees();
  }

  resetEmployee = () => {
    this.setState({employee: {}, btnTitle: 'Добавить'})
  };

  getEmployees() {
    let filter = {
      /*filter: {
        company_id: this.props.authStore.company._id
      },*/
      with_related: true
    };

    this.props.supplierStore.getEmployees(filter)
      .then(employees => {
        this.setState({employees: employees});
      })
  }

  saveEmployee = () => {
    let e = this.state.employee;
    let employee = this.state.isEditing ? {_id: e._id} : {};
    employee.company_id = this.props.authStore.company._id;
    employee.user_id = e.userId;
    employee.roles_id = e.roleId;

    if (e.endDate)
      employee.data = {end_date: e.endDate.format(this.dateFormat)};

    this.props.supplierStore.saveEmployee(employee)
      .then(r => {
        showSuccess("Успешно сохранили сотрудника");
        this.resetEmployee();
        this.getEmployees();
      })
      .catch(e => showError(e.message || "Произошла ошибка при сохранении"));
  };

  canSave() {
    let e = this.state.employee;
    return e.userId && e.roleId;
  }

  canCancel() {
    let e = this.state.employee;
    return e.userId || e.roleId;
  }

  onEditClick(employee) {
    employee.userId = employee.user_id;
    employee.roleId = employee.roles_id;
    if (employee.data != null && 'end_date' in employee.data)
      employee.endDate = moment(employee.data.end_date, this.dateFormat);

    this.setState({employee, isEditing: true, btnTitle: 'Сохранить'});
  }

  async onDeleteClick(employee) {
    Confirm('', 'Вы действительно хотите удалить сотрудника?', () => {
      this.props.supplierStore.removeEmployee(employee).then(r => {
        showSuccess("Успешно удалено");
        this.resetEmployee();
        this.getEmployees();
      });
    });
  };

  render() {
    let e = this.state.employee;

    return (
      <ScrollContainer>
        <Card>
          <PopupList
            label={'Сотрудник'}
            items={this.state.users || []}
            value={e.userId}
            valueCode={"id"}
            valueName={"info"}
            simpleValue
            placeholder={'Поиск сотрудника'}
            onChange={userId => {
              e.userId = userId;
              this.setState({employee: e})
            }}
          />
          <PopupList
            label={'Роль сотрудника'}
            value={e.roleId}
            valueCode={"_id"}
            valueName={"name"}
            simpleValue
            placeholder={'Должность'}
            items={this.state.roles}
            onChange={roleId => {
              e.roleId = roleId;
              this.setState({employee: e})
            }}/>
          <DatePicker label={'Дата окончания'} value={e.endDate}
                      dateFormat={this.dateFormat}
                      onChange={value => {
                        e.endDate = value;
                        this.setState({employee: e})
                      }}/>
          {this.canCancel() && <Button color={vars.secondary} onPress={this.resetEmployee} title={'Отменить'}/>}
          <Button disabled={!this.canSave()} onPress={this.saveEmployee} title={this.state.btnTitle}/>
        </Card>
        {!!this.state.employees && this.state.employees.map((e, i) => <Card key={i}>
          <ItemView label={'ИНН'} value={e.user.inn}/>
          <ItemView label={'ФИО'} value={e.user.fullname}/>
          <ItemView label={'Роль'} value={e.roles.name}/>
          <ItemView label={'Дата окончания'} value={e.data && e.data.end_date}/>
          <ItemView label={'Дата окончания'} value={
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <ActionButton name={'edit'} onPress={() => this.onEditClick(e)}/>
              <ActionButton name={'trash'} onPress={() => this.onDeleteClick(e)} color={vars.red}/>
            </View>
          }/>
        </Card>)}
      </ScrollContainer>
    )
  }
}

@inject('supplierStore', 'authStore') @observer
class MyDocuments extends Component {
  state = {
    img: null,
    file_name: null,
    imgPreview: null
  };

  componentDidMount() {
    this.getDocument()

  }

  getDocument = async () => {
    let r = await this.props.supplierStore.getDocs();
    this.setState({r});
    console.log("THE DATA IS " + r)
  };

  remove = async (id) => {
    try {
      await this.props.supplierStore.removeDocs(id);
      this.getDocument();
      showSuccess('Удален')
    } catch (e) {
      showError(e.message || 'Ошибка')

    }

  };


  handleFiles = (file) => {
    this.setState({
      img: file.base64.split(',')[1],
      imgPreview: file.base64,
    });
  };
  submit = async () => {

    try {
      let {file} = await this.props.supplierStore.uploadImage(this.state.img);

      let document = {
        company_id: this.props.company._id,
        file,
        file_name: this.state.file_name
      };

      await this.props.supplierStore.saveDocs(document);

      showSuccess("Успешно сохранен");

      this.setState({
        img: null,
        imgPreview: null,
        file: null,
        file_name: null
      });

      this.getDocument();

    } catch (e) {
      showError(e && e.message || 'Ошибка');
      console.warn(e);
    }
  };

  render() {
    if (!this.state.r || this.state.r.length === 0) return <NoDataView/>;
    return (
      <ScrollContainer>
        {this.state.r.map((m, i) => <Card key={i} title={'Изображение'}>
          <Image style={{width: '100%', height: 200}} source={{uri: IMAGES_URL + m.file}}/>
          <Button title={'Удалить'} color={vars.red} onPress={() => {
            Confirm('', 'Удалить', () => {
              this.remove(m);
            })
          }}/>
        </Card>)}
      </ScrollContainer>
    )
  }
}







