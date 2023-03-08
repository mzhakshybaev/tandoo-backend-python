import React, {Component} from 'react';
import {inject} from "mobx-react";
import {translate} from "react-i18next";
import AppTable from "components/AppTable";
import AnnounceMainData from "components/announce/MainData";
import Loading from "components/Loading";
import {Card, CardBody, Col, Row} from "reactstrap";
import announceApi from "stores/api/AnnounceApi";

@translate(['common', 'settings', '']) @inject("purchaserStore", 'mainStore')
export default class Result extends Component {

  constructor(props) {
    super(props);
    this.state = {
      announce: null,
    };
  }

  componentDidMount() {
    this.load();
  }

  async load() {
    let id = this.props.match.params.id;
    let announce = await announceApi.get({id})

    this.setState({announce});
  }

  componentWillUnmount() {
    this.reset();
  }

  reset() {
    this.setState({announce: null});
  }

  render() {
    const {mainStore} = this.props;
    const {language} = mainStore;

    let label = 'name';
    if (language && language.code === 'en') {

      label = 'name_en';
    }
    if (language && language.code === 'kg') {
      label = 'name_kg';
    }


    let {announce} = this.state;

    if (!announce) return <Loading/>;

    const {t} = this.props;
    const columns = [
      {Header: t('Позиция'), Cell: row=>row.original.dircategory[0][label]},
      {Header: t('Наимен-е отобр-го поставщика'), accessor: 'company'},
      {Header: t('Цена позиции'), accessor: 'total'},
      // {Header: t('Причины отмены'), accessor: 'reason'},
      {Header: t('План-ая сумма'), accessor: 'budget'}
    ];

    return (
      <Card>
        <CardBody>
          <h3 className="text-center">{t('Итоги')}</h3>

          <AnnounceMainData announce={announce}/>

          {announce.lots &&
          <Row>
            <Col>
              <h4>{t('Выбранные поставщики')}</h4>
              <AppTable
                data={announce.lots}
                columns={columns}
                defaultPageSize={4}
                showPagination={false}
                showRowNumbers={true}
                filterable={false}
              />
            </Col>
          </Row>
          }
        </CardBody>
      </Card>
    )
  }
}
