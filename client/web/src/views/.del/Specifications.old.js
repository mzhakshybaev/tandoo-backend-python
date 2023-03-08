import React, {Component} from "react";
import {Card, CardBody, CardFooter, CardHeader, Col, Collapse, Row} from "reactstrap";
import {inject, observer} from "mobx-react";
import Input, {Fg, FGI} from "../../components/AppInput";
import Button from "../../components/AppButton";
import Table from "../../components/AppTable";
import Switcher from "../../components/Switcher";
import Sections from "./Sections";
import CategorySelector from "../../components/CategorySelector";


@inject("specStore") @observer
export default class SpecificationsOld extends Component {

  constructor(props) {
    super(props);
    this.state = {collapse: false, categories: []};
  }

  componentDidMount() {
    this.props.specStore.getDictionaries();
    this.getSpecifications();
  }

  async getSpecifications(input) {
    let specifications = await this.props.specStore.getSpecifications({search: input});
    this.setState({specifications});
  }

  render() {
    const {specStore} = this.props;
    let {product, attr} = specStore;
    let {specifications} = this.state;

    return (
      <div className="animated fadeIn">
        <Card>
          <CardBody>
            <Row>
              <Col xs="12" sm="12" lg="6" className={"p-0"}>
                <Col>
                  <Table data={specifications}
                         showRowNumbers={true}
                         columns={[{
                           Header: 'Список категорий', accessor: 'dircategory.name', Filter: ({filter, onChange}) => (
                             <input type='text'
                                    placeholder="Поиск"
                                    value={filter ? filter.value : ''}
                                    onChange={event => onChange(event.target.value)}
                                    style={{
                                      width: '100%',
                                    }}
                             />
                           ),
                         }]}
                         pageSize={5}
                         onClick={(row) => {
                           if (product.category !== row.dircategory) {
                             product.category = row.dircategory;
                             product.id = row.id;
                             specStore.getSpecificationData();
                           }
                         }}
                  />
                </Col>
                <Col className={"mt-2"}>
                  <Sections className={"d-flex flex-column"}/>
                </Col>
              </Col>
              <Col xs="12" sm="12" lg="6">
                <Card>
                  <CardHeader>
                    Спецификация
                  </CardHeader>
                  <CardBody>
                    <Fg label="Категория">
                      <CategorySelector
                        value={product.category}
                        onChange={value => product.category = value}/>
                    </Fg>
                    {this.renderDictionaries(specStore)}
                    <div className="my-2 d-flex flex-row justify-content-center">
                      <Button onClick={() => {
                        product.attr.push({name: null, name_kg: null, name_en: null, values: []})
                      }}>Добавить атрибут</Button>
                    </div>
                    {product.attr.map((a, i) => {
                      return this.renderAttribute(a, i)
                    })}
                  </CardBody>
                  <CardFooter>
                    <Button
                      color="success" onClick={() => {
                      specStore.saveSpecification()
                    }}> Save </Button>
                  </CardFooter>
                </Card>
              </Col>

            </Row>
          </CardBody>
        </Card>
      </div>
    )
  }

  renderAttribute(attr, i) {
    return (
      <Card key={i}>
        <CardHeader>
          Атрибут {i + 1}
          <div className={"card-actions"}>
            <Button color="danger"
                    outline onClick={() => this.props.specStore.product.attr.splice(i, 1)}>
              <i className={"fa fa-trash"}/>
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <Row className="px-3">
            <Input value={attr.name}
                   placeholder="Название RU"
                   className="col-md-4"
                   onChange={e => attr.name = e.target.value}/>
            <Input value={attr.name_kg}
                   placeholder="Название KG"
                   className="col-md-4"
                   onChange={e => attr.name_kg = e.target.value}/>
            <Input value={attr.name_en}
                   placeholder="Название EN"
                   className="col-md-4"
                   onChange={e => attr.name_en = e.target.value}/>
          </Row>

          <Col className="mt-3">
            <FGI l={"Поставщики"} lf={6} ls={6}>
              <Switcher checked={attr.switched} onChange={value => this.props.specStore.onSwitch(attr, value)}/>
            </FGI>
            <FGI l={"Закупщики"} lf={6} ls={6}>
              <Switcher checked={attr.switched} onChange={value => this.props.specStore.onSwitch(attr, value)}/>
            </FGI>
          </Col>

          <Row className="justify-content-center">
            <Button size="sm"
                    className="m-1"
                    onClick={() => attr.values.push({name: null, name_kg: null, name_en: null})}>
              <i className="fa fa-plus"/> {" "} Добавить значение
            </Button>
          </Row>

          <Row>
            <Col className={"d-flex flex-column"}>
              {attr.values.map((value, i) => this.renderValue(attr, value, i))}
            </Col>
          </Row>
        </CardBody>
      </Card>
    )
  }

  renderValue(attr, value, i) {
    return (
      <Card key={i}>
        <CardHeader>
          Значение {i + 1}
          <div className="card-actions">
            <Button color="danger" onClick={() => attr.values.splice(i, 1)}>
              <i className="fa fa-remove" style={{color: "#ec464f"}}/>
            </Button>
          </div>
        </CardHeader>
        <CardBody className="d-flex flex-row justify-content-start flex-wrap">
          <Input className={"col-md-4"}
                 value={value.name}
                 placeholder="RU"
                 onChange={(e) => {
                   value.name = e.target.value;
                 }}/>
          <Input className={"col-md-4"}
                 value={value.name_kg}
                 placeholder="KG"
                 onChange={(e) => {
                   value.name_kg = e.target.value;
                 }}/>
          <Input className={"col-md-4"}
                 value={value.name_en}
                 placeholder="EN"
                 onChange={(e) => {
                   value.name_en = e.target.value;
                 }}/>
        </CardBody></Card>
    )
  }

  renderDictionaries(specStore) {
    let {dictionaries} = specStore;
    return (
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => this.toggle()}>
          Добавить из справочника
          <div className={"card-actions"}>
            <Button color="danger" outline>
              {this.state.collapse ? <i className={"fa fa-chevron-up"}/> : <i className={"fa fa-chevron-down"}/>}
            </Button>
          </div>
        </CardHeader>
        <Collapse isOpen={this.state.collapse}>
          <CardBody>
            {dictionaries.map((d, i) =>
              <div key={i}>
                <FGI l={d.name} lf={6} ls={6}>
                  <Switcher size={"sm"}
                            checked={d.switched}
                            onChange={() => {
                              d.switched = !d.switched;
                              specStore.dictionaries = dictionaries.slice();
                            }}/>
                </FGI>
              </div>)}
          </CardBody>
        </Collapse>
      </Card>
    )
  }

  toggle() {
    this.setState({collapse: !this.state.collapse});
  }
}
