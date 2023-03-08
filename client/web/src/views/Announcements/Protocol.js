import React, {Component} from 'react';
import {Button, Card, CardBody, CardHeader, Collapse, Row} from "reactstrap";
import AppButton from "components/AppButton";
import AppTable from "components/AppTable";
import AnnounceMainData from "components/announce/MainData";
import Loading from 'components/Loading';
import {translate} from "react-i18next";
import announceApi from 'stores/api/AnnounceApi';

@translate(['common', 'settings', ''])
export default class AnnounceProtocol extends Component {

  constructor(props) {
    super(props);
    this.state = {
      collapse: false,
      collapseLot: false,
      collapse2: false,
      data: [],
      announce: null
    }
  };

  componentDidMount() {
    const {id} = this.props.match.params;
    this.load(id);
  }

  async load(id) {
    let announce = await announceApi.get({id});
    this.setState({announce});
  }

  render() {
    const {t} = this.props;
    let {announce} = this.state;

    if (!announce) return <Loading/>;

    return (
      <div>
        <Card>
          <CardBody>
            <div className="d-flex justify-content-center">
              <h1>{t('Котировка цен')}</h1>
            </div>

            <AnnounceMainData announce={announce}/>

            <Card className={"mt-4"}>
              <CardHeader className={'spurs'}>
                <span>{t('Позиция')}1-[БумагаА4],[количество][ед.измерения]</span>
                <span>{t('Планируемая сумма за лот')}[сумма]</span>
                <span>{t('Предложений')}-[6]</span>
                <div className="card-actions">
                  <Button onClick={() => this.setState({collapse: !this.state.collapse})}>
                    <i className="fa fa-plus"/>
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <Collapse isOpen={this.state.collapse}>
                  {this.showLots()}
                </Collapse>
              </CardBody>
            </Card>


            <Card className={" mt-4"}>
              <CardHeader className={'spurs'}>
                <span>{t('Позиция')}2-[Ручки],[количество][ед.измерения] </span>
                <span>{t('Планируемая сумма за лот')}[сумма]</span>
                <span>{t('Предложений')}-[3]</span>
                <div className="card-actions">
                  <Button onClick={() => this.setState({collapse2: !this.state.collapse2})}>
                    <i className="fa fa-plus"/>
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <Collapse isOpen={this.state.collapse2}>
                  {this.showLots()}
                </Collapse>
              </CardBody>
            </Card>
            <Card className={" mt-4"}>
              <CardHeader className={'spurs'}>
                <span>{t('Позиция')}3-[Папки],[количество][ед.измерения]</span>
                <span>{t('Планируемая сумма за лот')}[сумма]</span>
                <span>{t('Предложений')}-[1]</span>
                <div className="card-actions">
                  <Button onClick={() => this.setState({collapseLot: !this.state.collapseLot})}>
                    <i className="fa fa-plus"/>
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <Collapse isOpen={this.state.collapseLot}>
                  {this.showLots()}
                </Collapse>
              </CardBody>
            </Card>
          </CardBody>
        </Card>

        <AppButton>{t('Скачать')}</AppButton>
        <AppButton className="ml-4">{t('Провести оценку')}</AppButton>
      </div>
    )
  }


  showLots = () => {
    const {t} = this.props;
    const columns2 = [
      {Header: '№', accessor: 'id'},
      {Header: t('Наименование поставщика'), accessor: 'supName'},
      {Header: t('Цена за единицу'), accessor: 'price'},
      {Header: t('Общая цена'), accessor: 'total'},
      {Header: t('Марка'), accessor: 'brand'},
      {Header: t('Страна производитель'), accessor: 'country'}
    ];

    return (
      <div>
        <AppTable
          columns={columns2}
          defaultPageSize={5}
          showPagination={false}
        />
      </div>
    )
  }

}
