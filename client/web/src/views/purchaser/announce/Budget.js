import React from 'react';
import {translate} from "react-i18next";
import {observer} from "mobx-react";
import PurAppTabs from "components/purchaser/AnnTabs";
import {Card, TabContent, Table, TabPane} from "reactstrap";

import * as request from '../../../../../utils/requester';
import AppTable from "../../../components/AppTable";

const columns = [
  {
    Header: 'accountTitle',
    accessor: 'accountTitle' // String-based value accessors!
  },
  {
    Header: 'amount',
    accessor: 'amount',
    Cell: props => <span className='number'>{props.value}</span> // Custom cell components!
  },
  {
    Header: 'amountRemaining',
    accessor: 'amountRemaining' // Custom value accessors!
  },
  {
    Header: 'createdDate',
    accessor: 'createdDate' // Custom value accessors!
  },
  {
    Header: 'economAmount',
    accessor: 'economAmount' // Custom value accessors!
  },
  {
    Header: 'economClassifier',
    accessor: 'economClassifier' // Custom value accessors!
  },
  {
    Header: 'reservedAmount',
    accessor: 'reservedAmount' // Custom value accessors!
  },
  {
    Header: 'usedAmount',
    accessor: 'usedAmount' // Custom value accessors!
  },
  {
    Header: 'year',
    accessor: 'year' // Custom value accessors!
  }

];

@translate(['common', 'settings', ''])
@observer
export default class Budget extends React.Component {

  constructor(props) {
    super(props);
    this.state = {list: []};
  }

  componentDidMount() {
    request.post('plan/listing').then(r => this.setState({list: r.data}));
  }

  render() {
    const {t} = this.props;
    return (<div className="animated fadeIn">
      <h3>{t('Бюджет')}</h3>

      <PurAppTabs/>

      <TabContent>
        <TabPane>
          <AppTable data={this.state.list}
                    columns={columns}
                    SubComponent={row => {
                      return (
                        <Table dark striped bordered hover size="sm">
                          <thead>
                          <tr>
                            <th>okgz</th>
                            <th>measurementUnit</th>
                            <th>priceForOneUnit</th>
                            <th>amount</th>
                            <th>sum</th>
                          </tr>
                          </thead>
                          <tbody>
                          {row.original.planningDetails.map(p =>
                            <tr key={p.id}>
                              <th scope="row">{p.okgz}</th>
                              <td>{p.measurementUnit}</td>
                              <td>{p.priceForOneUnit}</td>
                              <td>{p.amount}</td>
                              <td>{p.sum}</td>
                            </tr>
                          )}
                          </tbody>
                        </Table>
                      )
                    }}
          />
        </TabPane>
      </TabContent>
    </div>)
  }
}
