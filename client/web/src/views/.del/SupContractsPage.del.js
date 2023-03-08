import React,{Component} from 'react'
import {inject, observer} from "mobx-react"
import {Link, withRouter} from 'react-router-dom';
import {translate} from "react-i18next";
import {Card, CardBody, CardHeader, Col, ListGroup, ListGroupItem, Row} from "reactstrap";
import Loading from "components/Loading";
import ContractView from "components/contract/View";
import Button, {ConfirmButton} from "components/AppButton";
import Input from "components/AppInput";

@translate(['common', 'settings', ''])
@inject('supContractListCtrl',  'supContractViewCtrl', 'authStore') @withRouter @observer
export default class SupContractsPage extends Component{
  state = {data: [], contract: null};
  componentDidMount() {
    this.props.supContractListCtrl.load();
  }

  componentWillUnmount() {
    this.props.supContractListCtrl.reset();
  }
  render() {
    let pcs = this.props.supContractListCtrl;
    let {contracts} = pcs;

    const {t} = this.props;
    const {status} = this;
    console.log("contracts_list:" + contracts);

    return(
      <div className="animated fadeIn">
        <Row>
          <Col md={2}>
            <Card>
              <CardHeader>
                {t('Перечень договоров')}
              </CardHeader>
              <CardBody>
                <ListGroup>
                  {contracts && contracts.map((s, i) =>
                    <ListGroupItem key={i} tag="button" action  onClick={() => this.getData(s.id, 0)}>
                      № {t("" + s.code + "")}
                      <div className="font-weight-bold mt-2">
                        Статус: {' '}

                        {s.status === 'Pending' &&
                        <span className="text-primary">Ожидает подписания</span>
                        }

                        {s.status === 'Signed' &&
                        <span className="text-success">Подписан</span>
                        }

                        {s.status === 'Declined' &&
                        <span className="text-danger">Отклонён</span>
                        }
                      </div>
                    </ListGroupItem>)}
                </ListGroup>
              </CardBody>
            </Card>

          </Col>
          <Col md={10}>
            {this.renderContractView()}
          </Col>
        </Row>
      </div>
    )
  }

  getData = (id) => {
    console.log("id контракта:" +id);
    this.props.supContractViewCtrl.load(id);
    // this.props.supContractViewCtrl.load(id).then(r => {
    //   console.log("Значения r:" + r);
    //   this.setState({contract: r});
    // })
  };

  renderContractView = () => {
    let {contract} = this.props.supContractViewCtrl;
    let {t} = this.props
    let {isSupplier, company} = this.props.authStore;
    if (!contract) return null;

    return (
      <div>
        <Card>
          <CardHeader>
            Договор № {contract.code}
          </CardHeader>
          <CardBody>
            <h3 className="text-center"></h3>

            <ContractView contract={contract} showLots/>

            <Row>
              <Col xs={12} className="mt-2">

                <div className="font-weight-bold mt-2">
                  Статус: {' '}

                  {contract.status === 'Pending' &&
                  <span className="text-primary">Ожидает подписания Поставщиком</span>
                  }

                  {contract.status === 'Signed' &&
                  <span className="text-success">Подписан Поставщиком</span>
                  }

                  {contract.status === 'Declined' &&
                  <span className="text-danger">Отклонён Поставщиком</span>
                  }
                </div>


                {isSupplier && company._id === contract.sup_company._id && (() => {

                  if (contract.status === 'Pending') {
                    if (otpStatus === OTP_INIT) {
                      return [
                        <Button className="mt-2 mr-2" key="0" onClick={this.sendOTP}>{t('Подписать Договор')}</Button>,
                        <ConfirmButton title="Вы уверены, что хотите отклонить договор?" onConfirm={this.decline}
                                       className="mt-2" color="danger" key="1">{t('Отклонить')}</ConfirmButton>
                      ];

                    } else if (otpStatus === OTP_SENDING) {
                      return <Loading/>

                    } else if (otpStatus === OTP_SENT) {
                      return (
                        <Row>
                          <Col md={6} className="mt-2">
                            Код подтверждения отправлен Вам в СМС. Введите его в поле ниже.
                            <Input placeholder="Код OTP" autoFocus value={otpCode}
                                   onChange={e => this.setOTP(e.target.value)}/>
                            <Button className="mt-2" onClick={this.submit} disabled={!canSubmitSign}>Отправить</Button>
                          </Col>
                        </Row>
                      )
                    }

                  } else if (contract.status === 'Signed') {
                    return [
                      <Button className="mt-2 ml-2" to={`/supplier/invoice/view/${contract.id}`}>Счет на оплату</Button>,
                      <Button className="mt-2 ml-2" key={1}>Накладная</Button>
                    ]
                  }

                })()}

              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    )
  }
}

