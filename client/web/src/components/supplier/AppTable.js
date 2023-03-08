import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Table from 'components/AppTable';
import {translate} from "react-i18next";

@translate(['common', 'settings', ''])
export default class SupAppTable extends Component {
  static propTypes = {
    columns: PropTypes.array,
    data: PropTypes.array,
  };

  static defaultProps = {
    columns: [{Header: '_id', accessor: '_id'}],
    data: [],
  };

  render() {
    let {t, columns, data, showPagination} = this.props;

    return (
      <Table data={data}
             minRows="2"
             pageSize={Math.max(10, data.length)}
             filterable={false}
             showPagination={showPagination}
             showRowNumbers={true}
             columns={columns}/>
    );
  }
}
