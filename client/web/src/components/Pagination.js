import React, {Component} from 'react';
import {
  Pagination,
  PaginationItem,
  PaginationLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import {observer} from "mobx-react";

@observer
export default class EcPagination extends Component {
  handleClickPage(id) {
    this.props.onChange && this.props.onChange(id);
  }

  handleClickPerPage(perPage) {
    this.props.onChange && this.props.onChange(0, perPage);
  }

  render() {
    let {perPage, perPageItems, total, current} = this.props;

    if (!total)
      return null;

    let items = [];

    // create items
    // prev
    items.push({
      disabled: current === 0,
      previous: true,
      id: current - 1
    });

    // pages
    for (let i = 0; i < total; i++) {
      items.push({
        active: i === current,
        title: i + 1,
        id: i
      })
    }

    // next
    items.push({
      disabled: current === (total - 1),
      next: true,
      id: current + 1
    });

    return (
      <div className="d-flex">
        <Pagination>
          {items.map((item, i) => {
            let {disabled, active, previous, next, title, id} = item;

            return (
              <PaginationItem active={active} disabled={disabled} key={i}>
                <PaginationLink previous={previous} next={next} onClick={() => this.handleClickPage(id)}>
                  {title}
                </PaginationLink>
              </PaginationItem>
            )
          })}

        </Pagination>

        <UncontrolledDropdown color="light" className="ml-2">
          <DropdownToggle caret>
            {perPage}
          </DropdownToggle>
          <DropdownMenu>
            {perPageItems.map(item =>
              <DropdownItem key={item} onClick={() => this.handleClickPerPage(item)}>{item}</DropdownItem>
            )}
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    )
  }
}
