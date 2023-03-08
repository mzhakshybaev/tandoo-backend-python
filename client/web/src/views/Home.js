import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import {Col, Container, Row, Table} from "reactstrap";
import NewsList from "./news/List"
import {formatDate} from "utils/helpers";
import {translate} from "react-i18next";
import {Link} from "react-router-dom";
import Img from "components/Image";

@translate(['common', 'settings', ''])
@inject('supplierStore', 'dictStore') @observer
export default class Home extends Component {
  state = {
    currency: [],
    info: [],
    now: null
  };

  componentDidMount() {
    this.props.supplierStore.getCurrency(new Date()).then(r => {
      this.setState({currency: r.results});
    });
    this.props.dictStore.getDictData("ESP").then(r => {
        this.setState({info: r});
      }
    )
  }

  render() {
    const {t} = this.props;
    const {info} = this.state;

    return (
      <div>
        {/*<Jumbotron id="jumbo">*/}
        {/*  <p className="lead text-center">*/}
        {/*    <Button color="danger" className="mr-4 btn-lg" to="/purchaser/catalog">*/}
        {/*      {t('Смотреть каталог')}*/}
        {/*    </Button>*/}
        {/*    <Button color="primary" className="btn-lg" size="lg" to="/announcements">*/}
        {/*      {t('Объявления')}*/}
        {/*    </Button>*/}
        {/*  </p>*/}
        {/*</Jumbotron>*/}


        <Container>
          <Row>
            <Col>
              <div id="jumbo-intro">
                <h2>
                  {t('Добро пожаловать в электронный каталог товаров.')}
                </h2>
              </div>
            </Col>
          </Row>
        </Container>

        {/*<Row>
          <Col md={{size: 8, offset: 2}}>
            <h3 className="text-center text-welcome">
              {t('HomePageWelcome')}
            </h3>
          </Col>
        </Row>*/}

        <Container style1={{background: 'white'}}>
          {false &&
          <Row>
            <Col>
              <h3>{t('Новости')}</h3>
              <NewsList/>
            </Col>
          </Row>
          }
          <Row>
            <Col md={6}>
              <h3>{t('Курсы валют')}</h3>
              <Table hover bordered style={{background: 'white'}}>
                <thead>
                <tr>
                  <th colSpan={2}> {t('Официальные курсы валют НБ КР на {{0}}', [formatDate()])}</th>
                </tr>
                </thead>
                <tbody>
                {this.state.currency.map(c =>
                  <tr key={c.currency}>
                    <td className="text-center"><b>{c.currency}</b></td>
                    <td className="text-center">{c.value}</td>
                  </tr>
                )}
                </tbody>
              </Table>
            </Col>

            <Col md={6}>
              <h3>{t('Получение ЭЦП')}</h3>

              <Table hover bordered style={{background: 'white'}}>
                <thead>
                <tr>
                  <th colSpan={2}> {t('Информация для получения ЭП (ЭЦП)')}</th>
                </tr>
                </thead>
                <tbody>
                {info.map((r,i) =>
                  <tr key={i}>
                    <th onClick={() => this.props.history.push()}>
                      {r.name}
                    </th>
                    <td>
                      <Link to={`/info/${r._id}`} title={t('Контактная информация')}>
                        <Img src="/img/call.svg" className="icon-call" alt="call"/>
                      </Link>
                    </td>
                  </tr>
                )}
                </tbody>
              </Table>
            </Col>
          </Row>

        </Container>

      </div>
    )

  }
}
