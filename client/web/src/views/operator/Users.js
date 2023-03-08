import React, {Component} from 'react';
import Table from "components/AppTable"
import {inject} from "mobx-react"
import {ConfirmButton} from "components/AppButton";
import {showError, showSuccess} from "utils/messages";
import {Link} from "react-router-dom";
import {translate} from "react-i18next";

@inject("adminStore")
@translate(['common', 'settings', ''])
export default class Users extends Component {

  state = {};

  componentDidMount() {
    this.getUsers();
  }

  getUsers() {
    this.props.adminStore.getUsers().then(users => this.setState({users}))
  }

  updateUser(user_id, active) {
    this.props.adminStore.updateUser({user_id, active})
      .then(r => {
        showSuccess(`Пользователь ${r.user.username} ${active ? 'активирован' : 'заблокирован'}`);
        this.getUsers();
      })
      .catch(e => showError(`Произошла ошибка при ${active ? 'активации' : 'блокировке'}`))
  }

  render() {
    const {t} = this.props;
    let {users} = this.state;
    let columns = [];
    columns.push({
      Header: t('Список пользователей'), columns: [
        {Header: t('Имя пользователя'), accessor: "username"},
        {Header: t('ФИО'), accessor: "fullname"},
        {Header: t('ИНН'), accessor: "inn"},
        {Header: t('Номер телефона'), accessor: "phone"},
        {Header: t('Дата регистрации'), accessor: "rec_date"},
        {
          width: 40, filterable: false, sortable: false,
          Cell: (row) => (
            <Link to={'/user/edit/' + row.original.id} title={'Редактировать'}>
              <i className="fa fa-lg fa-edit mr-2"/>
            </Link>
          )
        },
        {
          width: 40, filterable: false,
          Cell: row => {
            let user = row.original;
            if (user.active)
              return <ConfirmButton size={'sm'} color={'danger'} title={'Вы действительно хотите заблокировать?'}
                                    onConfirm={() => this.updateUser(user.id, false)}>
                <i className="fa fa-ban"/>
              </ConfirmButton>;
            else return <ConfirmButton size={'sm'} color={'success'} title={"Активировать данного пользователя?"}
                                       onConfirm={() => this.updateUser(user.id, true)}>
              <i className="fa fa-check"/>
            </ConfirmButton>;
          }
        }
      ]
    });

    return (
      <div className="animated fadeIn">
        <Table data={users}
               columns={columns}/>
      </div>
    )
  }
}
