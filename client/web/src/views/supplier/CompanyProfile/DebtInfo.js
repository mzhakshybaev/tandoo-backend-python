import React, {Component} from 'react'
import {Col, FormText, Row} from "reactstrap";
import ImageInput from "components/ImageInput";
import ReactTable from "react-table";
import Button from "components/AppButton";
import {inject, observer} from 'mobx-react'
import moment from 'moment';
import {IMAGES_URL} from "utils/common";
import {formatDate} from "utils/helpers";
import {showSuccess, showError} from "utils/messages";
import DatePicker from "components/DatePicker";
import {FGI} from "components/AppInput";
import Select from "components/Select";
import Img from 'components/Image';
import {translate} from "react-i18next";

@translate(['common', 'settings', ''])
@inject('supplierStore', 'mainStore', 'dictStore', 'authStore') @observer
class DebtInfo extends Component {
  state = {
    img: null,
    imgPreview: null,
    textDebtNumber: null,
    taxDebtDate: null,
    data: [],
    references: null,
    reference: null,
    show: false
  };

  componentDidMount() {
    this.props.dictStore.getDictData2({type: 'DirDocument'}).then(r => {
      this.setState({references: r});
    });

    this.getMyDebts();
  }

  async getMyDebts() {
    let data = await this.props.supplierStore.getMyDebt();
    this.setState({data});
  }

  handleFiles = (file) => {
    this.setState({
      img: file.base64.split(',')[1],
      imgPreview: file.base64,
    });
  };

  findRef = (refId) => {
    return this.state.references && this.state.references.find(r => r._id === refId)
  };

  cancelHandler = () => {
    this.setState({
      reference: null,
      img: null,
      imgPreview: null,
      taxDebtDate: null,
    })
  };

  canSubmit() {
    return !!(this.state.reference && this.state.img && this.state.taxDebtDate)
  }

  submitAllHandler = async () => {
    const state = this.state;
    let date_start = this.state.taxDebtDate.format('YYYY-MM-DD');
    let date_end = moment(this.state.taxDebtDate).add(29, 'day').format('YYYY-MM-DD'); // TODO: move to server!

    try {
      let {file} = await this.props.supplierStore.uploadImage(this.state.img);

      let debtInfo = {
        company_id: this.props.company._id,
        dirdocument_id: state.reference._id,
        file,
        date_start,
        date_end,
        data: {}
      };

      await this.props.supplierStore.saveMyDebt(debtInfo);

      showSuccess("Успешно сохранен");

      this.setState({
        img: null,
        imgPreview: null,
        taxDebtDate: null,
        reference: null,
      });

      this.getMyDebts();

    } catch (e) {
      showError(e && e.message || 'Ошибка');
      console.warn(e);
    }
  };

  render() {
    const {t} = this.props;
    const {mainStore} = this.props;
    let lang = mainStore.language.code;
    let name_key = (lang === 'ru') ? 'name' : ('name_' + lang);

    if (!this.state.references)
      return null;

    let cancel = null;
    if (this.state.reference || this.state.img || this.state.imgPreview || this.state.taxDebtDate) {
      cancel = (
        <Button color={"danger"} onClick={this.cancelHandler}>
          <i className="fa fa-remove"/> {t('Отменить')}
        </Button>
      )
    }

    const columns = [
      {
        Header: t('Наименование'),
        Cell: (row) => (
          <div className="text-center">
            {row.original.dirdocument_id && this.findRef(row.original.dirdocument_id)[name_key]}
          </div>
        ),
        accessor: 'dirdocument_id',
      },
      {
        Header: t('Изображение'),
        Cell: row => (
          <div className="text-center">
            <Img style={{maxWidth: 100, maxHeight: 60}} src={IMAGES_URL + row.original.file}/>
          </div>
        ),
        accessor: 'file',
      }, {
        Header: t('Дата выдачи'),
        Cell: row => (
          <div className="text-center">{formatDate(row.original.date_start)}</div>
        ),
        accessor: 'date_start',
      },
      {
        Header: t('Дата окончания'),
        Cell: row => (
          <div className="text-center">{formatDate(row.original.date_end)}</div>
        ),
        accessor: 'date_end',
      },
      {
        Header: t('Статус'),
        accessor: 'status',
        width: 60,
        Cell: row => {
          let date_end = moment(row.original.date_end, 'YYYY-MM-DD').endOf('day');
          let now = moment();
          let status;

          if (date_end.isBefore(now)) {
            status = <i className="fa fa-ban checkboxstatus" style={{color: "red"}} title={t('Истек')}/>
          } else {
            status = <i className="fa fa-check-circle checkboxstatus" style={{color: "green"}} title={t('Валидный')}/>
          }

          return (
            <div className="text-center">{status}</div>
          )
        }
      }];

    return (
      <div className="debtInfo">
        <Row className="pb-4">
          <Col xs={12} className="d-flex justify-content-center">
            <h2>{t('Информация по задолженностям')}</h2>
          </Col>
        </Row>
        <Row>
          <Col md={5} sm={12}>
            <FGI l={""} lf={2} ls={10}>
              <Select options={this.state.references} placeholder={t('Выберите тип справки')}
                      valueKey="_id" labelKey={name_key} value={this.state.reference}
                      onChange={reference => this.setState({reference})}/>
            </FGI>
          </Col>
          <Col md={3} sm={6}>
            <FGI l='' lf={0} ls={12}>
              <ImageInput fileHandler={this.handleFiles}
                          comment={t('Загрузить справку')}
                          btnLabel={t('Прикрепить')}
                          imgPreview={this.state.imgPreview}/>
            </FGI>
          </Col>
          <Col md={3} sm={6}>
            <DatePicker value={this.state.taxDebtDate}
                        placeholderText={t('дд.мм.гггг', {keySeparator: '>', nsSeparator: '|'})}
                        onChange={(value) => this.setState({taxDebtDate: value})}/>
            <FormText color={"muted"}>{t('Дата выдачи')}</FormText>
          </Col>
        </Row>
        <Row>
          <Col className="offset-md-6 mt-2" md={2}>
            {cancel}
          </Col>
          <Col className="mt-2" md={3} sm={6}>
            <Button className="badge-primary" onClick={this.submitAllHandler} disabled={!this.canSubmit()}>{t('Сохранить')}</Button>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col xs={12}>
            <ReactTable
              data={this.state.data}
              columns={columns}
              defaultPageSize={2}
              minRows={2}
              className="-striped -highlight"/>
          </Col>
        </Row>
      </div>
    )
  }
}

export default DebtInfo
