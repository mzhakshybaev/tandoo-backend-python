import React, {Component} from 'react';
import {Col, FormText, Row} from "reactstrap";
import Input, {FGI} from "components/AppInput";
import ImageInput from "components/ImageInput";
import ReactTable from "react-table";
import Button, {ConfirmButton} from "components/AppButton";
import {translate} from "react-i18next";
import {inject, observer} from "mobx-react";
import {showSuccess, showError} from "utils/messages";
import {IMAGES_URL} from "utils/common";
import Img from 'components/Image';
import {formatDate} from "utils/helpers";
import moment from "./DebtInfo";

@translate(['common', 'settings', ''])
@inject('supplierStore', 'authStore') @observer
class MyDocuments extends Component {
  state = {
    img: null,
    file_name: null,
    imgPreview: null
  };

  componentDidMount() {
    this.getDocument()

  }

  getDocument = async () => {
    let r = await this.props.supplierStore.getDocs();
    this.setState({r});
    console.log("THE DATA IS " + r)
  };

  remove = async (id) => {
    try {
      await this.props.supplierStore.removeDocs(id);
      this.getDocument();
      showSuccess('Удален')
    } catch (e) {
      showError(e.message || 'Ошибка')

    }

  };


  handleFiles = (file) => {
    this.setState({
      img: file.base64.split(',')[1],
      imgPreview: file.base64,
    });
  };
  cancelFiles = () => {
    this.setState({
      imgPreview: null,
      img: null
    })
  }
  submit = async () => {

    try {
      let {file} = await this.props.supplierStore.uploadImage(this.state.img);

      let document = {
        company_id: this.props.company._id,
        file,
        file_name: this.state.file_name
      };

      await this.props.supplierStore.saveDocs(document);

      showSuccess("Успешно сохранен");

      this.setState({
        img: null,
        imgPreview: null,
        file: null,
        file_name: null
      });

      this.getDocument();

    } catch (e) {
      showError(e && e.message || 'Ошибка');
      console.warn(e);
    }
  };

  render() {
    const {t} = this.props;
    let cancel = null;
    if (this.state.img || this.state.imgPreview) {
      cancel = (
        <Button color={'danger'} onClick={this.cancelFiles}>
          <i className={"fa fa-remove"}/> {t('Отменить')}

        </Button>
      )
    }

    const columns = [{Header: t('Наименование документа'), accessor: 'file_name'},
      {
        Header: t('Изображение'), Cell: row => (
          <div className={"text-center"}>
            <Img style={{maxWidth: 100, maxHeight: 80}} src={IMAGES_URL + row.original.file}/>
          </div>),
        accessor: 'file'
      },
      {
        width: 40, filterable: false, sortable: false,

        Cell: (row) =>(
          <ConfirmButton size="sm" color="danger" title={t('Удалить')}
                         onConfirm={() => this.remove(row.original)}>
            <i className="fa fa-trash"/>
          </ConfirmButton>),
         accessor:"_id",
      }
    ];
    return (
      <div className="debtInfo">
        <Row className="pb-4">
          <Col xs={12} className="d-flex justify-content-center">
            <h2>{t('Мои документы')}</h2>
          </Col>
        </Row>
        <Row>
          <Col md={5} sm={12}>
            <FGI l={""} lf={2} ls={10}>
              <Input value={this.state.file_name || ''} placeholder={t('Наименование документа')}
                     onChange={e => this.setState({file_name: e.target.value})}/>
            </FGI>
          </Col>
          <Col md={3} sm={6}>
            <FGI l={""} lf={0} ls={12}>
              <ImageInput fileHandler={this.handleFiles}
                          comment={t('Загрузить документ')}
                          imgPreview={this.state.imgPreview}/>
            </FGI>
          </Col>

        </Row>
        <Row>
          <Col className="offset-md-5 mt-2" md={2}>
            {cancel}
          </Col>
          <Col className=" mt-2" md={3} xs={12}>
            <Button className="badge-primary" onClick={this.submit}>{t('Сохранить изменения')}</Button>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col xs={12}>
            <ReactTable
              data={this.state.r}
              defaultPageSize={10}
              columns={columns}
              className="-striped -highlight"/>
          </Col>
        </Row>
      </div>
    )
  }
}

export default MyDocuments;
