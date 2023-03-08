import React from 'react'
import {Text} from 'react-native';
import {inject, observer} from 'mobx-react';
import Toolbar, {ToolbarButton, ToolbarTitle} from "../../components/Toolbar";
import ScreenWrapper, {ScrollContainer} from "../../components/ScreenWrapper";
import Card from "../../components/Card";
import {observable, runInAction} from "mobx";
import TabView from "../../components/TabView";
import Button from "../../components/Button";
import * as request from "../../../utils/requester";
import ItemView from "../../components/ItemView";
import {getStatusTr} from "../../../utils/helpers";
import Spinner, {NoDataView} from "../../components/Spinner";
import {RadioBox} from "../../components/CheckBox";
import {showError, showSuccess} from "../../../utils/messages";

@inject("authStore") @observer
export default class Companies extends React.Component {
  @observable active = [];
  @observable inactive = [];
  @observable loading = false;

  componentDidMount() {
    let params = {with_roles: true,};
    this.loading = true;
    request.postAsync('company/listing', 'docs', params)
      .then(companies => {
        if (companies && companies.length > 0) {
          runInAction(() => {
            this.active = companies.filter(company => company.company_status === 'confirmed');
            this.inactive = companies.filter(company => company.company_status !== 'confirmed');
          });
        }
      })
      .finally(() => runInAction(() => this.loading = false));
  }

  render() {
    const Header = (
      <Toolbar hasTabs>
        <ToolbarButton back/>
        <ToolbarTitle>Мои организации</ToolbarTitle>
        <ToolbarButton iconName={'add'} onPress={() => this.props.navigation.navigate('companies/add')}/>
      </Toolbar>
    );

    const tab = <TabView>
      <ScrollContainer tabLabel={`Активные (${this.active ? this.active.length : 0})`}>
        {this.renderItem(this.active)}
      </ScrollContainer>
      <ScrollContainer tabLabel={`Неактивные (${this.active ? this.inactive.length : 0})`}>
        {this.renderItem(this.inactive)}
      </ScrollContainer>
    </TabView>;

    return <ScreenWrapper header={Header} tab={tab}/>
  }

  renderItem = (companies) => {
    const {navigation} = this.props;
    let {valid, user, company} = this.props.authStore;
    if (this.loading) return <Spinner/>;
    if (!companies || companies.length === 0) return <NoDataView/>;
    return companies.map(c => <Card key={c.inn}>
      <Text style={{fontWeight: 'bold'}}>{(c.short_name || c.name) + (c.roles && ` (${c.roles.name})`)}</Text>
      <ItemView label={'Статус'} value={getStatusTr('company', c.company_status)}/>
      {c.company_status === 'rejected' &&
      <>
        <ItemView label={'Причина'} value={c.reason}/>
        <Button title={'Редактировать'} onPress={() => navigation.navigate('companies/edit', {id: c._id})}/>
      </>
      }
      {c.company_status === 'confirmed' &&
      <>
        <Button onPress={() => this.handleSwitch(c._id)}
                title={'Открыть'}
                disabled={company && company._id === c._id}/>

        <RadioBox label={'По умолчанию'}
                  checked={user.default_company === c._id}
                  disabled={user.default_company === c._id}
                  onChange={() => this.handleSetDefault(c._id)}/>
      </>}
    </Card>)
  };

  async handleSwitch(id) {
    try {
      await this.props.authStore.setCompany(id);
      this.props.navigation.popToTop();

    } catch (e) {
      showError(e.message || 'Ошибка');
    }
  }

  async handleSetDefault(id) {
    try {
      await this.props.authStore.setDefaultCompany(id);
      showSuccess('Успешно изменено');

    } catch (e) {
      showError(e.message || 'Ошибка');
    }
  }
}






