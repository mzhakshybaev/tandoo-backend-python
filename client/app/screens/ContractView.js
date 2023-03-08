import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import Card from "../components/Card";
import ScreenWrapper from "../components/ScreenWrapper";
import Toolbar, {Title, ToolbarButton, ToolbarTitle} from "../components/Toolbar";
import ItemView from "../components/ItemView";
import {showError, showSuccess} from "../../utils/messages";
import {formatDate, formatDateTime, formatMoney, getPayTypeTr, getStatusTr} from "../../utils/helpers";
import {Text} from "react-native";
import vars from "../common/vars";
import Spinner, {NoDataView} from "../components/Spinner";
import {observable} from "mobx";
import Button, {ConfirmButton} from "../components/Button";
import Input from "../components/Input";

@inject('contractViewCtrl') @observer
export default class ContractView extends Component {

  id;

  componentDidMount() {
    this.id = this.props.navigation.getParam('id');
    // this.props.contractViewCtrl = this.props.contractViewCtrl;
    this.load(this.id);
  }

  load(id) {
    this.props.contractViewCtrl.load(id);
  }

  componentWillUnmount() {
    this.props.contractViewCtrl.reset();
  }

  sendOTP = async () => {
    try {
      await this.props.contractViewCtrl.sendSignOTP();

    } catch (e) {
      console.warn(e);
      showError(e && e.message || 'Ошибка. Попробуйте позже.');
    }
  };

  setOTP = value => {
    this.props.contractViewCtrl.setOTP(value)
  };

  sup_submit = async () => {
    try {
      await this.props.contractViewCtrl.sup_submit();
      showSuccess('Успешно подписан');

    } catch (e) {
      console.warn(e);
      showError(e && e.message || 'Ошибка. Попробуйте позже.');
    }
  };

  sup_decline = async () => {
    try {
      await this.props.contractViewCtrl.sup_decline();
      showSuccess('Успешно отклонён');

    } catch (e) {
      console.warn(e);
      showError(e && e.message || 'Ошибка. Попробуйте позже.');
    }
  };

  finish = async () => {
    await this.props.contractViewCtrl.finish(this.id);
    showSuccess(this.props.t('Успешно завершен'));
    this.load(this.id);
  };


  render() {
    const {navigation, contractViewCtrl} = this.props;
    let {
      contract, consignments, invoices, isOwner, isVendor,
      otpStatus, otpCode, canSubmitSign,
      OTP_INIT, OTP_SENDING, OTP_SENT, ready
    } = contractViewCtrl;

    let consFinished = consignments && consignments.every(con => con.got_status === true);
    let invsFinished = invoices && invoices.every(inv => inv.status === 'Finished');
    let canFinish = consFinished && invsFinished;

    const Header = (
      <Toolbar>
        <ToolbarButton back/>
        <ToolbarTitle>{`Договор № ${(contract && contract.code) || ''}`}</ToolbarTitle>
      </Toolbar>
    );

    return (
      <ScreenWrapper header={Header} loading={!ready}>
        <ContractDetails contract={contract} showLots consignments={consignments} invoices={invoices}
                         navigation={navigation}/>
        {isOwner && (
          <>
            {contract.status.in_('Schedule', 'Review') &&
            <>
              <Button onPress={navigation.navigate('purchaser/contracts/schedule_edit', {id: contract.id})}
                      title={'Графики поставок и платежей'}/>
              <Button className="mt-2 ml-2" color={vars.red} title={'Отменить'} onPress={() => console.log('cancel')}/>
            </>
            }
            {contract.status === 'Active' && canFinish && <Button onPress={this.finish} title={'Завершить'}/>}
          </>
        )}

        {isVendor && (() => {
          if (contract.status === 'Pending') {
            if (otpStatus === OTP_INIT) {
              return (<Button className="mt-2 ml-2" onPress={this.sendOTP} title={'Подписать Договор'}/>);

            } else if (otpStatus === OTP_SENDING) {
              return <Spinner/>

            } else if (otpStatus === OTP_SENT) {
              return (
                <>
                  <Title>Код подтверждения отправлен Вам в СМС. Введите его в поле ниже.</Title>
                  <Input placeholder="Код OTP" autoFocus value={otpCode}
                         onChange={value => this.setOTP(value)}/>
                  <Button onPress={this.sup_submit} disabled={!canSubmitSign} title={'Отправить'}/>
                </>
              )
            }
          }

          if (contract.status.in_('Pending', 'Schedule')) {
            return (
              <ConfirmButton message={'Вы уверены, что хотите отклонить договор?'} onYes={this.sup_decline}
                             color={vars.danger} buttonTitle={'Отклонить'}/>
            )
          }
        })()}
      </ScreenWrapper>
    )
  }
}

class ContractDetails extends React.Component {
  render() {
    let {contract, columns, showLots, preTitle, consignments, invoices, navigation} = this.props;
    let {announce, lots} = contract;
    let {pur_company, sup_company} = contract;

    let showLink = contract.status.in_('Active', 'Finished');
    if (!contract) return null;

    return (
      <>
        <CompanyInfo title="Закупщик" company={pur_company} navigation={navigation}/>
        <CompanyInfo title="Поставщик" company={sup_company} navigation={navigation}/>

        {announce &&
        <AnnounceInfo announce={announce} contract={contract} navigation={navigation}/>
        }

        {showLots &&
        <LotsList columns={columns} lots={lots} accessorTotal="total" navigation={navigation}/>
        }

        {consignments && (consignments.length > 0) &&
        <ConsList items={consignments} showLink={showLink} navigation={navigation}/>
        }

        {invoices && (invoices.length > 0) &&
        <ConsListEdit items={invoices} showLink={showLink} navigation={navigation}/>
        }
        <ItemView label={'Статус'} value={getStatusTr('contract', contract.status, {long: true})}/>
      </>
    )
  }
}

@inject('mainStore')
export class CompanyInfo extends Component {
  getCompanyFio = (company) => {
    if (company.typeofownership === 'ip') {
      return company.name
    } else {
      return company.owner_data && company.owner_data.fio || company.name
    }
  };


  render() {
    let {t, title, company, navigation} = this.props;
    const {mainStore} = this.props;
    const {language} = mainStore;

    let label = 'name';
    if (language && language.code === 'en') {
      label = 'name_en';
    }
    if (language && language.code === 'kg') {
      label = 'name_kg';
    }
    let companyName = <Text style={{color: vars.primary, textDecorationLine: 'underline'}}
                            onPress={() => navigation.navigate('supplier/info', {id: company._id})}>
      {company.short_name}
    </Text>;
    if (company.company_type === 'purchaser') {
      companyName = company.short_name
    }
    return (
      <Card title={title}>
        {!!company ?
          <>
            <ItemView label={'Наименование'} value={companyName}/>
            <ItemView label={'ИНН'} value={company.inn}/>
            <ItemView label={'Форма собственности'} value={company.ownership && company.ownership[label]}/>
            <ItemView label={'Банк'} value={company.bank && company.bank.dirbank && company.bank.dirbank[label]}/>
            <ItemView label={'БИК'} value={company.bank && company.bank.bik}/>
            <ItemView label={'Лицевой счет'} value={company.bank && company.bank.account_number}/>
            <ItemView label={'ФИО руководителя'} value={this.getCompanyFio(company)}/>
          </>
          : <NoDataView/>
        }
      </Card>
    )
  }
}

@inject('mainStore')
export class AnnounceInfo extends Component {
  render() {
    let {t, announce, contract, navigation} = this.props;
    const {mainStore} = this.props;
    const {language} = mainStore;

    let label = 'name';
    if (language && language.code === 'en') {
      label = 'name_en';
    }
    if (language && language.code === 'kg') {
      label = 'name_kg';
    }

    return (
      <>
        <Title>Информация об объявлении</Title>
        <Card title={`№ объявления ${announce.code}`}
              onPress={() => navigation.navigate('announce/view', {id: announce._id})}>
          <ItemView label={'Метод закупок'} value={announce.dirprocurement && announce.dirprocurement[label]}/>
          <ItemView label={'Дата публикации'} value={formatDateTime(announce.created_date)}/>
          <ItemView label={'Срок подачи предложения'} value={formatDateTime(announce.deadline)}/>
          <ItemView label={'Дата создания договора'} value={formatDateTime(contract.created_date)}/>
        </Card>
      </>
    )
  }
}

@inject('mainStore')
export class LotsList extends Component {
  render() {
    let {t, columns, lots, accessorTotal = 'budget', mainStore} = this.props;
    if (!lots) return null;
    const {language} = mainStore;

    let label = 'name';
    if (language && language.code === 'en') {
      label = 'name_en';
    }
    if (language && language.code === 'kg') {
      label = 'name_kg';
    }
    return (
      <>
        <Title>Предметы закупки - {lots.length}</Title>
        {!!lots && lots.map((l, i) => <Card key={i}>
          <ItemView label={'Категория'} value={l.dircategory[0][label]}/>
          <ItemView label={'Ед.изм'} value={l.dirunit[label]}/>
          <ItemView label={'Количество'} value={l.quantity}/>
          <ItemView label={'Цена за ед.'} value={formatMoney(l.unit_price)}/>
          <ItemView label={'Сумма'} value={formatMoney(l.accessorTotal)}/>
          <ItemView label={'Адрес и место поставки'} value={l.delivery_place}/>
          <ItemView label={'Сроки поставки'} value={l.estimated_delivery_time + ' дней'}/>
        </Card>)
        }
      </>
    )
  }
}

@inject('mainStore') @observer
export class ConsList extends Component {
  @observable ready = false;
  @observable items;

  render() {
    let {t, items, showLink, navigation} = this.props;
    if (!items) return;

    return (
      <>
        <h4>{t('График поставок')}</h4>
        {items.map((item, i) => <Card key={i} onPress={() => {
          if (showLink) {
            navigation.navigate('consignment/view', {id: item.id});
          }
        }}>
          <ItemView label={'Дата начала поставки'} value={formatDate(item.date_from)}/>
          <ItemView label={'Дата завершения поставки'} value={formatDate(item.date_to)}/>
          <ItemView label={'Кол-во позиций'} value={formatDate(item.lots.length)}/>
          <ItemView label={'Место поставки'} value={item.address}/>
          <ItemView label={'Условия поставки'} value={item.conditions}/>
          <ItemView label={'Статус'} value={getStatusTr('con', item.con.got_status ? 'Finished' : 'Pending')}/>
        </Card>)}
      </>
    )
  }
}

@observer
export class ConsListEdit extends Component {
  render() {
    let {t, items, showLink, navigation} = this.props;
    if (!items) return null;
    return (
      <>
        <Title>График платежей</Title>

        {items.map((item, i) => <Card key={i} onPress={() => {
          if (showLink) {
            navigation.navigate('invoice/view', {id: item.id})
          }
        }}>
          <ItemView label={'Дата платежа'} value={formatDate(item.date)}/>
          <ItemView label={'Вид платежа'} value={getPayTypeTr(item.type)}/>
          <ItemView label={'%'} value={item.percent}/>
          <ItemView label={'Сумма платежа'} value={formatMoney(item.amount)}/>
          <ItemView label={'Условия оплаты'} value={formatMoney(item.conditions)}/>
          <ItemView label={'Статус'} value={getStatusTr(item.inv.status || 'Pending')}/>
        </Card>)}
      </>
    )
  }
}



