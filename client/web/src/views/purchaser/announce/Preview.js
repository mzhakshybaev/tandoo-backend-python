import React, {Component, Fragment} from 'react'
import {Alert, Col, Row} from "reactstrap";
import {Card, CardBody, CardHeader, Collapse} from "reactstrap";
import Button from "components/AppButton";
import Loading from 'components/Loading';
import {showError, showSuccess} from "utils/messages";
import AnnounceMainData from "components/announce/MainData";
import AnnounceLotsList from "components/announce/LotsList";
import AnnouncePayments from "components/announce/Payments";
import AppTable from "components/AppTable";
import {translate} from "react-i18next";
import momentbd from "moment-business-days";
import {storageRemove} from "utils/LocalStorage";
import announceApi from "../../../../../stores/api/AnnounceApi";

@translate(['common', 'settings', ''])
export default class AnnouncePreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      announce: null,
      company: null,
      activeTab: 'Quotation',
    };
  }

  componentDidMount() {
    let id = this.props.match.params.id;
    this.load(id);
  }

  async load(id) {
    let announce = await announceApi.get({id});

    if (announce.status !== 'Draft') {
      showError(this.props.t('Объявление не в статусе Черновик'));
      return
    }

    let error;
    let {t} = this.props;
    let deadline = momentbd(announce.deadline);
    let procurement = announce.dirprocurement;
    if (procurement) {
      let minDLDays = procurement.day_count;
      let minDLDate = momentbd().businessAdd(minDLDays);
      if (deadline.isBefore(minDLDate)) {
        error = t('Укажите Срок подачи не менее {{minDLDays}} рабочих дней', {minDLDays})
      }

    } else {
      error = t('Укажите метод закупок');
    }

    this.setState({
      announce,
      error,
      payments: {
        advanceEnabled: announce.data && announce.data.payments && announce.data.payments.advanceEnabled || false,
        shipmentEnabled: announce.data && announce.data.payments && announce.data.payments.shipmentEnabled || false,
        acceptEnabled: announce.data && announce.data.payments && announce.data.payments.acceptEnabled || false,
        advance: announce.data && announce.data.payments && announce.data.payments.advance || 0,
        shipment: announce.data && announce.data.payments && announce.data.payments.shipment || 0,
        accept: announce.data && announce.data.payments && announce.data.payments.accept || 0,
      }
    });
  }

  publish = async () => {
    let params = {
      advert: {
        _id: this.state.announce._id,
        // publish: true,
      }
    };

    await announceApi.publish(params);

    showSuccess('Успешно опубликовано');
    this.props.history.push('/purchaser/announce/listing');
  };

  canPublish = () => {
    const {announce, error} = this.state;
    return announce.dirprocurement && announce.deadline && !error;
  };

  handleClickBasket = async () => {
    await storageRemove('basketLot');

    this.props.history.push(`/purchaser/basket/${this.state.announce._id}`);
  };

  render() {
    const {t} = this.props;
    let {announce, error} = this.state;

    if (!announce) return <Loading/>;


    return (
      <Card>
        <CardBody>
          <h3 className="text-center">
            {t('Объявление')} {announce.code && `№ ${announce.code}`}
          </h3>

          <AnnounceMainData announce={announce}/>

          <AnnounceLotsList lots={announce.lots}/>

          <Row>
            <Col md={6}>
              <AnnouncePayments payments={announce.data && announce.data.payments}/>
            </Col>
          </Row>

          <Row>
            <Col>
              {error ?
                <Alert color="danger">{error}</Alert> :
                <Alert color="success">{t('Готово к публикации')}</Alert>
              }
              <Button className="m-2" to={`/purchaser/announce/draft`} color="secondary">{t('Назад')}</Button>

              {announce.status === 'Draft' &&
              <Fragment>
                <Button className="m-2" onClick={this.handleClickBasket}>
                  {t('Редактировать позиции')}
                </Button>
                <Button className="m-2" to={`/purchaser/announce/edit/${announce._id}`}>{t('Редактировать')}</Button>
              </Fragment>
              }

              {announce.status === 'Draft' &&
              <Button className="m-2" color="success" disabled={!this.canPublish()}
                      onClick={this.publish}>{t('Опубликовать')}</Button>}
            </Col>
          </Row>

          {/*{(announce.status === 'Evaluation' || announce.status === 'Results') &&
          <div>
            <div className="d-flex justify-content-center">
              <h3>{t('Доп. инфо')}</h3>
            </div>

            <Nav tabs>
              <NavItem>
                <NavLink active={this.state.activeTab === 'Quotation'}
                         onClick={() => this.toggleTab('Quotation')}>
                  {t('Котировка цен')}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink active={this.state.activeTab === 'Draft'}
                         onClick={() => this.toggleTab('Draft')}>
                  {t('История')}
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId="Quotation">
                <Row>
                  <Col sm="12">
                    {this.state.activeTab === 'Quotation' && this.renderQuotation()}
                  </Col>
                </Row>
              </TabPane>

              <TabPane tabId="History">
                <Row>
                  <Col sm="12">
                    {this.state.activeTab === 'History' &&
                    <span>{t('History')}</span>}
                  </Col>
                </Row>
              </TabPane>

            </TabContent>
          </div>
          }*/}

        </CardBody>
      </Card>
    )
  }

  renderQuotation() {
    const {t} = this.props;
    let {announce} = this.state;

    const columns = [
      {Header: t('Наименование поставщика'), accessor: 'company'},
      {Header: t('Марка'), accessor: 'brand'},
      {Header: t('Страна производитель'), accessor: 'country'},
      {
        Header: t('Цена за ед.', {
          keySeparator: '>',
          nsSeparator: '|',
        }), accessor: 'unit_price'
      },
      {Header: t('Общая цена'), accessor: 'total'}
    ];

    return (
      <div>
        {announce && announce.lots && announce.lots.map((lot, i) => (
          <Card className="mt-4" key={lot._id}>
            {lot.status === 'Canceled' ? (
              <CardHeader key={i} className={'spurs'}>
                <span>{t('Отмененная')}</span>
              </CardHeader>
            ) : (
              <div>
                <CardHeader className={'spurs'}>
                  <div>
                    <div className="card-actions">
                      <Button color="secondary" className="btn-sm mr-1"
                              onClick={() => this.setState({["collapse" + (i + 1)]: !this.state["collapse" + (i + 1)]})}>
                        <i className="fa fa-plus"/>
                      </Button>
                    </div>

                    <span>{t('Позиция')}{i + 1}-[{lot.dircategory[0].name}],[{lot.quantity}]</span>
                    <span>{t('Планируемая сумма')} [{lot.lot_budget}] </span>
                    <span>{t('Предложений')} - [{lot.applications.length}]</span>

                  </div>

                </CardHeader>
                <CardBody>
                  <Collapse isOpen={this.state["collapse" + (i + 1)]}>
                    <div>
                      <AppTable
                        data={lot.applications}
                        columns={columns}
                        defaultPageSize={4}
                        showPagination={false}
                        showRowNumbers={true}
                        filterable={false}
                      />
                    </div>
                  </Collapse>
                </CardBody>
              </div>)}
          </Card>
        ))}

        <Row className={'ml-1'}>
          <Button className="m-2">{t('Скачать')}</Button>
          <Button className="m-2" to={`/purchaser/announce/evaluate/${announce._id}`}>{t('Провести оценку')}</Button>
        </Row>
      </div>
    )
  }
}
