import React, {Component, Fragment} from 'react';
import {inject} from "mobx-react"
import {translate} from "react-i18next";
import {formatDateTime} from "utils/helpers";
import Switcher from "components/Switcher";
import AppButton from "components/AppButton";
import {Card, CardBody, CardHeader, Col, Input, Row} from "reactstrap";
import {convertFromRaw, EditorState} from "draft-js";
import {FORMAT_DATE_DB, FORMAT_DATE_TIME} from "utils/common";
import DirdocApi from "stores/api/DirdocApi";
import {showError, showSuccess} from "utils/messages";
import {Fg} from "components/AppInput";
import DatePicker from "components/DatePicker";
import moment from "moment";
import AppTable from "components/AppTable";
import Button from "./Spr";

@inject("adminStore")
@translate(['common', 'settings', ''])
export default class DirDocs extends Component {
  tableColumns = [
    {accessor: 'id', show: false},
    {Header: ("Тема (рус)"), accessor: "title"},
    {Header: "Тема (кыр)", accessor: "title_kg"},
    {Header: "Тема (eng)", accessor: "title_en"},
    {Header: "Дата создания", accessor: "created_from", Cell: ({value}) => formatDateTime(value)},
    {
      accessor: 'is_active',
      Cell: ({value, row}) =>
        <Switcher
          size={"sm"}
          checked={value}
          onChange={value => this.onSwitchClick(row.id, value)}/>,
      width: 50,
      filterable: false
    },
    {
      Cell: ({row}) =>
        <Fragment>
          <AppButton size={"sm mr-2"}
                     disabled={!this.canBeUpdated(row.created_from)}
                     onClick={() => this.onItemEditClick(row.id)}>
            <span className={"fa fa-edit"}/>
          </AppButton>
        </Fragment>,
      width: 80,
      filterable: false
    },
  ];

  state = {
    ...this.getDefState(),
    docs: [],
    showList: true,
    itemEdit: null,
  };

  reset = (extra) => {
    console.warn('reset');
    this.setState({...this.getDefState(), ...extra})
  };

  getDefState() {
    return {
      itemEdit: null,
      showList: true,
    }
  }

  onItemViewClick = id => {
    this.props.history.push(`/news/${id}`)
  };

  onItemEditClick = async id => {
    console.log(id);
    let item = await DirdocApi.getDirdoc(id);
    this.setState({
      itemEdit: item,
      showList: false
    });
  };

  componentDidMount() {
    this.getDirdocs();
  }

  getDirdocs() {
    this.props.adminStore.getDirdocs().then(docs => this.setState({docs}))
  }

  onSwitchClick = async (id, value) => {
    let params = {id, active: value};
    await DirdocApi.switchActive(params);
    this.load()
  };

  canBeUpdated = (date) => {
    // TODO
    return true;
    return moment().diff(date, "hours") < 12 // 12 hours
  };

  onExitBuilder = reload => {
    this.reset();
    if (reload)
      this.load();
  };

  render() {
    const {t} = this.props;
    let {docs, showList, itemEdit} = this.state;

    return (
      <div className="animated fadeIn">
        {showList &&
        <Card>
          <CardHeader>
            <Row className="mt-2">
              <AppButton className={"mx-2"} onClick={() => this.setState({showList: false})}>Создать</AppButton>
              <AppButton className={"mx-2"} onClick={() => this.props.adminStore.getDirdocs()}> Обновить</AppButton>
            </Row>
          </CardHeader>
          <CardBody>
            <AppTable data={docs} columns={this.tableColumns} showRowNumbers/>
          </CardBody>
        </Card>}
        {!showList &&
        <Card>
          <CardHeader>
            <h5>Создание/редактирование</h5>
          </CardHeader>
          <CardBody>
            <DirdocBuilder item={itemEdit} onExit={this.onExitBuilder}/>
          </CardBody>
        </Card>}
      </div>
    )
  }
}
class DirdocBuilder extends Component {
  state = {
    _id: undefined,
    title_ru: '',
    title_kg: '',
    title_en: '',
    description_ru: EditorState.createEmpty(),
    description_kg: EditorState.createEmpty(),
    description_en: EditorState.createEmpty(),
    created_from: null,
    is_active: true,
    filename_ru: null,
    filename_kg: null,
    filename_en: null,
    // data: EditorState.createEmpty(),
  };

  componentDidMount() {
    if (this.props.item) {

      let {
        _id,
        title,
        title_kg,
        title_en,
        description,
        description_kg,
        description_en,
        created_from,
        is_active,
        // data,
      } = this.props.item;

      let state = {
        _id,
        title_ru: title,
        title_kg,
        title_en,
        description_ru: description    ? EditorState.createWithContent(convertFromRaw(description)) : EditorState.createEmpty(),
        description_kg: description_kg ? EditorState.createWithContent(convertFromRaw(description_kg)) : EditorState.createEmpty(),
        description_en: description_en ? EditorState.createWithContent(convertFromRaw(description_en)) : EditorState.createEmpty(),
        created_from: moment(created_from),
        is_active,
        // data: data ? EditorState.createWithContent(convertFromRaw(data)) : EditorState.createEmpty(),
      };

      this.setState(state)

    } else {
      this.setState({created_from: moment()})
    }
  }

  onTitleChange = (lang, value) => {
    this.setState({['title_' + lang]: value});
  };

  onDescChange = (lang, value) => {
    this.setState({['description_' + lang]: value});
  };

  onDateChange = created_from => {
    this.setState({created_from});
  };

  onClickSave = async () => {
    let {
      _id,
      title_ru,
      title_kg,
      title_en,
      description_ru,
      description_kg,
      description_en,
      created_from,
      is_active,
    } = this.state;

    let params = {
      _id,
      title: title_ru,
      title_kg,
      title_en,
      description: convertToRaw(description_ru.getCurrentContent()),
      description_kg: convertToRaw(description_kg.getCurrentContent()),
      description_en: convertToRaw(description_en.getCurrentContent()),
      created_from: formatDateTime(created_from, FORMAT_DATE_DB),
      is_active,
    };

    try {
      await DirdocApi.saveDirdoc(params);

      showSuccess("Документ сохранен");
      this.props.onExit(true);

    } catch (e) {
      showError(e && e.message || "Произошла ошибка");
    }
  };

  valid = () => {
    let {title_ru, title_kg, title_en} = this.state;
    return !!(title_ru && title_kg && title_en);
  };

  onClickBack = () => {
    this.props.onExit()
  };

  // handleFile = () => {
  //
  // };
  // handleFiles = (filename, previewName, file) => {
  //   let split = file.base64.split(",");
  //   this.setState({[previewName]: file.fileList[0].name});
  //   this.props.adminStore.uploadNewsFile({files: split[1]}).then(r => {
  //     this.setState({[filename]: r.file})
  //   })
  // };
  //
  // file => this.handleFiles("filename", "realName", file)

  render() {

    let {
      _id,
      title_ru,
      title_kg,
      title_en,
      description_ru,
      description_kg,
      description_en,
      created_from,
      filename_ru, // TODO: file uploads
      filename_kg,
      filename_en,
      // data,
    } = this.state;

    let {onTitleChange, onDescChange, onDateChange, onClickSave, onClickBack, handleFile, valid} = this;

    return (
      <div className="news-editor">
        <Col>
          <Row>
            <Fg l={"Дата"}>
              {/*{formatDateTime(created_from)}*/}
              <DatePicker showTimeSelect timeFormat="HH:mm" timeIntervals={15} timeCaption="Время"
                          dateFormat={FORMAT_DATE_TIME}
                          value={created_from}
                          onChange={onDateChange}/>
            </Fg>
          </Row>

          <Row>
            <h5>Документ (русский)</h5>
          </Row>

          <Row className="mt-2">
            <Input value={title_ru} placeholder="Наименование документа" onChange={e => onTitleChange('ru', e.target.value)}/>
          </Row>

          {/*<Row className="mt-2">
            data
            <Editor editorState={data}/>
          </Row>*/}

          <Row className="mt-2">
            <Editor
              editorState={description_ru}
              onChange={val => onDescChange('ru', val)}/>
          </Row>

          {/*<Row className="mt-2">
            <FileInput fileHandler={file => handleFile('ru', file)} btnLabel={"Выберите файл"} filename={filename_ru}/>
          </Row>*/}


          <Row className="mt-2">
            <h5>Документ (кыргызча)</h5>
          </Row>

          <Row className="mt-2">
            <Input value={title_kg} placeholder="Наименование документа" onChange={e => onTitleChange('kg', e.target.value)}/>
          </Row>

          <Row className="mt-2">
            <Editor
              editorState={description_kg}
              onChange={val => onDescChange('kg', val)}/>
          </Row>

          {/*<Row className="mt-2">
            <FileInput fileHandler={file => handleFile('kg', file)} btnLabel={"Выберите файл"} filename={filename_kg}/>
          </Row>*/}


          <Row className="mt-2">
            <h5>Документ (english)</h5>
          </Row>

          <Row className="mt-2">
            <Input value={title_en} placeholder="Наименование документа" onChange={e => onTitleChange('en', e.target.value)}/>
          </Row>

          <Row className="mt-2">
            <Editor
              editorState={description_en}
              onChange={val => onDescChange('en', val)}/>
          </Row>

          {/*<Row className="mt-2">
            <FileInput fileHandler={file => handleFile('en', file)} btnLabel={"Выберите файл"} filename={filename_en}/>
          </Row>*/}


          <Row className="mt-2">
            <AppButton color="danger" onClick={onClickBack}>Назад</AppButton>
            <AppButton className={"mx-2"} onClick={onClickSave} disabled={!valid()}>Сохранить</AppButton>
          </Row>
        </Col>
      </div>
    )
  }
}
