import React from 'react';
import {Table, Button, Input} from "components";

const Values = (props) => {

  let {values, attrIndex, onAddClick, onRemoveClick, onValueChange} = props;

  let renderEditable = ({value, index, original, column}) => (
    <Input bsSize="sm"
           callback={val => onValueChange(attrIndex, index, column.id, val)}
           value={value}/>
  );

  let renderRemoveButton = ({index}) => (
    <Button size="sm"
            color="danger"
            outline
            onClick={() => onRemoveClick(attrIndex, index)}
            title="Удалить">
      <i className="fa fa-trash"/>
    </Button>
  );

  let columns = [
    {Header: "Название", accessor: "name", Cell: renderEditable},
    {Header: "Название KG", accessor: "name_kg", Cell: renderEditable},
    {Header: "Название EN", accessor: "name_en", Cell: renderEditable},
    {
      Cell: renderRemoveButton,
      width: 40,
      filterable: false,
      sortable: false,
      className: "text-center"
    }
  ];

  return (
    <div style={{padding: "15px", backgroundColor: "#F2F2F2"}}>
      <div className="attributesTitle">
        <h5 className="text-center">Значения</h5>
        <Button size="sm" onClick={() => onAddClick(attrIndex)} title="Добавить">
          <i className="fa fa-plus"/>
        </Button>
      </div>
      <Table data={values}
             columns={columns}
             showRowNumbers
             pageSize={5}/>
    </div>
  );
};

export default Values;
