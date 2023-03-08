import React, {Component} from 'react'
import {Card, CardBody, CardTitle, Col, Row, Table} from "reactstrap";
import Button from 'components/AppButton'
import {observable, action} from "mobx";
import {inject, observer} from "mobx-react";
import {formatDateTime} from "utils/helpers";
import Loading from "../../components/Loading";
import ReactTable from "react-table";
import {translate} from "react-i18next";

@translate(['common', 'settings', '']) @inject("contractsApi") @observer
export default class PurchaserContractView extends Component {
  @observable ready = false;
  @observable contract;

  componentDidMount() {
    this.load().then(() => {
      this.ready = true;
    });
  }

  @action
  componentWillUnmount() {
    this.ready = false;
    this.contract = null;
  }

  async load() {
    let id = this.props.match.params.id;
    this.contract = await this.props.contractsApi.getContract(id);

    debugger
  }

  /*ex = {
    "status": "Отправлен",
    "sup_company": {
      "typeofownership": "org",
      "resident_state": "resident",
      "name": "Продавец",
      "edit_user_id": 4,
      "dircoate_id": "d9bd730b-d449-4ad9-b8f4-c95603b02d4f",
      "_rev": "2-50c6e8b091e91626956c6b57e326fdd6",
      "company_type": "supplier",
      "roles_id": ["f8f967c2-3d8d-4459-84c5-e393e102e84d"],
      "_deleted": "infinity",
      "main_doc_img": null,
      "inn": "77777777777777",
      "role": 0,
      "company_status": "confirmed",
      "_created": "2018-08-20 10:18:37+06",
      "user_id": 52,
      "dircountry_id": null,
      "_id": "3b3058b2-17f0-4149-903f-186767a915f2",
      "data": {"phone": "996777888488", "email": "20@08.ru", "address": {"house": "77", "street": "777", "apt": ""}},
      "typeofownership_id": "107e908b-73c6-43d6-9915-b0cf732152b7",
      "short_name": "Прод"
    },
    "application_id": "7a22985a-e417-4f91-9095-9e445ccbdd78",
    "lots": [{
      "status": null,
      "estimated_delivery_time": 10,
      "total": 10989,
      "edit_user_id": 48,
      "delivery_place": "Иссык-Кульская область, 1, 11, 1",
      "budget": 13320,
      "_deleted": "infinity",
      "dircategory_name": "Питьевая вода",
      "reason": null,
      "dircategory_id": 5122,
      "advert_id": "91976fbf-6011-4068-bec4-9f97288a11c4",
      "_created": "2018-08-20 16:45:57+06",
      "_id": "db5c23d1-128c-409a-86a2-3d2be123a419",
      "data": {},
      "_rev": "1-eaa2439b3dce22a230cacd34fd2c8e64",
      "dirpayment_id": "123",
      "quantity": 111
    }],
    "advert_lot_id": "db5c23d1-128c-409a-86a2-3d2be123a419",
    "company_id": "9a63e2c2-bdaa-4adf-b7c0-00a565de30f9",
    "pur_company": {
      "typeofownership": "org",
      "resident_state": "resident",
      "name": "Закупщик",
      "edit_user_id": 4,
      "dircoate_id": "d9bd730b-d449-4ad9-b8f4-c95603b02d4f",
      "_rev": "2-9356d8e2d31f960f34b890de0e51a65e",
      "company_type": "purchaser",
      "roles_id": ["0b3620f3-5d63-46c6-95a6-08f0882e2d08"],
      "_deleted": "infinity",
      "main_doc_img": null,
      "inn": "33333333333333",
      "role": 0,
      "company_status": "confirmed",
      "_created": "2018-08-20 17:46:22+06",
      "user_id": 48,
      "dircountry_id": null,
      "_id": "9a63e2c2-bdaa-4adf-b7c0-00a565de30f9",
      "data": {"phone": "+996701 888 488", "email": "sup@sup.ru", "address": {"house": "", "street": "3", "apt": ""}},
      "typeofownership_id": "107e908b-73c6-43d6-9915-b0cf732152b7",
      "short_name": "Закуп"
    },
    "code": null,
    "advert_id": "91976fbf-6011-4068-bec4-9f97288a11c4",
    "announce": {
      "status": "Results",
      "update_date": "2018-08-20 16:58:34",
      "dirprocurement_name": "Прямого заключения договора (ст. 21., ч.2., п 8 - возникн. срочн. необх.) ",
      "edit_user_id": 48,
      "data": {
        "payments": {
          "advance": 0,
          "accept": 100,
          "shipmentEnabled": false,
          "acceptEnabled": true,
          "shipment": 0,
          "advanceEnabled": false
        }
      },
      "_rev": "1593-581006eaca34a50fd99325f1bfa10bfc",
      "created_date": "2018-08-20 16:45:57",
      "company_id": "9a63e2c2-bdaa-4adf-b7c0-00a565de30f9",
      "_deleted": "infinity",
      "reason": null,
      "code": "180820001",
      "deadline": "2018-08-20 17:13:56",
      "published_date": "2018-08-20 16:58:34",
      "_created": "2018-08-22 18:26:09+06",
      "advert_date": {},
      "_id": "91976fbf-6011-4068-bec4-9f97288a11c4",
      "dirsection_id": "b32622e2-d3fe-4f87-84bd-5faca963c4bd",
      "dirprocurement_id": "c42101fa-111f-4a38-8e79-944a6043dfff"
    },
    "total": 10989,
    "dirsection_id": "b32622e2-d3fe-4f87-84bd-5faca963c4bd",
    "id": 11
  };*/

  render() {
    const {t} = this.props;
    if (!this.ready) return <Loading/>;

    const columns = [
      {
        Header: t('Лот'), accessor: '',
        Cell: (row) => {
          return <div className="d-flex justify-content-center align-items-center"><p></p></div>
        }
      },
      {
        Header: t('Ед. изм'), accessor: '',
        Cell: (row) => {
          return <div className=" d-flex justify-content-center"><p></p></div>
        },
      }, {
        Header: t('Количество'), accessor: '',
        Cell: (row) => {
          return <div className="d-flex justify-content-center"><p></p></div>
        },
      },
      {
        Header: t('Цена за ед.', {
          keySeparator: '>',
          nsSeparator: '|',
        }), accessor: '',
        Cell: (row) => {
          return <div className="d-flex justify-content-center"><p></p></div>
        },

      },
      {
        Header: t('Цена лота'), accessor: '',
        Cell: (row) => {
          return <div className="d-flex justify-content-center align-items-center"><p></p></div>
        }
      }
    ];

    let {pur_company, sup_company, announce} = this.contract;

    return (
      <div>
        <Row>
          <Col xs={12} className="mt-2">
            <h2 className="text-center">{t('Договор')}</h2>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col md={6} xs={12}>
            <Card className="animated fadeIn">
              <CardTitle>{t('Закупщик')}</CardTitle>
              <CardBody className="p-3">
                <Table bordered>
                  <tbody>
                  <tr>
                    <td>{t('Наименование')}</td>
                    <td>{pur_company.short_name}</td>
                  </tr>
                  <tr>
                    <td>{t('ИНН')}</td>
                    <td>{pur_company.inn}</td>
                  </tr>
                  <tr>
                    <td>{t('Должность')}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>{t('ФИО')}</td>
                    <td></td>
                  </tr>
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
          <Col md={6} xs={12}>
            <Card className="animated fadeIn">
              <CardTitle>{t('Поставщик')}</CardTitle>
              <CardBody className="p-3">
                <Table bordered>
                  <tbody>
                  <tr>
                    <td>{t('Наименование')}</td>
                    <td>{sup_company.short_name}</td>
                  </tr>
                  <tr>
                    <td>{t('ИНН')}</td>
                    <td>{sup_company.inn}</td>
                  </tr>
                  <tr>
                    <td>{t('Должность')}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>{t('ФИО')}</td>
                    <td></td>
                  </tr>
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>

          <Col xs={12}>
            <Card className="animated fadeIn">
              <CardTitle>{t('Информация об объявлении')}</CardTitle>
              <CardBody className="p-3">
                <Col md={6} xs={12}>
                  <Table bordered>
                    <tbody>
                    <tr>
                      <td>{t('№ объявления')}</td>
                      <td>{announce.code}</td>
                    </tr>
                    <tr>
                      <td>{t('Метод закупок')}</td>
                      <td>{announce.dirprocurement_name}</td>
                    </tr>
                    <tr>
                      <td>{t('Дата публикации')}</td>
                      <td>{formatDateTime(announce.created_date)}</td>
                    </tr>
                    <tr>
                      <td>{t('Срок подачи предложения')}</td>
                      <td>{formatDateTime(announce.deadline)}</td>
                    </tr>
                    </tbody>
                  </Table>
                </Col>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <h4>{t('Предмет закупки')}</h4>

            <ReactTable
              data={this.state.data}
              columns={columns}
              defaultPageSize={2}
              minRows={4}
              className="-striped -highlight"/>

          </Col>
          <Col xs={12} className="mt-2"><Button className="py-2 px-4">{t('Подписать Договор')}</Button></Col>
        </Row>
      </div>
    )
  }
}
