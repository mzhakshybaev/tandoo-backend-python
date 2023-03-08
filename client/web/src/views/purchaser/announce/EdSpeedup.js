import React, {Component} from 'react';
import {Card, CardBody, Col, FormText, Row} from "reactstrap";
import {Link, withRouter} from 'react-router-dom';
import {inject, observer} from "mobx-react";
import Loading from 'components/Loading';
import AnnounceMainData from "components/announce/MainData";
import moment from "moment";
import {translate} from "react-i18next";
import DatePicker from "components/DatePicker";
import {FORMAT_DATE_TIME, FORMAT_DATE_DB, FORMAT_DATE} from "utils/common";
import {FGI} from "../../../components/AppInput";
import {formatDate} from "../../../../../utils/helpers";
import announceApi from "../../../../../stores/api/AnnounceApi";

@translate(['common', 'settings', '']) @withRouter @inject('announceViewCtrl', 'mainStore') @observer
export default class EdSpeedup extends Component {
  state = {
    visable: true,
    deadline: moment().add("minutes", 5)
  };

  componentDidMount() {
    this.load(this.props.match.params.id);
  }

  load(id) {
    this.id = id;
    this.props.announceViewCtrl.reset();
    this.props.announceViewCtrl.load(id);
  }

  componentWillUnmount() {
    this.id = null;
    this.props.announceViewCtrl.reset();
  }

  componentDidUpdate() {
    let {id} = this.props.match.params;

    if (this.id !== id) {
      this.load(id)
    }
  }

  async saveDeadline() {
    let {id} = this.props.match.params;
    let params = {
      advert: {
        _id: id,
        deadline: formatDate(this.state.deadline, FORMAT_DATE_DB),
      }
    };
    await announceApi.update_deadline(params);
    // this.setState({created_from});
    this.props.history.push('/purchaser/announce/listing');
    console.log(this.state.deadline.format(FORMAT_DATE_TIME));
  }

  render() {
    let ctrl = this.props.announceViewCtrl;
    let {ready} = ctrl;

    if (!ready) return <Loading/>;

    const {t} = this.props;
    const {deadline} = this.state;
    let {announce} = ctrl;


    return (
      <div>
        <Card>
          <CardBody>
            <h3 className="text-center">{t('Просмотр Объявления')}</h3>

            <AnnounceMainData announce={announce}/>

            <Row className="mb-2">
              <Col>
                <FGI l={t('Изменить срок подачи заявок')} lf="5" ls="7">
                  <DatePicker showTimeSelect
                              timeFormat="HH:mm"
                              timeIntervals={1}
                              timeCaption={t("Время")}
                              dateFormat={FORMAT_DATE_TIME}
                              value={deadline}
                              placeholder={t('Дата, время')}
                              onChange={date => this.setState({deadline: date})}

                  />
                </FGI>

              </Col>
              <Col>
                <button onClick={() => this.saveDeadline()}>
                  Ускорить
                </button>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    )
  }
}
