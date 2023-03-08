import React from 'react';
import {inject} from "mobx-react"
import {ConfirmButton} from "components/AppButton";
import Table from "components/AppTable"
import {Link} from "react-router-dom";
import Button from 'components/AppButton';
import {showError, showSuccess} from "utils/messages";

@inject("dictStore")
export default class Coate extends React.Component {
  state = {};

  componentDidMount() {
    this.load();
  }

  load = async () => {
    let r = await this.props.dictStore.getCoateListing();
    this.setState({r});
  };

  remove = async id => {
    try {
      await this.props.dictStore.removeCoate(id);
      this.load();
      showSuccess('Удален')
    } catch (e) {
      showError(e.message || 'Ошибка')
    }
  };


  render() {
    let columns = [];
    columns.push({
      Header: "", columns: [
        {accessor: 'id', show: false},
        {Header: "Код", accessor: "code"},
        {Header: "Наименование", accessor: "name"},
        {Header: "Центр", accessor: "center"},
        {
          width: 40, filterable: false, sortable: false,
          Cell: ({row}) =>
            <Link to={'/coate/edit/' + row.id} title="Редактировать">
              <i className="fa fa-lg fa-edit mr-2"/>
            </Link>
        },
        {
          width: 40, filterable: false, sortable: false,
          Cell: ({row}) =>
            <ConfirmButton size="sm" color="danger" title="Удалить"
                           onConfirm={() => this.remove(row.id)}>
              <i className="fa fa-trash"/>
            </ConfirmButton>
        }
      ]
    });


    return (
      <div className="animated fadeIn">
        <Button to="/coate/add">Добавить</Button>
        <Table data={this.state.r} columns={columns}/>
      </div>
    )
  }
}
