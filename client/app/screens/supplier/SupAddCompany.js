import {inject, observer} from "mobx-react";
import React from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import Toolbar, {Title, ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import * as request from "../../../utils/requester";
import Card from "../../components/Card";
import Button from "../../components/Button";
import {Text} from "react-native";
import Input, {InputMask} from "../../components/Input";
import {RadioBox} from "../../components/CheckBox";
import {translate} from "react-i18next";
import {PopupList} from "../../components/PopupList";
import vars from "../../common/vars";
import CoateSelect from "../../components/CoateSelect";
import ExpandablePanel from "../../components/ExpandablePanel";
import ItemView from "../../components/ItemView";

@inject("supplierStore", "dictStore", "authStore") @observer
@translate(['common', 'settings', ''])
export default class SupAddCompany extends React.Component {
  constructor(props) {
    super(props);

    let {user} = props.authStore;

    this.state = {
      isSent: false,
      // dicts
      ownerships: [],
      countries: [],
      coates: [],
      banks: [],
      images: [],
      ea_types: [],
      // form data
      resident_state: '', // resident, noresident
      ownership_type: '', // ip, org
      // main
      ownership: null,
      inn: '', // org
      name: '',
      ip_inn: user.inn || '', // ip
      ip_fio: user.fullname,
      short_name: '',
      main_doc_img: [],
      main_doc_regulations: [],
      phone: user.phone,
      email: user.email,
      coate: null,
      street: '',
      house: '',
      apt: '',
      // owner
      owner_fio: user.fullname,
      owner_inn: user.inn,
      owner_pos: '',
      owner_email: user.email,
      owner_phone: user.phone,
      // bank
      bank: null,
      bank_name: '', // for noresident
      account_number: null,
      bik: null,
      okpo: null,
      //
      ea_type: null,
      fin_report_img: [],

      country: null,
      //
      supplies: [],
      experiences: [],
      // supplies
      sup_goods_type: '',
      sup_date_contract: '',
      sup_buyer_info: '',
      sup_cost: '',
      sup_report: [],
      // experience
      exp_pos: '',
      exp_fio: '',
      exp_gen_expr: '',
      exp_sup_expr: '',
      //
      collapseExpr: false,
      collapseSupplies: false,
    };
  }

  componentWillMount() {
    this.load();
  }

  componentDidMount() {
    this.loadCompany();
  }

  async load() {
    let {getDictData2, getCoateListing} = this.props.dictStore;

    let [ownerships, countries, coates, banks, ea_types] = await Promise.all([
      getDictData2({type: 'Typeofownership'}),
      getDictData2({type: 'DirCountry'}),
      getCoateListing(),
      getDictData2({type: 'DirBank'}),
      getDictData2({type: 'DirTypesofeconomicactivity'}),
    ]);
    this.setState({ownerships, countries, coates, banks, ea_types});
  }

  async loadCompany() {
    let companyId = this.props.navigation.getParam('id');

    if (companyId) {
      let params = {
        id: companyId
      };

      let comp = await request.postAsync('company/get_company', 'doc', params);
      console.log('comp', comp);

      this.setState({
        id: companyId,
        ownership: comp.ownership,
        ownership_type: comp.typeofownership,
        resident_state: comp.resident_state,
        inn: comp.inn,
        ip_inn: comp.inn,
        name: comp.name,
        ip_name: comp.name,
        short_name: comp.short_name,
        coate: comp.dircoate_id,
        phone: comp.data.phone,
        email: comp.data.email,
        street: comp.data && comp.data.address && comp.data.address.street || '',
        house: comp.data && comp.data.address && comp.data.address.house || '',
        apt: comp.data && comp.data.address && comp.data.address.apt || '',
        main_doc_img: comp.main_doc_img,
        main_doc_regulations: comp.main_doc_regulations,
        // owner data
        owner_fio: comp.owner_data && comp.owner_data.fio || '',
        owner_inn: comp.owner_data && comp.owner_data.inn || '',
        owner_pos: comp.owner_data && comp.owner_data.pos || '',
        owner_email: comp.owner_data && comp.owner_data.email || '',
        owner_phone: comp.owner_data && comp.owner_data.phone || '',
        // bank data
        company_bank_id: comp.company_bank._id,
        account_number: comp.company_bank.account_number,
        bik: comp.company_bank.bik,
        okpo: comp.company_bank.okpo,
        bank: comp.bank,
        // qualification
        prequal_id: comp.prequal && comp.prequal._id || '',
        supplies: comp.prequal && comp.prequal.data.supplies || [],
        experiences: comp.prequal && comp.prequal.data.experiences || [],
        fin_report_img: comp.prequal && comp.prequal.fin_report_img,
      });
    }
  }

  addSupplyData = () => {
    let supplyData = {
      goods_type: this.state.sup_goods_type,
      date_contract: this.state.sup_date_contract,
      buyer_info: this.state.sup_buyer_info,
      cost: this.state.sup_cost,
      report: this.state.sup_report,
    };
    this.setState({supplies: [...this.state.supplies, supplyData]});
    this.setState({
      sup_goods_type: '',
      sup_date_contract: '',
      sup_buyer_info: '',
      sup_cost: '',
      sup_report: null,
    });
  };

  addExprData = () => {
    let exprData = {
      pos: this.state.exp_pos,
      fio: this.state.exp_fio,
      gen_expr: this.state.exp_gen_expr,
      sup_expr: this.state.exp_sup_expr
    };
    this.setState({experiences: [...this.state.experiences, exprData]});
    this.setState({exp_pos: '', exp_fio: '', exp_gen_expr: '', exp_sup_expr: ''});
  };

  get isResident() {
    let {resident_state: rs} = this.state;
    return rs && (rs === 'resident');
  }

  get isNoResident() {
    let {resident_state: rs} = this.state;
    return rs && (rs === 'noresident');
  }

  get isIP() {
    let {resident_state: rs, ownership_type: ot} = this.state;
    return ot && (rs === 'resident') && (ot === 'ip');
  }

  get isOrg() {
    let {resident_state: rs, ownership_type: ot} = this.state;
    return ot && (rs === 'resident') && (ot === 'org');
  }

  setResidentState(resident_state) {
    this.setState({
      resident_state,
      ownership_type: '',
      ownership: null,
    });
    // this.setState({ownership: null});
    // this.props.dictStore.getDictData2({type: 'Typeofownership', filter: {'type_owner': value}}).then(r => {
    //   this.setState({ownerships: r});
    // });
  }

  setOwnershipType(ownership_type) {
    this.setState({
      ownership_type,
      ownership: null,
    })
  }

  getOwnerships() {
    let {resident_state, ownership_type} = this.state;
    return this.state.ownerships.filter(({data: {type}, type_owner}) => {
      return (type_owner === resident_state && type === ownership_type);
    })
  }

  async save() {
    const getVal = fn => fn instanceof Function ? fn.call(this) : fn;
    const ifRes = (yes, no) => getVal(this.isResident ? yes : no);
    const ifIP = (yes, no) => getVal(this.isIP ? yes : no);
    const state = this.state;

    let user = this.props.authStore.user;
    /*let images = [
      state.main_doc_img,
      state.main_doc_regulations,
      state.fin_report_img
    ];
    let images_upl = await Promise.all(images.map(img => {
      return this.props.supplierStore.uploadImages(img)
    }));

    let [
      main_doc_img_upl,
      main_doc_regulations_upl,
      fin_report_img_upl
    ] = images_upl.map(img => img.files);*/


    let params = {

      main_info: {
        // class Companies(Base, CouchSync):
        //     company_status = Enum('waiting', 'confirmed', 'rejected', 'blacklist', name="company_status"),
        //                      nullable=False, default='waiting'
        //     role = Integer
        //     roles_id = Json, nullable=False, default=[]
        //
        // name = String, nullable=False
        name: ifIP(state.ip_fio, state.name),
        // short_name = String
        short_name: state.short_name,
        // user_id = Integer, ForeignKey(User.id, onupdate='cascade', ondelete='no action'), nullable=False
        user_id: user.id,
        // company_type = String
        company_type: 'supplier',
        // inn = String
        inn: ifIP(state.ip_inn, state.inn),
        // resident_state: Enum('resident', 'noresident')
        resident_state: state.resident_state,
        // typeofownership: Enum('ip', 'org')
        typeofownership: state.ownership_type,
        // typeofownership_id = String
        typeofownership_id: state.ownership && state.ownership._id,
        // dircountry_id = String
        dircountry_id: ifRes(undefined, state.country && state.country._id),
        // dircoate_id = String

        // main_doc_img = String
        main_doc_img: state.main_doc_img,
        main_doc_regulations: state.main_doc_regulations,
        // owner_data: Json
        owner_data: ifIP(undefined, {
          fio: state.owner_fio,
          inn: state.owner_inn,
          pos: state.owner_pos,
          email: state.owner_email,
          phone: state.owner_phone,
        }),
        // data = Json
        data: {
          phone: state.phone,
          email: state.email,
          address: {
            street: state.street,
            house: state.house,
            apt: state.apt,
          }
        },
        dircoate_id: state.coate
      }
      ,
      bank_info: {
        // class Companybank(Base, CompanySync):
        // dirbank_id = String, nullable=False
        dirbank_id: ifRes(state.bank && state.bank._id),
        // bank_name = String
        bank_name: ifRes(undefined, state.bank_name),
        // account_number = String, nullable=False
        account_number: state.account_number,
        // bik = String, nullable=False
        bik: state.bik,
        // okpo = String, nullable=False
        okpo: state.okpo,
        // data = Json
      },
      prequal_info: ifRes(() => ({
        // class Companyqualification(Base, CompanySync):
        // dirtypesofeconomicactivity_id = Column(String) // Type Of Economical Activity Id
        dirtypesofeconomicactivity_id: state.ea_type && state.ea_type._id,
        //     volume = String
        // volume: this.state.volume,
        //     fin_report_img = String
        fin_report_img: state.fin_report_img,
        //     tax_debt_img = String
        // tax_debt_img: this.state.taxDebtImage,
        //     soc_debt_img = String
        // soc_debt_img: this.state.socDebtImage,
        //     data = Json
        data: {
          supplies: ifRes(state.supplies, []),
          experiences: ifIP([], state.experiences),
        }
      })),

    };

    if (this.state.id) {
      params['main_info']['_id'] = this.state.id || '';
      params['bank_info']['_id'] = this.state.company_bank_id || '';

      if (this.state.prequal_id)
        params['prequal_info']['_id'] = this.state.prequal_id;
    }
    // params
    // debugger
    // return

    let r = await this.props.supplierStore.saveCompanyInfo(params);
    // let r = await this.props.supplierStore.saveCompanyDraft(params);
    // console.log('r', r)
    this.setState({isSent: true});

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

  setFiles(prop, files) {
    // 'main_doc_img'
    // console.log(prop, files);

    this.setState({[prop]: files});
  }

  renderMsgSaved() {
    const {t, authStore, navigation} = this.props;
    const {user} = authStore;
    return (
      <Card>
        <Text>{`Уважаемый ${user && user.fullname || 'пользователь'}`}</Text>
        <Text>'Ваши заполненные данные по Предквалификации отправлены</Text>
        <Text>С уважением, Администрация Каталога.</Text>
        <Button onPress={() => navigation.popToTop()} title={'На главную'}/>
      </Card>
    );
  }

  render() {

    const {t} = this.props;
    let colLength = 6;
    let colLength2 = 12;
    let {state, isResident, isNoResident, isIP, isOrg} = this;
    console.log({state, isResident, isNoResident, isIP, isOrg});
    if (state.isSent) {
      return this.renderMsgSaved();
    }

    const Header = (
      <Toolbar hasTabs>
        <ToolbarButton back/>
        <ToolbarTitle>Моя организация</ToolbarTitle>
      </Toolbar>
    );

    return (<ScreenWrapper header={Header}>
      <Card>
        <RadioBox label={t("Резиденты КР")}
                  checked={this.state.resident_state === "resident"}
                  onChange={() => this.setResidentState('resident')}/>
        <RadioBox label={"Не резиденты КР"}
                  checked={this.state.resident_state === "noresident"}
                  onChange={() => this.setResidentState('noresident')}/>
      </Card>

      {!!isNoResident && this.notResidentContent()}

      {!!isResident &&
      <>
        <Card>
          <RadioBox label={t("Индивидуальный предприниматель")}
                    checked={this.state.ownership_type === "ip"}
                    onChange={() => this.setOwnershipType('ip')}/>
          <RadioBox label={t("Организация")}
                    checked={this.state.ownership_type === "org"}
                    onChange={() => this.setOwnershipType('org')}/>
        </Card>

        {(!!isIP || !!isOrg) &&
        <>
          <Card title={t('Основные данные')}>
            <PopupList label={t("Форма собственности")} required
                       items={this.getOwnerships()} placeholder={t("Выберите")}
                       valueCode="_id" valueName="name" value={state.ownership}
                       onChange={ownership => this.setState({ownership})}/>

            {!!isIP &&
            <>
              <InputMask keyboardType='numeric' mask='99999999999999' label={t("ИНН")} value={state.ip_inn} required
                         onChange={ip_inn => this.setState({ip_inn})}/>
              <Input label={t("ФИО")} value={state.ip_fio} required
                     onChange={ip_fio => this.setState({ip_fio})}/>
            </>
            }

            {!!isOrg &&
            <>
              <InputMask keyboardType='numeric' label={t("ИНН организации")} mask="99999999999999" value={state.inn}
                         required
                         callback={inn => this.setState({inn})}/>
              <Input label={t("Наименование организации")} value={state.name} required
                     onChange={name => this.setState({name})}/>
            </>
            }

            <Input label={t("Сокращенное наименование")} type="text" value={state.short_name} required
                   onChange={short_name => this.setState({short_name})}/>

            <Input label={t("Email")} keyboardType="email-address" value={state.email} required
                   onChange={email => this.setState({email})}/>

            <Input label={t("Контактный телефон")} value={state.phone}
                   keyboardType='phone-pad'
                   onChange={phone => this.setState({phone})}/>

            <CoateSelect label={'Населенный пункт'} value={state.coate} onSelect={coate => this.setState({coate})}
                         required/>

            <Input label={t('Улица')} value={state.street}
                   onChange={street => this.setState({street})}/>
            <Input label={t('№ дома')} value={state.house}
                   onChange={house => this.setState({house})}/>
            <Input label={t('Квартира')} value={state.apt}
                   onChange={apt => this.setState({apt})}/>
          </Card>


          {!!isOrg &&
          <Card title={t('Сведения о руководителе')}>
            <InputMask keyboardType='numeric' label={t("ИНН")} mask="99999999999999" value={state.owner_inn} required
                       onChange={owner_inn => this.setState({owner_inn})}/>
            <Input label={t("ФИО")} value={state.owner_fio} required
                   onChange={owner_fio => this.setState({owner_fio})}/>
            <Input label={t("Должность")} value={state.owner_pos} required
                   onChange={owner_pos => this.setState({owner_pos})}/>
            <Input label={t("Email")} keyboardType="email-address" value={state.owner_email}
                   onChange={owner_email => this.setState({owner_email})}/>
            <Input label={t("Номер моб. телефона")} value={state.owner_phone} required
                   onChange={owner_phone => this.setState({owner_phone})}/>
          </Card>
          }

          <Card title={t('Банковские реквизиты')}>

            <PopupList label={t("Банк")} items={state.banks} placeholder={t("Выберите")}
                       valueName="name" valueCode="_id" value={state.bank}
                       onChange={bank => this.setState({bank})}/>
            <InputMask keyboardType='numeric' label={t("Номер расчетного счета")} mask="9999999999999999"
                       value={state.account_number}
                       onChange={account_number => this.setState({account_number})}/>
            <InputMask keyboardType='numeric' label={t("БИК")} mask="99999999" value={state.bik}
                       onChange={bik => this.setState({bik})}/>
            <InputMask keyboardType='numeric' label={"Код ОКПО"} mask="99999999" value={state.okpo}
                       onChange={okpo => this.setState({okpo})}/>
          </Card>

          <Card title={t('Предквалификационная форма поставщика')}>

            <ExpandablePanel onPress={() => this.setState({collapseSupplies: !state.collapseSupplies})}
                             title={'Добавить'} expanded={state.collapseSupplies}>
              {this.renderSupplies()}
            </ExpandablePanel>

            {!!this.state.supplies && this.state.supplies.map((s, i) => <Card key={i} title={s.goods_type}>
              <ItemView label={'Дата выполнения договора'} value={s.date_contract}/>
              <ItemView label={'Покупатель (наименование,адрес,контактные телефоны)'} value={s.buyer_info}/>
              <ItemView label={'Стоимость договора, сом'} value={s.cost}/>
            </Card>)}
          </Card>


          {!!isOrg &&
          <Card title={'Квалификация и опыт работников ключевых должностей Поставщика'}>
            <ExpandablePanel title={'Добавить'} expanded={state.collapseExpr}
                             onPress={() => this.setState({collapseExpr: !state.collapseExpr})}>
              {this.renderExperiences()}
            </ExpandablePanel>

            {!!this.state.experiences && this.state.experiences.map((e, i) => <Card key={i}>
              <ItemView label={'Должность'} value={e.pos}/>
              <ItemView label={'ФИО'} value={e.fio}/>
              <ItemView label={'Общий опыт работы(лет)'} value={e.gen_expr}/>
              <ItemView label={'Опыт работы в качестве Поставщика (лет)'} value={e.sup_expr}/>
            </Card>)}
          </Card>
          }

          <Button onPress={() => this.save()} disabled={!this.canSendForm()}
                  title={t('Отправить')}/>

          {this.canSendForm() ?
            <Text style={{color: vars.muted}}>{t('на подтверждение')}</Text>
            :
            <Text style={{color: vars.red}}>{t('Вы не заполнили все поля!!!!')}</Text>}
        </>
        }
      </>
      }
    </ScreenWrapper>)
  }

  notResidentContent() {
    const {t} = this.props;
    let state = this.state;
    let colLength = 6;

    return (
      <>
        <Card title={t('Основные данные')}>
          <PopupList label={t("Страна")} items={this.state.countries} placeholder={t("Выберите")}
                     valueCode="_id" valueName="name" value={state.country}
                     onChange={country => this.setState({country})}/>

          <Input label={t("ИНН организации")} mask="99999999999999" value={state.inn}
                 onChange={inn => this.setState({inn})}/>
          <Input label={t("Наименование организации")} value={state.name}
                 onChange={name => this.setState({name})}/>
          <Input label={t("Сокращенное наименование")} value={state.short_name}
                 onChange={short_name => this.setState({short_name})}/>

          <Input keyboardType="email-address" value={state.email} label={t("Email")}
                 onChange={email => this.setState({email})}/>
          <Input label={t("Контактный телефон")} value={state.phone}
                 onChange={phone => this.setState({phone})}/>

          <CoateSelect label={'Населенный пункт'} value={state.coate} onSelect={coate => this.setState({coate})}/>

          <Input label={t('Улица')} value={state.street}
                 onChange={street => this.setState({street})}/>
          <Input label={t('№ дома')} value={state.house}
                 onChange={house => this.setState({house})}/>

          <Input label={t('Квартира')} value={state.apt}
                 onChange={apt => this.setState({apt})}/>
        </Card>

        <Card title={t('Сведения о руководителе')}>
          <Input label={t("ИНН")} mask="99999999999999" value={state.owner_inn}
                 onChange={owner_inn => this.setState({owner_inn})}/>
          <Input label={t("ФИО")} value={state.owner_fio}
                 onChange={owner_fio => this.setState({owner_fio})}/>
          <Input label={t("Должность")} value={state.owner_pos}
                 onChange={owner_pos => this.setState({owner_pos})}/>
          <Input label={t("Email")} keyboardType="email-address" value={state.owner_email}
                 onChange={owner_email => this.setState({owner_email})}/>
          <Input label={t("Номер моб. телефона")} value={state.owner_phone}
                 onChange={owner_phone => this.setState({owner_phone})}/>
          <PopupList items={state.ea_types} placeholder={t("Выберите")}
                     label={t("Вид экономической деятельности")}
                     labelKey="name" valueKey="_id" value={state.ea_type}
                     onChange={ea_type => this.setState({ea_type})}
          />
        </Card>

        <Card title={t('Банковские реквизиты')}>
          <Input label={t("Банк")} value={state.bank_name}
                 onChange={bank_name => this.setState({bank_name})}/>
          <Input label={t("Номер расчетного счета")} mask="9999999999999999" value={state.account_number}
                 onChange={account_number => this.setState({account_number})}/>
          <Input label={t("БИК")} mask="99999999" value={state.bik}
                 onChange={bik => this.setState({bik})}/>
          <Input label={t("Код ОКПО")} mask="99999999" value={state.okpo}
                 onChange={okpo => this.setState({okpo})}/>
        </Card>
        <Button onPress={() => this.save()} disabled={!this.canSendForm()} title={t('Отправить')}/>
        <Text style={{color: vars.muted}}>{t('на подтверждение')}</Text>
      </>
    )
  }

  renderSupplies = () => {
    const {t} = this.props;
    let state = this.state;
    return (
      <>
        <Input label={t("Наименование договора")} value={state.sup_goods_type}
               onChange={sup_goods_type => this.setState({sup_goods_type})}/>
        <Input label={t("Дата выполнения договора")} value={state.sup_date_contract}
               onChange={sup_date_contract => this.setState({sup_date_contract})}/>
        <Input label={t("Покупатель (наименование, адрес, контактные телефоны)")} value={state.sup_buyer_info}
               onChange={sup_buyer_info => this.setState({sup_buyer_info})}/>
        <Input label={t("Стоимость договора, тыс. сом")} value={state.sup_cost}
               onChange={sup_cost => this.setState({sup_cost})}/>
        <Button onPress={() => this.addSupplyData()} title={'Добавить'}/>
      </>
    )
  };

  renderExperiences = () => {
    const {t} = this.props;
    let state = this.state;
    return (
      <Card>
        <Input label={t("Должность")} value={state.exp_pos}
               onChange={exp_pos => this.setState({exp_pos})}/>
        <Input label={t("ФИО")} value={state.exp_fio}
               onChange={exp_fio => this.setState({exp_fio})}/>
        <Input label={t("Общий опыт работы(лет)")} value={state.exp_gen_expr}
               onChange={exp_gen_expr => this.setState({exp_gen_expr})}/>
        <Input label={t("Опыт работы в качестве Поставщика (лет)")} value={state.exp_sup_expr}
               onChange={exp_sup_expr => this.setState({exp_sup_expr})}/>

        <Button onPress={() => this.addExprData()} title={'Добавить'}/>
      </Card>
    )
  };

  canSendForm = () => {
    // return true;
    const {
      street, house, ownership, name, bank, inn, bik,
      okpo, coate, owner_inn, owner_fio, owner_pos, owner_email, owner_phone,
      account_number, ip_inn, ip_fio, short_name, email
    } = this.state;
    const {isResident, isIP, isOrg} = this;

    // console.log({isResident, isIP});

    if (isResident && isIP) {
      let res = (ownership && ip_inn && ip_fio && short_name &&
        email && coate && street && house && bank && account_number && bik && okpo);

      // console.log(res, {
      //   ownership, ip_inn, ip_fio, short_name,
      //   email, coate, street, house, bank, account_number, bik, okpo
      // });

      return res;
    } else if (isResident && isOrg) {
      let res = (ownership && inn && name && short_name && owner_inn &&
        owner_fio && owner_pos && owner_email && owner_phone &&
        email && coate && street && house && bank && account_number && bik && okpo);

      // console.log(res, {
      //     ownership, inn, name, short_name, owner_inn,
      //     owner_fio, owner_pos, owner_email, owner_phone,
      //     email, coate, street, house, bank, account_number, bik, okpo
      // });

      return res;
    }
  };

}


