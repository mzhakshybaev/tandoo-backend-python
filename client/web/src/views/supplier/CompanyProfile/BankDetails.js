import React, {Component} from 'react'
import {FGI} from "components/AppInput";
import Select from "components/Select";
import {inject, observer} from 'mobx-react'
import Hoc from 'components/Hoc'
import Button from "components/AppButton";
import Input from "components/AppInput";
import {translate} from "react-i18next";
import {MaskedInput} from "components/MaskedInput";

@translate(['common', 'settings', ''])
@inject('dictStore', "adminStore", "supplierStore", "authStore", "mainStore") @observer
class BankDetails extends Component {
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

  componentDidMount() {
    this.props.dictStore.getDictData2({type: 'DirBank'}).then(r => {
      this.setState({banks: r});
    });
    let {company} = this.props;
    this.getCompanyData(company);
    if (company && company.companybank) {
      let param = {company_id: company._id,with_releated: true}
      this.props.supplierStore.getCompanyBank(param).then(bank => {
        this.setState({
          company,
          _id:bank._id,
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
    if(company.companybank && company.companybank.length){
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
    const { t } = this.props;
    const {mainStore} = this.props;
    const {language} = mainStore;
    let label = 'name';
    if (language && language.code !== 'ru') {
      label = [label,language.code].join('_')
    }
    let bankName = (
      <FGI l={t('Банк')} lf={4} ls={6} className="mt-md-4 offset-md-1" required>
        <Select options={this.state.banks} valueKey='_id'
                labelKey={label} value={this.state.selBank} placeholder={t('Выберите')}
                onChange={(value) => this.setState({selBank: value})}/>
      </FGI>
    );
    if (this.state.resident_state === 'noresident') {
      bankName = (
        <FGI l={t('Банк')} lf={4} ls={6} className="mt-md-4 offset-md-1" required>
          <Input type="text" value={this.state.bank_name}
                 onChange={e => this.setState({bank_name: e.target.value})}/>
        </FGI>
      )
    }
    return (
      <Hoc>
        <h2 className="text-center">{t('Банковские реквизиты')}</h2>
        {bankName}
        <FGI l={t('Номер расчетного счета')} lf={4} ls={6} className="mt-2 offset-md-1" required>
          <MaskedInput mask={"9999999999999999"} value={this.state.account_number}
                       onChange={(elem) => this.setState({account_number: elem.target.value})}/>
        </FGI>

        <FGI l={t('БИК')} lf={4} ls={6} className="mt-2 offset-md-1" required>
          <MaskedInput mask={"99999999"} value={this.state.bik}
                       onChange={(elem) => this.setState({bik: elem.target.value})}/>
        </FGI>

        <FGI l={t('Код ОКПО')} lf={4} ls={6} className="mt-2 offset-md-1" required>
          <MaskedInput mask={"99999999"} value={this.state.okpo}
                       onChange={(elem) => this.setState({okpo: elem.target.value})}/>
        </FGI>
        <FGI l={""} lf={4} ls={6} className="mt-2 offset-md-1">
          <Button className="primary" title={t('Сохранить')}
                  onClick={this.saveHandler}
                  disabled={!(this.state.selBank && this.state.account_number && this.state.bik && this.state.okpo)}>
            {t('Сохранить изменения')}
          </Button>
        </FGI>
      </Hoc>
    )
  }

}

export default BankDetails
