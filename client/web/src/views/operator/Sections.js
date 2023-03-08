import React from "react"
import AppTable from "components/AppTable";
import {inject, observer} from "mobx-react";
import {Card, CardBody, CardFooter, CardTitle, Col, Collapse, FormFeedback} from "reactstrap";
import AppButton from "components/AppButton";
import Input from "components/AppInput";
import Select from "components/Select";
import {showError, showSuccess} from "utils/messages";

@inject("specStore") @observer
export default class Sections extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      sections: [],
      section: {name: null, categories: []},
      categories: [],
      category: null, // selected category being added into section
      isDetailsOpen: false,
      isEditing: false,
    };
  }

  componentDidMount() {
    this.resetSection();
    this.getSections();
    this.getSpecifications()
  }

  resetSection(extra) {
    this.setState({
      section: {name: null, categories: []},
      isEditing: false,
      category: null,
      ...extra
    })
  }

  getSections() {
    this.props.specStore.getSections()
      .then(sections => this.setState({sections}))
      .catch((e) => console.log(e));
  }

  getSpecifications(input) {
    this.props.specStore.getSpecifications({search: input})
      .then(specifications => this.setState({categories: specifications}))
      .catch(e => console.log(e))
  }

  onNewSectionClick = () => {
    this.resetSection({isDetailsOpen: true});
  };

  onCancelClick = () => {
    this.resetSection({isDetailsOpen: false})
  };

  onSectionEditClick = (section) => {
    this.props.specStore.getCategoriesByIds({ids: section.dircategories_id}).then(categories => {
      section.categories = categories;
      this.setState({section: Object.assign({}, section), isEditing: true, isDetailsOpen: true})
    });
  };

  onSectionSaveClick = () => {
    let s = {...this.state.section};
    s.dircategories_id = s.categories.map(c => c.id);
    s.type = "DirSection";
    delete s.categories;

    this.props.specStore.saveSection(s)
      .then(r => {
        showSuccess("Раздел сохранен");
        // Lagging when animation (Collapse component close) and
        // it's child components' state update are happening at the same time
        this.setState({isDetailsOpen: false}, () => this.resetSection());
        this.getSections();
      })
      .catch(e => showError("Произошла ошибка при сохранении"));
  };

  canSaveSection() {
    let s = this.state.section;
    return s.name && s.categories.length > 0
  }

  isAlreadySelected(option) {
    return this.state.section.categories.some({id: option.id})
  }

  render() {
    let columns = [
      {expander: true},
      {Cell: ({index}) => index + 1, filterable: false, className: "text-center", width: 50},
      {Header: "Наименование", accessor: "name"},
      {Header: "Дата создания", accessor: "_created"},
      {
        Header: "Количество категорий", accessor: "dircategories_id.length",
        className: "text-center"
      },
      {
        Header: "",
        width: 42,
        filterable: false,
        Cell: p => <AppButton size={"sm"} outline onClick={() => this.onSectionEditClick(p.original)}>
          <i className={"fa fa-edit"}/></AppButton>
      }];
    return (
      <div className={this.props.className}>
        <Card>
          <CardBody>
            <CardTitle>
              Разделы
            </CardTitle>
            <AppTable data={this.state.sections}
                      columns={columns}
                      pageSize={5}
                      SubComponent={({original}) => <span>{original.dircategories_id}</span>}/>
          </CardBody>
          <CardFooter>
            <AppButton onClick={this.onNewSectionClick}>
              Добавить новый раздел
            </AppButton>
          </CardFooter>
        </Card>

        <Collapse isOpen={this.state.isDetailsOpen}>
          {this.renderSectionDetails()}
        </Collapse>
      </div>
    )
  }

  renderSectionDetails() {
    let saveBtnLabel = this.state.isEditing ? "Сохранить" : "Добавить";
    let section = this.state.section;
    let columns = [{Header: "Наименование категории", accessor: "dircategory.name"}, {
      width: 42, filterable: false,
      Cell: row => <AppButton color={"danger"} outline size={"sm"}
                              onClick={() => {
                                let index = section.categories.indexOf(row.original);
                                if (index !== -1) {
                                  section.categories.splice(index, 1);
                                  this.setState({section: this.state.section});
                                }
                              }}><i
        className={"fa fa-trash"}/></AppButton>
    }];
    return (
      <Col>
        <Input required
               className={"mt-2"}
               placeholder={"Наименование раздела"}
               value={this.state.section.name}
               onChange={event => {
                 this.state.section.name = event.target.value;
                 this.setState({section: this.state.section})
               }}
               invalid={!section.name}/>
        <FormFeedback>Введите наименование раздела</FormFeedback>
        <Select required
                className={"mt-2"}
                value={this.state.category}
                options={this.state.categories}
                placeholder={"Выберите категорию"}
                onInputChange={(input) => {
                  if (input !== "") {
                    this.getSpecifications(input);
                  }
                }}
                onChange={category => {
                  if (category) {
                    let found = section.categories.find(c => c.id === category.id);
                    if (!found) {
                      section.categories.push(category);
                      this.setState({section: this.state.section});
                    }
                  }
                  this.setState({category})
                }}
                valueRenderer={(val) => <div>{val.dircategory.name}</div>}
                optionRenderer={opt =>
                  <div className={"d-flex align-items-center justify-content-between"}>
                    <span>{opt.dircategory.name}{"  "}</span>{this.isAlreadySelected(opt) &&
                  <i className={"fa fa-check"}/>}
                  </div>
                }/>

        {section.categories && section.categories.length > 0 && <AppTable data={section.categories}
                                                                          columns={columns}
                                                                          showRowNumbers={true}
                                                                          pageSize={5}
                                                                          className={"my-2"}/>}

        <div>
          <AppButton color={"danger"} onClick={this.onCancelClick}>
            Отменить
          </AppButton>
          <AppButton className={"mx-2"} color={"success"} onClick={this.onSectionSaveClick}
                     disabled={!this.canSaveSection()}>{saveBtnLabel}</AppButton>
        </div>
      </Col>)
  }
}
