import React, {Component} from 'react'
import {FGI} from "components/AppInput";
import {Badge, Card, CardBody, CardText, Col, Input, Row} from "reactstrap";
import Select from "components/Select";
import DatePicker from "components/DatePicker";
import AppButton from "components/AppButton";
import {inject} from "mobx-react";

@inject("dictStore", "supplierStore")
export default class Announcement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'Введите наименование закупки которое будет отображаться на портале',
      val: 'Введите  адрес и место поставки'

    };
  }

  componentWillMount() {
    this.props.dictStore.getDictData2({type: 'DirCountry'}).then(r => {
      this.setState({countries: r});
    });
    this.props.dictStore.getDictData2({type: 'DirCoate'}).then(r => {
      this.setState({coates: r});
    });
    this.props.dictStore.getDictData2({type: 'DirBank'}).then(r => {
      this.setState({banks: r});
    });
    this.props.dictStore.getDictData2({type: 'DirBank'}).then(r => {
      this.setState({banks: r});
    });
    this.props.supplierStore.getCategories('').then(r => {
      this.setState({categories: r});
    });
  }

  onchange = (event) => {
    this.setState({value: event.target.value});
  };

  handleChange = (event) => {
    this.setState({val: event.target.value})
  };

  render() {
    return (

      <div className="container">
        <div className="d-flex justify-content-center">
          <h3> Формирование объявления</h3>
        </div>
        <Row className={"mb-2"}>
          <Col md="7">
            <Card>
              <CardBody>
                <h3>
                  <Badge color="primary">Бумага</Badge>
                </h3>

                <br/>
                <Row>
                  <Col md={7}>
                    <CardText> Наименование продукта: </CardText>
                    <CardText> Техническая спецификация:</CardText>
                    <CardText> Единица изерения:</CardText>
                    <CardText> Цена за единицу: </CardText>
                  </Col>
                  <Col md={4}>
                    <CardText>Бумага</CardText>
                    <CardText>Формат-А4</CardText>
                    <CardText> Пачка(500 листов)</CardText>
                    <CardText>220.50 сом(Средняя цена товара из Каталога)</CardText>
                  </Col>
                </Row>


              </CardBody>

            </Card>
          </Col>
        </Row>
        <form>
          <Row>
            <Col md="7">
              <FGI l="Количество" lf="5" ls="7">
                <Input type="number"
                       placeholder="(число)"
                />
              </FGI>
            </Col>
          </Row>

          <Row className={"mb-2"}>
            <Col md="7">
              <FGI l="Метод закупок" lf="5" ls="7">
                <Select options={[]}>

                </Select>


              </FGI>
            </Col>
          </Row>

          <Row className={"mb-2"}>
            <Col md="7">
              <FGI l="Наименование закупки" lf="5" ls="7">
                    <textarea onChange={this.onchange}

                    >

                    </textarea>


              </FGI>
            </Col>
          </Row>
          <Row className={"mb-2"}>
            <Col md="7">
              <FGI l="Сроки" lf="5" ls="7">
                <p> Сроки подачи конкурсных заявок </p>
                <p>Срок может изенятся в зависимости от метода заявок</p>
                <DatePicker

                  placeholder={'// час  мин'}
                />
                <p> Срок поставки товара</p>
                <DatePicker
                  onChange={(v) => {
                  }}
                  placeholder={'// час  мин'}
                />


              </FGI>
            </Col>
          </Row>
          <Row className={"mb-2"}>
            <Col md="7">
              <FGI l="Адрес и место поставки" lf="5" ls="7">
                    <textarea onChange={this.handleChange}>


                    </textarea>


              </FGI>
            </Col>
          </Row>


          <Row>
            <Col md={3}><AppButton>Сохранить в мои объявления</AppButton></Col>
            <Col md={3} className="offset-md-6"><AppButton>Просмотр и публикация</AppButton></Col>
          </Row>
        </form>

      </div>
    )


  }
}








