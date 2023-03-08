import React, {Component, Fragment} from "react";
import {inject, observer} from "mobx-react";
import {withRouter} from "react-router-dom";
import {Card} from "reactstrap";
import Spinner from "components/Loading";
import {formatDateTime, draftHtmlToText} from "utils/helpers";
import moment from "moment";


@inject("newsCtrl") @withRouter @observer
export default class NewsList extends Component {
  componentDidMount() {
    this.props.newsCtrl.load();
  }

  componentWillUnmount() {
    this.props.newsCtrl.reset();
  }

  render() {
    let {news, ready} = this.props.newsCtrl;

    if (!ready || !news) return <Spinner/>;

    return (
      <Fragment>
        {news.map(n =>
          <NewsItem key={n._id} item={n} onClick={() => this.props.history.push(`/news/${n._id}`)}/>
        )}
      </Fragment>
    )
  }
}


@inject('mainStore') @observer
class NewsItem extends Component {
  state = {
    title: '',
    description: '',
    date: '',
  };

  componentDidMount() {
    this.setItem(this.props.item);
  }

  componentDidUpdate() {
    let lang = this.props.mainStore.language.code;

    if (this.lang !== lang) {
      this.setItem(this.item, lang)
    }
  }

  setItem(item, lang = this.props.mainStore.language.code) {
    this.item = item;
    this.lang = lang;

    let lp = (lang === 'ru') ? '' : ('_' + lang);

    let title = item['title' + lp];
    let description = item['description' + lp];

    this.setState({
      title,
      description: draftHtmlToText(description),
      date: formatDateTime(moment(item.created_from)),
    });
  }

  render() {
    let {title, description, date} = this.state;
    let {onClick} = this.props;
    let lang = this.props.mainStore.language.code; // DO NOT REMOVE!!

    return (
      <Card className={"listItem"} body onClick={onClick}>
        <div className={"d-flex justify-content-between"}>
          <h5>{title}</h5>
          <h6 className="text-muted">{date}</h6>
        </div>
        <p className={"textEllipsis"}>{description}</p>
      </Card>
    )
  }
}
