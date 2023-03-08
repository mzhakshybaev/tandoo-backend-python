import React, {Component} from 'react';
import {Card, Col, Row, TabContent, TabPane} from "reactstrap";
import Button from 'components/AppButton';
import Loading from 'components/Loading';
import {inject} from 'mobx-react';
import {formatDate, formatMoney, addressToString, checkCompanyDocs} from "utils/helpers";
import DebtData from "components/supplier/DebtData";
import SupAppTabs from 'components/supplier/AppTabs'
import {showError} from "utils/messages";
import {action, observable, runInAction, computed} from "mobx";
import {observer} from "mobx-react";
import DatePicker from "components/DatePicker";
import {FORMAT_DATE, FORMAT_DATE_DB} from "utils/common";
import momentbd from "moment-business-days";
import {flatten} from 'lodash-es';
import {translate} from "react-i18next";
import announceApi from "stores/api/AnnounceApi";
import renderHTML from 'react-render-html';


@translate(['common', 'settings', ''])
@inject('authStore', 'supplierStore', 'adminStore', 'mainStore') @observer
class Oferta extends Component {
  @observable ready = false;
  @observable hasDebt = false;
  @observable announce;
  @observable docs;
  @observable totalSum;
  @observable deadline;
  @observable signed;
  @observable doc;
  @observable checkedDocs;

  componentDidMount() {
    this.load().then(() => {
      this.ready = true;
    });
  }

  componentWillUnmount() {
    this.reset();
  }

  @action
  reset() {
    Object.assign(this, {
      ready: false,
      hasDebt: false,
      checkedDocs: false,
      announce: null,
      docs: null,
      doc: null,
      totalSum: null,
      deadline: null,
      signed: null,
    });
  }

  async load() {
    let {company} = this.props.authStore;
    let ann_id = this.props.match.params.ann_id;
    let code = 'Declaration';

    let [announce, announce_app, doc] = await Promise.all([
      announceApi.get({id: ann_id}),
      // this.props.supplierStore.getLastDocs({company_id: company._id}),
      this.props.supplierStore.getAnnounceAppInfo({advert_id: ann_id}),
      this.props.adminStore.getDirdoc({filter: {code}})
    ]);

    // TODO: get apps:
    // this.props.supplierStore.getApplications({advert_id: ann_id, company_id: company._id})


    if (!announce_app || !announce_app.advert_lots || !announce_app.advert_lots.length) {
      showError('Не найдены подходящие продукты');
      throw 'No lots';
    }

    let lots = announce_app.advert_lots;

    let deadline, signed = false;
    if (lots[0].applications && lots[0].applications.length) {
      deadline = lots[0].applications[0].deadline;
      signed = !!lots[0].applications[0].signed;
    }
    deadline = deadline ? momentbd(deadline) : momentbd();
    deadline.hours(0).minutes(0).seconds(0); // reset time to 0:00:00

    // calc total
    let totalSum = 0;
    lots.forEach(lot => {
      let lot_apps = lot.applications || [];

      lot_apps.forEach(app => {
        totalSum += app.total;
      });
    });

    runInAction(() => {
      Object.assign(this, {
        announce,
        lots,
        doc,
        totalSum,
        deadline,
        signed,
      });

      this.announce.deadline = momentbd(announce.deadline).hours(0).minutes(0).seconds(0);
    });

  }

  @action
  setDateDeadline = val => {
    this.deadline = val;
  };

  @action
  setSigned = val => {
    this.signed = val;
  };

  @computed
  get canSubmit() {
    return !this.hasDebt;

    // return !!(this.signed && this.dateValid && checkCompanyDocs(this.docs))
  }

  @computed
  get dateValid() {
    return this.announce.deadline && this.deadline && (this.deadline.diff(this.announce.deadline, "days") >= 0)
  }

  handleSubmit = async () => {
    let {announce} = this;
    try {
      if (this.checkedDocs) {
        if (!this.hasDebt) {
          await this.saveApps();
          this.props.history.push(`/supplier/proposal/submit/${announce._id}`);
        }
      } else {
        let params = {
          advert_id: announce._id,
          limit: 2
        }
        let docs = await this.props.supplierStore.sendRequest(params);
        this.docs = docs;
        this.checkedDocs = true;
        // this.hasDebt = docs[0].debt || docs[1].debt;
        this.hasDebt = false;
      }
    } catch (e) {
      console.warn(e);
      showError(e && e.message || 'Произошла ошибка');
    }
  };

  async saveApps() {
    let appsProms = this.lots.map(lot => {
      let lot_apps = lot.applications || [];

      return lot_apps.map(app => {
        let params = {
          ...app,
          deadline: formatDate(this.deadline, FORMAT_DATE_DB),
          signed: this.signed
        };

        return this.props.supplierStore.saveApplication(params)
      });
    });

    appsProms = flatten(appsProms);

    await Promise.all(appsProms);
  }

  render() {
    if (!this.ready) return <Loading/>;

    let {authStore, t, mainStore} = this.props;
    let {company} = authStore;
    let {announce, docs, totalSum, deadline, signed, handleSubmit, setDateDeadline, setSigned, canSubmit, dateValid, doc} = this;
    let today = Date.now();
    const {language} = mainStore;

    let label = 'description';
    if (language && language.code === 'en') {
      label = 'description_en';
    }
    if (language && language.code === 'kg') {
      label = 'description_kg';
    }

    let label_name = 'title';
    if (language && language.code === 'en') {
      label_name = 'title_en';
    }
    if (language && language.code === 'kg') {
      label_name = 'title_kg';
    }
    return (
      <div>
        <SupAppTabs/>

        <TabContent>
          <TabPane>
            <Row>
              <Col>
                <h3 className="text-center">{t('Коммерческое предложение')}</h3>
              </Col>
            </Row>

            <Row className="d-flex align-items-center">
              <Col>
                <p className="d-flex ">
                  {t('Кому')}: {announce.company.name}, {t('адрес')}: {announce.company.data ? addressToString(announce.company.data.address) : ''}
                </p>
                <p>{t('Изучив объявление размещенное в Каталоге под №')} {announce.code}</p>
                <p>{company.name} {t('предлагает осуществить поставку товара и сопутствующих услуг на общую')}
                  {t('сумму')} {formatMoney(totalSum)} {t('по нижеследующей Таблице')}</p>
                <p>{t('В стоимость товара включены все налоги и пошлины изымаемые на територии Кыргызской Республики')}</p>
                <div className="mb-4">
                  {t('Данное Коммерческое предложение действительно до')}

                  {!signed ?
                    <span className="d-inline-block mx-2" style={{width: 100}}>
                      <DatePicker
                        className='form-control'
                        dateFormat={FORMAT_DATE}
                        value={deadline}
                        placeholder={t('Дата')}
                        onChange={setDateDeadline}
                        minDate={announce.deadline}
                        filterDate={date => date.isBusinessDay()}
                      />
                    </span> :
                    ' ' + formatDate(deadline) + ' '
                  }

                  {t('начиная со срока окончания подачи заявки,')}
                  {t('и оно будет оставаться обязательным до истечении указанного срока')}
                </div>
              </Col>
            </Row>
            <Row className="d-flex align-items-center">
              <Col>
                <h3 className="text-center">{doc[label_name]}</h3>
                <p>{t('от')} {company.name}</p>
                <div>
                  {renderHTML(doc[label])}
                </div>
              </Col>
            </Row>
            <Row>
              {!signed &&
              <Col className="text-center mb-2">
                <Button color="info" onClick={() => setSigned(true)} disabled={!dateValid}>{t('Подписать')}</Button>
              </Col>}

              {signed &&
              <Col className="text-right mb-2">
                <p>{company.name}</p>
                <p>{t('Дата подачи')}: {formatDate(today)}</p>
              </Col>}
            </Row>
            {docs &&
            <Row>
              <Col>
                <DebtData docs={docs} showPagination={false}/>
              </Col>
            </Row>
            }
            <Row>
              <Col>
                <Button to={`/supplier/proposal/edit/${announce._id}`} className="mr-2"
                        color="secondary">{t('Назад')}</Button>
                <Button onClick={handleSubmit} disabled={!canSubmit}>{t('Подать предложение')}</Button>
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </div>
    )
  }
}

export default Oferta;
