import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from 'reactstrap';

@inject('mainStore') @observer
export default class LangDropdown extends Component {
  render() {
    const {mainStore} = this.props;
    const {language} = mainStore;

    return (
      <UncontrolledDropdown>
        <DropdownToggle nav className="px-2">
          <span>{language.short_name}</span>
        </DropdownToggle>
        <DropdownMenu>
          {mainStore.languages
            .filter(l => l.code !== language.code)
            .map(l =>
              <DropdownItem key={l.code} onClick={() => mainStore.setLanguage(l)}>
                {l.name}
              </DropdownItem>
            )
          }
        </DropdownMenu>
      </UncontrolledDropdown>
    )
  }
}
