import React, {Component} from 'react';
import {Alert, Card, CardBody, CardHeader, Col, Collapse, FormGroup, Row} from "reactstrap";
import {translate} from "react-i18next";
import {showError, showSuccess} from 'utils/messages';
import Table from "components/AppTable";
import Button from "components/AppButton";
import Input from "components/AppInput";
import Switcher from "components/Switcher";
import Loading from "components/Loading";
import AnnounceMainData from "components/announce/MainData";
import AnnounceLotsDetail from "components/announce/LotsDetail";
import announceApi from 'stores/api/AnnounceApi';
import {formatDateTime, formatMoney} from "utils/helpers";
import {action, observable, runInAction, toJS} from "mobx";
import {inject, observer} from "mobx-react";
import ReactTable from "react-table";

@translate(['common', 'settings', '']) @inject('mainStore') @observer
export default class Evaluation extends Component {
  @observable ready = false;
  @observable announce;

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.load();
  }

  async load() {
    let id = this.props.match.params.id;

    this.ready = false;
    let announce = await announceApi.get({id});

    // prepare
    announce.lots.forEach(lot => {
      if (lot.status === 'Canceled' || !lot.applications.length)
        return; // skip

      Object.assign(lot, {
        changed: false,
        saved: false,
      });

      // default values
      lot.applications.forEach(app => Object.assign(app, {
        showSwitch: false,
        reasonError: null,
      }));

      let selectedIdx = lot.applications.findIndex({selected: true});
      if (selectedIdx !== -1) {
        lot.saved = true;

      } else {
        // not saved, find automatically
        selectedIdx = lot.applications.findIndex({reason: null});
        let selectedApp = lot.applications[selectedIdx];
        selectedApp.selected = true;
      }

      // set switchers visibility
      if (selectedIdx !== -1) {
        // show prev and current switchers
        lot.applications.forEach((app, i) => {
          app.showSwitch = (i <= selectedIdx)
        })

      } else {
        // not found, show all switchers
        lot.applications.forEach((app, i) => {
          app.showSwitch = true
        });
      }

    });

    runInAction(() => {
      Object.assign(this, {
        announce,
        ready: true,
      });
    })
  }

  cancelLot(lotId) {
    if (this.state["lotInput" + lotId]) {

      if (!this.state["lotReason" + lotId]) {
        showError('?????????????? ?????????????? ????????????');
        return;
      }

      let params = {
        lot_id: lotId,
        announce_id: this.announce._id,
        reason: this.state["lotReason" + lotId],
      };
      G
      announceApi.updateLot(params).then(r => {
        this.loadData();
      });
    } else {
      this.setState({["lotInput" + lotId]: true})
    }
  }

  cancel = () => {
    if (this.state.displayReason) {
      if (!this.state.reason) {
        showError('?????????????? ?????????????? ????????????');
        return;
      }

      let params = {
        id: this.announce._id,
        reason: this.state.reason,
      };

      announceApi.update(params).then(r => {
        this.props.history.push("/purchaser/announce/listing");
      });
    } else {
      this.setState({displayReason: true});
    }
  };

  @action.bound
  changeSelected(lotId, appId, checked) {
    let lot = this.announce.lots.findById(lotId);
    let apps = lot.applications;
    let appIdx = apps.findIndexById(appId);
    let app = apps[appIdx];

    if (checked === app.selected)
      return;

    let selectedIdx = apps.findIndex('selected');
    let selectedApp = apps[selectedIdx];

    if (selectedApp === app && !checked) {
      // unselect
      selectedApp.selected = false;
      selectedApp.reason = '';
      selectedApp.reasonError = null;

      if (selectedIdx < apps.length - 1) {
        // select next
        let nextApp = apps[selectedIdx + 1];

        nextApp.reason = null;
        nextApp.reasonError = null;
        nextApp.selected = true;
        nextApp.showSwitch = true;
      }

    } else if (selectedApp !== app && checked) {
      // select
      let nextApp = app;
      let nextAppIdx = appIdx;

      apps.forEach((app, idx) => {
        app.selected = (app === nextApp);

        app.showSwitch = (idx <= nextAppIdx);

        if (idx >= nextAppIdx) {
          app.reason = null;
          nextApp.reasonError = null;
        }
      });

    } else {
      // how did we get here?
      debugger
    }

    lot.changed = true;
  }

  @action.bound
  changeReason(lotId, appId, reason) {
    let lot = this.announce.lots.findById(lotId);
    let apps = lot.applications;
    let appIdx = apps.findIndexById(appId);
    let app = apps[appIdx];

    app.reason = reason;
    app.reasonError = !reason;

    lot.changed = true;
  }

  canSaveLot = lot => {
    return (!lot.saved || lot.changed) && lot.applications.every(lot => lot.reason !== '');
  };

  canSaveAllLots = () => {
    return this.announce.lots.some(this.canSaveLot)
  };

  canPublish = () => {
    return this.announce.lots.every(lot => {
      return lot.saved && !lot.changed;
    })
  };

  saveLot = async lot => {
    let params = {
      announce_id: this.announce._id,
      lots: [{
        _id: lot._id,
        applications: lot.applications.map(app => ({
          _id: app._id,
          selected: app.selected,
          reason: app.reason
        })),
      }]
    };

    await announceApi.updateApps(params);

    showSuccess(this.props.t('?????????????? ??????????????????'));

    runInAction(() => {
      lot.changed = false;
      lot.saved = true;
    });
  };

  saveAllLots = async () => {
    let {t} = this.props;

    let saveLots = this.announce.lots.filter(this.canSaveLot);

    let params = {
      announce_id: this.announce._id,
      lots: saveLots.map(lot => ({
        _id: lot._id,
        applications: lot.applications.map(app => ({
          _id: app._id,
          selected: app.selected,
          reason: app.reason
        })),
      }))
    };

    await announceApi.updateApps(params);

    showSuccess(t('?????????????? ??????????????????'));

    runInAction(() => {
      saveLots.forEach(lot => {
        lot.changed = false;
        lot.saved = true;
      });
    });
  };

  publish = () => {
    let id = this.announce._id;

    let params = {id};

    announceApi.update(params).then(r => {
      this.props.history.push(`/announce/view/${id}`);
    });
  };

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

    if (!this.ready)
      return <Loading/>;

    const {t} = this.props;
    let {
      announce, changeSelected, changeReason, canSaveLot, canSaveAllLots, canPublish, saveLot, saveAllLots,
      publish, cancelLot, cancel
    } = this;

    let changed = announce.lots.some('changed');

    const columns = [
      {accessor: '_id', show: false},
      {accessor: 'lot_id', show: false},
      {Header: t('???????????????????????? ????????????????????'), accessor: 'company'},
      {Header: t('???????? ????????????'), accessor: '_created', Cell: ({value}) => formatDateTime(value)},
      {Header: t('??????????'), accessor: 'brand'},
      {Header: t('???????????? ??????????????????????????'), accessor: 'country'},
      {
        Header: t('???????? ???? ????.', {
          keySeparator: '>',
          nsSeparator: '|',
        }), accessor: 'unit_price', Cell: ({value}) => formatMoney(value)
      },
      {Header: t('?????????? ????????'), accessor: 'total', Cell: ({value}) => formatMoney(value)},
    ];

    if (announce.dirprocurement.with_concession) {
      columns.push(
        {Header: t('?????????? ???????? ?? ???????????? ????????????'), accessor: 'total_concession', Cell: ({value}) => formatMoney(value)},
      )
    }

    columns.push(
      {
        Header: t('??????????/????????????????'),
        accessor: 'selected',
        Cell: ({value, row, original}) => {
          if (!original.showSwitch)
            return null;

          return (
            <div className="text-center">
              <Switcher checked={value} onChange={checked => changeSelected(row.lot_id, row._id, checked)}/>
            </div>
          )
        }
      },
      {
        Header: t('?????????????? ????????????'),
        accessor: 'reason',
        Cell: ({value, row, original}) => {
          if (value === null)
            return null;

          return (
            <div>
              <FormGroup>
                <Input invalid={original.reasonError}
                       placeholder={t('?????????????? ????????????')}
                       autoFocus
                       value={value}
                       onChange={e => changeReason(row.lot_id, row._id, e.target.value)}
                       onBlur={e => changeReason(row.lot_id, row._id, e.target.value)}/>
              </FormGroup>
            </div>
          )
        }
      }
    );

    return (
      <div>
        <Card>
          <CardBody>
            <h3 className="text-center">{t('???????????? ??????????????????????')}</h3>

            <Row className="mb-2">
              <Col>
                {announce && <AnnounceMainData announce={announce}/>}
              </Col>
            </Row>

            <Row className="mb-2">
              <Col>
                <h4>{t('?????????? ????????????????????, ?????? ???????????????????? ????????????????')}</h4>

                {announce && announce.lots && announce.lots.map((lot, i) => (
                  <Card key={i}>
                    {lot.status === 'Canceled' ? (
                      <CardHeader className="text-center">
                        <span>{t('???? ????????????????????')}</span>
                      </CardHeader>
                    ) : ([
                      <CardHeader className="text-center" key={0}>
                        <Button className="mr-1"
                                size="sm"
                                color="default"
                                onClick={() =>
                                  this.setState({["collapse" + (i + 1)]: !this.state["collapse" + (i + 1)]})
                                }
                        >
                          {this.state["collapse" + (i + 1)] ?
                            <i className="fa fa-minus" title={t('????????????????')}/> :
                            <i className="fa fa-plus" title={t('????????????????????')}/>
                          }
                        </Button>

                        <span>{t('??????????????')} {i + 1} - [{lot.dircategory[0][label]}], [{lot.quantity}] </span>
                        <span>{t('?????????????????????? ??????????')} [{formatMoney(lot.budget)}] </span>
                        <span>{t('??????????????????????')} - [{lot.applications.length}]</span>

                      </CardHeader>,
                      <CardBody key={1}>
                        <Collapse isOpen={this.state["collapse" + (i + 1)]}>
                          <div>
                            <Table
                              data={toJS(lot.applications)}
                              columns={columns}
                              sortable={false}
                              defaultPageSize={4}
                              showPagination={false}
                              showRowNumbers={true}
                              filterable={false}
                            />

                            <Row className="ml-1 mt-2">
                              <Button className="mr-2" onClick={() => saveLot(lot)} disabled={!canSaveLot(lot)}>
                                {t('??????????????????')}
                              </Button>

                              <Button className="mr-2" color="warning" onClick={() => this.load()}
                                      disabled={!lot.changed}>
                                {t('???????????????? ??????????????????')}
                              </Button>

                              <Button className="mr-2" color="danger" onClick={() => cancelLot(lot)}>
                                {t('???????????????? ??????????????')}
                              </Button>

                              {this.state["lotInput" + lot._id] &&
                              <Input className="w-25"
                                     placeholder={t('?????????????? ???????????? ??????????????')}
                                     autoFocus
                                     value={this.state["lotReason" + lot._id]}
                                     onChange={e => this.setState({["lotReason" + lot._id]: e.target.value})}
                              />
                              }
                            </Row>
                          </div>
                        </Collapse>
                      </CardBody>
                    ])}
                  </Card>
                ))}
              </Col>
            </Row>

            {announce && announce.data && announce.data.comm_members_txt && announce.data.comm_members_txt.length > 0 &&
            <Row className="mb-2">
              <Col>
                <h4>{t('?????????????????? ????????????????')}</h4>

                <ReactTable data={announce.data.comm_members_txt} filterable={false} sortable={false}
                            pageSize={announce.data.comm_members_txt.length} showPagination={false}
                            columns={[{
                              Header: '???',
                              Cell: ({index}) => index + 1,
                              width: 30
                            }, {
                              Header: '????????????????????????',
                              accessor: 'chairman',
                              width: 110,
                              Cell: ({value}) =>
                                value && <i className="fa fa-check text-success"/>,
                            }, {
                              Header: '??????',
                              accessor: 'inn'
                            }, {
                              Header: '??????',
                              accessor: 'fullname'
                            }, {
                              Header: '?????????? ????????????',
                              accessor: 'org'
                            }, {
                              Header: '??????????????????',
                              accessor: 'position'
                            }]}/>
              </Col>
            </Row>
            }

            <Row>
              <Col>

                {canPublish() ?
                  <Alert color="success">
                    {t('???????????? ?? ???????????????????? ??????????????????????')}
                  </Alert>
                  :
                  <Alert color="danger">
                    {t('?????????????? ?????????????????? ?????? ?????????????? ?????? ???????????????? ??????????????????')}
                  </Alert>
                }

                <Button className="mr-2" to={`/announce/view/${announce._id}`} color="secondary">{t('??????????')}</Button>

                <Button className="mr-2" onClick={saveAllLots} disabled={!canSaveAllLots()}>
                  {t('?????????????????? ??????')}
                </Button>

                <Button className="mr-2" onClick={publish} disabled={!canPublish()}>
                  {t('???????????????????????? ??????????')}
                </Button>

                <Button className="mr-2" color="warning" onClick={() => this.load()} disabled={!changed}>
                  {t('???????????????? ??????????????????')}
                </Button>

                <Button className="mr-2" color="danger" onClick={() => cancel()}>
                  {t('???????????????? ??????????')}
                </Button>

                {this.state.displayReason &&
                <Input className="w-25"
                       placeholder={t('?????????????? ???????????? ????????????????????')}
                       autoFocus
                       value={this.state.reason}
                       onChange={e => this.setState({reason: e.target.value})}/>
                }
              </Col>
            </Row>

          </CardBody>
        </Card>
      </div>
    )
  }
}
