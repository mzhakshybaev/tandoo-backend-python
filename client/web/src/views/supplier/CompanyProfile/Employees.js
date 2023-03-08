import React, {Component} from 'react';
import AppButton from "components/AppButton";
import {Col, Row} from "reactstrap";
import Select, {AsyncSelect} from "components/Select";
import {Fg} from "components/AppInput";
import Table from 'components/AppTable';
import {showError, showSuccess} from "utils/messages";
import {inject} from "mobx-react";
import DatePicker from "components/DatePicker";
import moment from "moment";
import {translate} from "react-i18next";
import Swal from "sweetalert2";

@translate(['common', 'settings', '']) @inject("supplierStore", "authStore")
class Employees extends Component {
  constructor(props) {
    super(props);

    this.state = {employee: {}, employees: [], btnTitle: 'Добавить'};
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
    let res = await Swal({
      title: 'Вы действительно хотите удалить сотрудника?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Да',
      cancelButtonText: 'Отмена'
    });

    if (res.value) {
      this.props.supplierStore.removeEmployee(employee).then(r => {
        showSuccess("Успешно удалено");
        this.resetEmployee();
        this.getEmployees();
      });
    }
  };

  render() {
    const {t} = this.props;
    let e = this.state.employee;

    return (
      <div>
        <Row className={"mb-2"}>
          <Col md={4} sm={12}>
            <Fg label={t('Сотрудник')}>
              <AsyncSelect
                value={e.userId}
                valueKey={"id"}
                labelKey={"info"}
                simpleValue
                placeholder={t('Поиск сотрудника')}
                onChange={userId => {
                  e.userId = userId;
                  this.setState({employee: e})
                }}
                loadOptions={this.props.supplierStore.getUsers}
              />
            </Fg>
          </Col>
          <Col md={4} sm={12}>
            <Fg label={t('Роль сотрудника')}>
              <Select
                value={e.roleId}
                valueKey={"_id"}
                labelKey={"name"}
                simpleValue
                placeholder={t('Должность')}
                options={this.state.roles}
                onChange={roleId => {
                  e.roleId = roleId;
                  this.setState({employee: e})
                }}/>
            </Fg>
          </Col>
          <Col md={4} sm={12}>
            <Fg label={t('Дата окончания')}>
              <DatePicker value={e.endDate}
                          dateFormat={this.dateFormat}
                          onChange={value => {
                            e.endDate = value;
                            this.setState({employee: e})
                          }}/>
            </Fg>
          </Col>
          <Col className="d-flex justify-content-center p-1">
            {this.canCancel() && <AppButton color={"danger"} onClick={this.resetEmployee}>
              <i className="fa fa-remove"/>{" "}{t('Отменить')}</AppButton>}
            <AppButton className={"ml-2"} disabled={!this.canSave()} onClick={this.saveEmployee}>
              <i className="fa fa-user-plus"/>{" "} {t("" + this.state.btnTitle + "")}</AppButton>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <Table
              data={this.state.employees}
              columns={[
                {Header: t("ИНН"), accessor: "inn"},
                {Header: t("ФИО"), accessor: "fullname"},
                {Header: t("Роль"), accessor: "position"},
                {Header: t("Дата окончания"), accessor: "data.end_date"},
                // {
                //   Header: t(""), Cell: props =>
                //     <AppButton outline size={"sm"}
                //                title={t('Редактировать')}
                //                className={"align-self-center"}
                //                onClick={() => this.onEditClick(props.original)}>
                //       <i className={"fa fa-edit"}/>
                //     </AppButton>, width: 42, filterable: false
                // },
                {
                  Header: t(""), Cell: props =>
                    <AppButton outline size={"sm"}
                               title={t('Удалить')}
                               className={"align-self-center"}
                               onClick={() => this.onDeleteClick(props.original)}>
                      <i className={"fa fa-trash"}/>
                    </AppButton>, width: 42, filterable: false
                }
              ] || []}
              defaultPageSize={10}
              className="-striped -highlight"
              showRowNumbers={true}
            />
          </Col>
        </Row>
      </div>
    )
  }
}

export default Employees
