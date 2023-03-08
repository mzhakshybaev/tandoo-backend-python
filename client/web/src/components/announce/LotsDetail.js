import React, {Component} from 'react';
import {Button, Card, CardBody, CardHeader, Collapse, Row} from "reactstrap";
import AppButton from "components/AppButton";
import AppTable from "components/AppTable";
import AppInput from "components/AppInput";
import {translate} from "react-i18next";

@translate(['common', 'settings', ''])
export default class AnnounceLotsDetail extends Component {

  render() {
    const {t} = this.props;
    let {lots} = this.props;
    return (
      <div>
        {lots && lots.map((lot, i) => (
          <Card className={" mt-4"}>
            {lot.status == 'Canceled' ? (
              <CardHeader key={i} className={'spurs'}>
                <span>{t('Отмененная')}</span>
              </CardHeader>
            ) : (
              <div>
                <CardHeader className={'spurs'}>
                  <div>
                    <span>{t('Позиция')}{i + 1}-[{lot.dircategory[0].name}],[{lot.quantity}]</span>
                    <span>{t('Планируемая сумма')} [{lot.lot_budget}] </span>
                    <span>{t('Предложений')}-[{lot.applications.length}]</span>
                    <div className="card-actions">
                      <Button
                        onClick={() => this.setState({["collapse" + (i + 1)]: !this.state["collapse" + (i + 1)]})}>
                        <i className="fa fa-plus"/>
                      </Button>
                    </div>
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
                      <Row className={'ml-1 mt-2'}>
                        <AppButton>Сохранить</AppButton>

                        <AppButton className="ml-4 primary" onClick={() => this.cancelLot(lot._id)}>{t('Отменить')}
                          позицию</AppButton>
                        {this.state["lotInput" + lot._id] &&
                        <AppInput className="w-25  ml-4 " placeholder={t('Причина отмены позиции')}
                                  value={this.state["lotReason" + lot._id]}
                                  onChange={e => this.setState({["lotReason" + lot._id]: e.target.value})}/>
                        }
                      </Row>
                    </div>
                  </Collapse>
                </CardBody>
              </div>)}
          </Card>
        ))}
      </div>
    )
  }
}
