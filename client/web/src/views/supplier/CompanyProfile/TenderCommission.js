import React, {Component} from 'react';
import {Col, Row, Table, InputGroup, InputGroupAddon, Button as RButton, Modal, ModalHeader, ModalBody, ModalFooter, Alert} from "reactstrap";
import {inject, observer} from 'mobx-react';
import Button from "components/AppButton";
import Input, {FGI} from "components/AppInput";
import {translate} from "react-i18next";
import * as request from "utils/requester";
import {Link} from "react-router-dom";


// @translate(['common', 'settings', ''])
// @inject("") // ПОСЛЕ НАСТРОЙКИ СЕРВЕРА ВСТАВИТЬ MOBX STORE ДЛЯ ЧЛЕНОВ КОМИССИИ
// @observer
class TenderCommission extends Component {

  state = {
    members: [],
    cSelected: [],
    innInput: '',
    newMember: '',
    modal: false,
    confirm: false,
    alertMessage: "",
    alertStatus: false,
    alertType: "warning",
    isEdit: false,
    btnTitle: "Добавить",
  };



  async searchMember(innValue) {
    this.setState({newMember: '', alertStatus: false});
    let newMemR = await request.post("user/get_by_inn", {'inn': innValue});
    if (newMemR) {this.setState({newMember: newMemR.doc}); }
    else if (innValue.length !== 14) {this.setState({alertStatus:true, alertMessage: 'Необходимо ввести 14 значный ИНН'})}
    else {this.setState({alertStatus:true, alertMessage: 'Такого человека или фирмы нет'})}
  }

  async saveNewMember(newComp, {members}=this.state){
    await request.post("user/save_comm_member", {
      'inn': newComp.inn, 'fullname': newComp.fullname,
      'position': newComp.position, 'email': newComp.email,
      'company': newComp.cm_company});
    this.setState({members: [...members, newComp], alertType: 'success', alertStatus: true, alertMessage: 'Успешно добавлен'});
    console.log("Is Edit", this.state.isEdit);
  }
  async saveEditMember(newComp, {members}=this.state){
    await request.post("user/save_comm_member", {
      'inn': newComp.inn, 'fullname': newComp.fullname,
      'position': newComp.position, 'email': newComp.email,
      'company': newComp.cm_company});
    this.setState({alertType: 'success', alertStatus: true, alertMessage: 'Изменения успешно сохранены'});
    console.log("Is Edit", this.state.isEdit);
  }

  addNewMember(newComp, {members}=this.state) {
    let status = true;
    members.forEach(item => {if(item.inn === newComp.inn) return status=false;});
    if (status === false) this.setState({alertMessage: "Вы уже добавили этого человека", alertType: 'warning', alertStatus: true})
    else this.setState({newMember:'', alertStatus: false, innInput: ''});
    status ? this.saveNewMember(newComp) : null;
  }

  async removeFromMembers(item, {members} = this.state) {
    let res = await request.post("user/delete_comm_member", {'inn': item.inn});
    if (res){
      members.splice(members.indexOf(item), 1);
      this.setState({members: [...members]});
      this.toggle();
      this.setState({newMember:'', alertStatus: false, innInput: '', isEdit: false});
    }
  }

  editMember (newComp, {members}=this.state) {
    let status = true;
    members.forEach(item => {if(item.inn === newComp.inn)
    {
      item.cm_company = newComp.cm_company;
      item.fullname = newComp.fullname;
      item.position = newComp.position;
      item.email = newComp.email;
    }});
    // this.setState({alertMessage: "Успешно сохранено", alertType: 'success', alertStatus: true})
    status ? this.saveEditMember(newComp) : null;
    this.setState({newMember:'', alertStatus: false, innInput: '', isEdit: false});
  }

  saveChanges (newComp, {members } = this.state){
    if (this.state.isEdit === true)
      this.editMember(newComp)
    else
      this.addNewMember(newComp)
  }

  async getAllMembers() {
    let res = await request.post("employee/all_comm_member");
    this.setState({members: res.docs});
  }

  onCheckboxClick(selected, event, {members, cSelected} = this.state) {
    if (event.target.id === 'allMembersCheck' && selected === null) {
      event.target.checked ? this.setState(Object.assign(cSelected, members)) : this.setState({cSelected: cSelected.length=0});
    } else {
      const index = cSelected.indexOf(selected);
      index < 0 ? cSelected.push(selected) : cSelected.splice(index, 1);
    }
    this.setState({cSelected: [...cSelected]});
  };

  toggle = () => this.setState({modal: !this.state.modal});

  componentDidMount() {
    this.getAllMembers();
  }

  render() {
    const {members, cSelected, innInput, newMember, modal, confirm, alertStatus, alertMessage, inn, work, duty, email, fullName} = this.state;

    return (
      <>
        <h2 align="center">Конкурсная комисия</h2>
        <Row style={{marginBottom: '14px'}}>
          <Col>

            <InputGroup style={{marginBottom: '20px'}}>
              <Input type="number" placeholder={"Поиск по ПИН"} value={innInput}
                     onChange={(e) => {this.setState({innInput: e.target.value, btnTitle: "Добавить"})}  }/>
              <InputGroupAddon addonType="append">
                <Button color="secondary" onClick={()=>this.searchMember(innInput)}>Найти</Button>
              </InputGroupAddon>
            </InputGroup>

          </Col>
        </Row>

        <Row style={{marginBottom: '20px'}}>
          <Col>
            <FGI l={'ПИН'} required={true} lf="12" ls="12">
              <Input type="number" disabled value={newMember ? newMember.inn : null}/>
            </FGI>
            <FGI l={'ФИО'} lf="12" ls="12">
              <Input type="text" disabled value={newMember ? newMember.fullname : null}/>
            </FGI>
          </Col>
          <Col>
            <FGI l={'Место Работы'} lf="12" ls="12">
              <Input type="text" placeholder={"Укажите место работы"} value={newMember ? newMember.cm_company : null}
                     onChange={(e)=> {this.setState({newMember: {...newMember, cm_company: e.target.value}})}}/>
            </FGI>
            <FGI l={'Должность'} lf="12" ls="12">
              <Input type="text" placeholder={"Укажите должность"} value={newMember ? newMember.position : null}
                     onChange={(e)=> {this.setState({newMember: {...newMember, position: e.target.value}})}}/>
            </FGI>
          </Col>
          <Col>
            <FGI l={'Электронная почта'} lf="12" ls="12">
              <Input type="e-mail" placeholder={"E-mail"} value={newMember ? newMember.email : null}
                     onChange={(e)=> {this.setState({newMember: {...newMember, email: e.target.value}})}}/>
            </FGI>
            <FGI l={<span>&nbsp;</span>} lf="12" ls="12">
              <RButton color="primary" onClick={()=>this.saveChanges(newMember) } disabled={!newMember}>{this.state.btnTitle}</RButton> {"   "}
              {/*<RButton color="primary" onClick={()=>this.addNewMember(newMember)} disabled={!newMember}>Добавить</RButton> {"   "}*/}
              <RButton color="secondary" onClick={()=>this.setState({newMember:'', alertStatus: false, innInput: ''})}> Новый </RButton>
            </FGI>
          </Col>
        </Row>

        <Alert color={this.state.alertType || 'warning'} isOpen={alertStatus} toggle={()=>this.setState({alertStatus:false})}>{alertMessage}</Alert>

        {members.length > 0 && <>
          <Table striped hover>
            <thead>
            <tr>
              {/*<th><input type="checkbox" id={'allMembersCheck'} onChange={(e) => this.onCheckboxClick(null, e)}*/}
              {/*           checked={cSelected.length === members.length}/></th>*/}
              <th>№</th>
              <th>Фамилия имя отчество</th>
              <th>ПИН</th>
              <th>Место работы</th>
              <th>Должность</th>
              <th>E-mail</th>
              <th style={{textAlign: 'center'}}>Действия</th>
            </tr>
            </thead>
            <tbody>
            {members.map((item, ind) => {
              return <tr key={ind * 3 + 1 + 102}>
                {/*<th><input type="checkbox" onChange={(e) => this.onCheckboxClick(item, e)}*/}
                {/*           checked={cSelected.includes(item)}/></th>*/}
                <th scope="row">{ind + 1}</th>
                <td>{item.fullname}</td>
                <td>{item.inn}</td>
                <td>{item.cm_company}</td>
                <td>{item.position}</td>
                <td>{item.email}</td>
                <td>
                  <Link onClick={() => this.setState({newMember: item, isEdit: true, btnTitle: "Сохранить"})} title={"Изменить"}>
                    <i className={"fa fa-lg fa-edit mr-2"}/>
                  </Link>
                  <Link onClick={() => this.setState({modal: true, confirm: item})} title={"Удалить"}>
                    <i className={"fa fa-lg fa-trash mr-2"}/>
                  </Link>
                </td>
              </tr>
            })}
            </tbody>
          </Table>

          <Modal isOpen={modal} toggle={this.toggle}>
            <ModalHeader toggle={this.toggle}><b>Вы уверены что хотите удалить {confirm.fullname}?</b></ModalHeader>
            <ModalBody>
              <p>ИНН: {confirm.inn}</p>
              <p>Должность: {confirm.position}</p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={() => this.removeFromMembers(confirm)}>Удалить</Button>{' '}
              <Button color="primary" onClick={this.toggle}>Отмена</Button>
            </ModalFooter>
          </Modal>

        </>}

      </>
    )
  }
}

export default TenderCommission
