import React, {Component} from 'react'
import Auc from "../../components/Hoc";
import {Col, Row} from "reactstrap";
import ReactTable from "react-table";
import {IMAGES_URL} from "../../../../utils/common";
import {translate} from "react-i18next";

@translate(['common', 'settings', ''])
class ContractList extends Component {
  state = {
    data: [],
  };

  render() {
    const {t} = this.props;
    const columns = [
      {
        Header: '№ п/п', accessor: '', width: 40,
        Cell: (row) => {
          return <div className="d-flex justify-content-center"><p></p></div>
        },
      },
      {
        Header: t('№ Договора'), accessor: '',
        Cell: (row) => {
          return <div className=" d-flex justify-content-center"><p></p></div>
        },
      }, {
        Header: t('Закуп. организация'), accessor: '',
        Cell: (row) => {
          return <div className="d-flex justify-content-center"><p></p></div>
        },
      },
      {
        Header: t('Предмет закупки'), accessor: '',
        Cell: (row) => {
          return <div className="d-flex justify-content-center"><p></p></div>
        },

      },
      {
        Header: t('Лот'), accessor: '',
        Cell: (row) => {
          return <div className="d-flex justify-content-center align-items-center"><p></p></div>
        }
      },
      {
        Header: t('Поставщик'), accessor: '',
        Cell: (row) => {
          return <div className="d-flex justify-content-center align-items-center"><p></p></div>
        }
      },
      {
        Header: t('Сумма'), accessor: '',
        Cell: (row) => {
          return <div className="d-flex justify-content-center align-items-center"><p></p></div>
        }
      }
    ];

    return (
      <>
        <Row>
          <Col xs={12} className="mt-2">
            <h2 className="text-center">{t('Реестр договоров')}</h2>
          </Col>
        </Row>
        <Row>
          <Col xs={12} className="mt-3">
            <ReactTable
              data={this.state.data}
              columns={columns}
              defaultPageSize={2}
              minRows={4}
              className="-striped -highlight"/>
          </Col>
        </Row>
      </>
    )
  }
}

export default ContractList
