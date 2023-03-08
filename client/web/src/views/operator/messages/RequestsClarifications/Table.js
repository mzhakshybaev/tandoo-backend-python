import React, {Fragment} from "react";
import AppTable from "components/AppTable";
import AppButton from "components/AppButton";

const tableColumns = [
  {Header: "Кому", accessor: "recipient"},
  {Header: "Текст", accessor: ""},
  {Header: "Дата отправки", accessor: "_created"},
];

export default (props) => {
  return (
    <Fragment>
      <h5>Запросы / Разъяснения</h5>
      <AppTable data={props.data}
                columns={tableColumns}
                showRowNumbers={true}
                onClick={props.onItemClick}/>
      <AppButton className={"mt-2"} onClick={props.onCreateClick}>Создать</AppButton>
    </Fragment>)
};
