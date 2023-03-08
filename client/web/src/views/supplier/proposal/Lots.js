import React, {Component} from 'react';
import {Col, Row, TabContent, TabPane} from "reactstrap";
import Button from "components/AppButton";
import {withRouter} from 'react-router-dom';
import {inject, observer} from "mobx-react";
import Loading from 'components/Loading';
import AnnounceMainData from 'components/announce/MainData';
import AnnounceLotsList from 'components/announce/LotsList';
import SupAppTabs from 'components/supplier/AppTabs';
import moment from 'moment';
import {storageGet, storageSave} from 'utils/LocalStorage';
import announceApi from "stores/api/AnnounceApi";
import {translate} from "react-i18next";

@translate(['common', 'settings', ''])
@withRouter @inject('authStore', 'supplierStore') @observer
export default class AnnounceLots extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      tableMode: true,
      announce: null,
      announce_app: null,
      selectedLots: [],
    }
  }

  componentDidMount() {
    this.isSupplier = this.props.authStore.isSupplier;

    this.load().then(() =>
      this.setState({ready: true})
    );
  }

  async load() {
    const {ann_id} = this.props.match.params;


    let [announce, announce_app, selectedLots] = await Promise.all([
      announceApi.get({id: ann_id}),
      this.props.supplierStore.getAnnounceAppInfo({advert_id: ann_id}),
      storageGet('supSelectedLots'),
    ]);

    if (!(selectedLots && selectedLots instanceof Array))
      selectedLots = [];

    this.setState({
      announce,
      announce_app,
      selectedLots,
    });
  }

  selectLot = (id, checked) => {
    let selectedLots = [...this.state.selectedLots]; // clone

    if (checked) {
      selectedLots.push(id);
    } else {
      let i = selectedLots.indexOf(id);
      if (i !== -1) {
        selectedLots.splice(i, 1)
      }
    }

    this.setState({selectedLots});
  };

  selectAllLots = () => {
    let {announce, announce_app} = this.state;
    let app_lots = announce_app.advert_lots;

    let selectedLots = announce.lots
      .filter(({_id}) => {
        let app_lot = app_lots.findById(_id);

        return (app_lot && app_lot.products && app_lot.products.length > 0)
      })
      .map(l => l._id);

    this.setState({selectedLots})
  };

  canSubmit() {
    return this.state.selectedLots.length > 0;
  }

  submit = async () => {
    await storageSave('supSelectedLots', this.state.selectedLots);
    this.props.history.push(`/supplier/proposal/products/${this.state.announce._id}`);
  };

  render() {
    if (!this.state.ready) return <Loading/>;
    let {t} = this.props;
    let {announce, announce_app} = this.state;

    let isPublished = (announce.status === 'Published');
    let isPast = moment(announce.deadline).isBefore(moment());
    let isApplicable = isPublished /* && !isPast */ && this.isSupplier && announce_app.advert_lots && announce_app.advert_lots.length > 0;
    // debugger

    return (
      <div>
        <SupAppTabs/>

        <TabContent>
          <TabPane>
            <Row>
              <Col sm="12">

                <h3 className="text-center">{t('Выбор позиций из объявления')}</h3>

                <AnnounceMainData announce={announce}/>

                <AnnounceLotsList lots={announce.lots}
                                  app_lots={isApplicable && announce_app.advert_lots}
                                  selectable={isApplicable}
                                  selected={this.state.selectedLots}
                                  onSelect={this.selectLot}
                                  onToggleAll={this.selectAllLots}/>

                <Row className={'mt-2'}>
                  <Col>
                    <Button to={`/supplier/proposal/edit/${announce._id}`} color="secondary" className="mr-2">
                      {t('Назад')}
                    </Button>
                    <Button disabled={!this.canSubmit()} onClick={this.submit}>
                      {t('Выбор подходящего товара и таблица цен')}
                    </Button>
                  </Col>
                </Row>

              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </div>
    )
  }
}
