import React, {Component, Fragment} from "react";
import {Card, Col} from "reactstrap";
import {inject, observer} from "mobx-react";
import Editor from 'components/Editor';
import Button from "components/AppButton";
import Spinner from "components/Loading";
import {convertFromRaw, EditorState} from "draft-js";
import {formatDateTime} from "utils/helpers";
import {showError} from "utils/messages";
import newsApi from "stores/api/NewsApi";
import moment from "moment";
import {translate} from "react-i18next";

@translate(['common', 'settings', '']) @inject("newsCtrl", 'mainStore') @observer
export default class View extends Component {

  state = {
    ready: false,
    title: null,
    description: null,
    date: null,
  };

  componentDidMount() {
    this.load();
  }

  componentDidUpdate() {
    let lang = this.props.mainStore.language.code;

    if (this.lang !== lang) {
      this.setItem(this.item, lang)
    }
  }

  async load() {
    let {id} = this.props.match.params;

    if (id) {
      try {
        let item = await newsApi.getNews(id);
        this.setItem(item)

      } catch (e) {
        showError(e && e.message || 'Не удалось загрузить')
      }
    }
  }

  setItem(item, lang = this.props.mainStore.language.code) {
    this.item = item;
    this.lang = lang;

    if (!item)
      return;

    let lp = (lang === 'ru') ? '' : ('_' + lang);

    let title = item['title' + lp];
    let description = item['description' + lp];
    description = description ? EditorState.createWithContent(convertFromRaw(description)) : EditorState.createEmpty();

    this.setState({
      ready: true,
      title,
      description,
      date: formatDateTime(moment(item.created_from)),
    });
  }

  render() {
    let {ready, title, description, date} = this.state;
    const {t} = this.props;
    if (!ready) return <Spinner/>;

    return (
      <Col className="w-100 d-flex justify-content-center">
        <Card body className="col-md-10 d-flex justify-content-center">

          <div className={"d-flex justify-content-between"}>
            <h5 className={"text-center"}>{title}</h5>
            <h6 className="text-muted">{date}</h6>
          </div>
          <Editor
            readOnly
            editorState={description}
            onChange={_ => {}}/>

          <div><Button onClick={() => this.props.history.goBack()}>{t('Назад')}</Button></div>
        </Card>
      </Col>
    );
  }
}
