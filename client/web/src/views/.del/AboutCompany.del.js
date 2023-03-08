import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import {Badge, Card, CardBody, CardFooter, CardHeader, Col} from "reactstrap";
import Select from "components/Select";
import Button from "components/AppButton";
import Input, {FormInput} from "components/AppInput";

@inject('supplierStore') @observer
export default class AboutCompany extends Component {

  render() {
    const {supplierStore} = this.props;
    const {company, banks, ownershipTypes} = supplierStore;

    return (
      <div className="animated fadeIn">
        <Col xs={{size: 12}} md={{size: 6, offset: 3}}>

          <Card>
            <CardBody>
              <h3>
                <Badge color="primary">Информация об организации</Badge>
              </h3>
              <br/>
              <FormInput label="Форма собственности">
                <Select options={ownershipTypes.slice()}
                        value={company.ownershipType}
                        labelKey='name'
                        valueKey='id'
                        disabled/>
              </FormInput>

              <FormInput label="ИНН организации">
                <Input type="number" readOnly value={company.inn}/>
              </FormInput>

              <FormInput label="Наименование организации">
                <Input type="text" readOnly value={company.organizationName}/>
              </FormInput>

              <FormInput label="Рабочий телефон">
                <Input type="text" value={company.phoneNumber}/>
              </FormInput>

              <FormInput label="Юридический адрес">
                <Input type="text" value={company.legalAddress}/>
              </FormInput>

              <FormInput label="Фактический адрес">
                <Input type="text" value={company.actualAddress}/>
              </FormInput>

              <FormInput label="Веб-сайт">
                <Input type="url" value={company.website}/>
              </FormInput>

              <FormInput label="Банк">
                <Select options={banks.slice()}
                        value={company.bank}
                        labelKey='name'
                        valueKey='id'
                        onChange={(newValue) => {
                          company.bank = newValue
                        }}/>
              </FormInput>

              <FormInput label="Депозитный счет для перечисления гарантийного обеспечения конкурсной заявки">
                <Input type="number" value={company.depositAccount}/>
              </FormInput>

              <FormInput label="БИК">
                <Input type="number" value={company.bik}/>
              </FormInput>

            </CardBody>

            <CardFooter>
              <Button onClick={() => this.props.history.push("/org")}>Сохранить</Button>
            </CardFooter>
          </Card>
        </Col>

      </div>)
  }
}
