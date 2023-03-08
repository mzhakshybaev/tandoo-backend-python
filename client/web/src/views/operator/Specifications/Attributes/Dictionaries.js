import React, {Component} from 'react';
import {Card, CardBody, CardHeader, Collapse} from "reactstrap";
import Button from "components/AppButton";
import Switcher from "components/Switcher";
import AppTable from "components/AppTable";
import {inject, observer} from "mobx-react";
import {translate} from "react-i18next";
import {toJS} from "mobx";


@translate(['common', 'settings', ''])
@inject("specStoreV2") @observer
class Dictionaries extends Component {

  state = {collapse: false};


  toggle = () => {
    this.setState({collapse: !this.state.collapse});
  };

  render() {
    const {t} = this.props;
    let {dictionaries, roles, onSwitchDictVisibility, onSwitchDictionary} = this.props.specStoreV2;

    let columns = [
      {Header: "Название справочника", accessor: "name"},
      {
        Header: "",
        width: 100,
        filterable: false,
        sortable: false,
        className: "text-center",
        Cell: ({original, index}) =>
          <Switcher checked={original.switched}
                    onChange={value => onSwitchDictionary(index, value)}/>
      },
      {
        Header: t('Видимость'),
        columns: roles.map(role => ({
          Header: role.name,
          width: 100,
          filterable: false,
          sortable: false,
          className: "text-center",
          Cell: ({original, index}) =>
            <Switcher checked={original.roles_id.includes(role._id)}
                      onChange={value => onSwitchDictVisibility(index, value, role._id)}/>
        }))
      }
    ];

    return (
      <Card>
        <CardHeader className="cursor-pointer" onClick={this.toggle}>
          {t('Добавить из справочника')}
          <div className={"card-actions"}>
            <Button color="danger" outline>
              {this.state.collapse ? <i className={"fa fa-chevron-up"}/> : <i className={"fa fa-chevron-down"}/>}
            </Button>
          </div>
        </CardHeader>
        <Collapse isOpen={this.state.collapse}>
          <CardBody>
            <AppTable data={toJS(dictionaries)}
                      columns={columns}
                      showPagination={false}
                      pageSize={dictionaries.length}/>
          </CardBody>
        </Collapse>
      </Card>
    )
  }
}

export default Dictionaries;
