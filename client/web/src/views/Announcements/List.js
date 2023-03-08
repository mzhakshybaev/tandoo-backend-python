import React from "react"
import {ListGroup, Nav, NavItem, NavLink, Row, Col, TabContent, TabPane} from "reactstrap";
import {Link} from "react-router-dom";
import Loading from 'components/Loading';
import {translate} from "react-i18next";
import announceApi from 'stores/api/AnnounceApi';
import AnnounceItem from 'components/announce/Item';
import Pagination from 'components/Pagination';
import {observable, action, runInAction} from 'mobx'
import {observer} from 'mobx-react'

@translate(['common', 'settings', '']) @observer
export default class Announcements extends React.Component {
  @observable ready = false;
  @observable tabs = [
    {name: 'published', title: "Опубликованные", status: 'Published'},
    {name: 'evaluation', title: "Оценка", status: 'Evaluation'},
    {name: 'results', title: "Итоги", status: 'Results'},
    {name: 'contracts', title: "Договора"},
    {name: 'canceled', title: "Отмененные", status: 'Canceled'}
  ];
  @observable activeTab;
  @observable activeViewTab;
  @observable announcements;
  @observable pages = 0;
  @observable page = 0;
  @observable perPageItems = [10, 25, 50, 100];
  @observable perPage = this.perPageItems[0];

  constructor(props) {
    super(props);

    // set default tab
    this.activeTab = this.tabs[0]
  }

  componentDidMount() {
    this.setTab(this.props.match.params.tab, true);
  }

  componentDidUpdate() {
    let {tab} = this.props.match.params;
    if (this.activeTab.name !== tab) {
      this.setTab(this.props.match.params.tab)
    }
  }

  componentWillUnmount() {
    this.reset()
  }

  // triggers load
  @action
  setTab(tabName = this.tabs[0].name, force) {
    if (this.activeTab.name === tabName && !force)
      return;

    let tab = this.tabs.find({name: tabName});
    if (!tab)
      return;

    this.activeTab = tab;
    this.page = 0;
    this.pages = 0;

    this.load()
  }

  // triggers load
  @action.bound
  switchPage(page, perPage) {
    if (perPage && perPage !== this.perPage) {
      this.pages = 0;
      this.page = 0;
      this.perPage = perPage;
      this.load();

    } else if (this.page !== page) {
      this.page = page;
      this.load();
    }
  };

  async load() {
    runInAction(() => {
      this.ready = false;
      this.announces = null;
    });

    let tab = this.activeTab;

    if (tab.status) {
      this.activeViewTab = 0;

      let params = {
        offset: this.page * this.perPage,
        limit: this.perPage,
        status: tab.status,
        order: ['published_date desc']
      };

      let {totalCount, docs: announces} = await announceApi.list(params);

      runInAction(() => {
        this.ready = true;
        this.announces = announces;
        this.pages = Math.ceil(totalCount / this.perPage)
      })

    } else {
      this.activeViewTab = 1;
    }
  }

  @action
  reset() {
    this.ready = false;
    this.announces = null;
    this.pages = 0;
  }


  render() {
    const {t} = this.props;

    let {announces, tabs, activeTab, activeViewTab, ready, page, pages, switchPage, perPage, perPageItems} = this;

    return (
      <div className="animated fadeIn">
        <Nav tabs>
          {tabs.map(tab =>
            <NavItem key={tab.name}>
              <NavLink tag={Link}
                       to={`/announcements${tab.name === 'published' ? '' : '/' + tab.name}`}
                       active={activeTab === tab}>
                {t(tab.title)}
              </NavLink>
            </NavItem>
          )}
        </Nav>
        <TabContent activeTab={activeViewTab}>
          <TabPane tabId={0}>

            <Row>
              <Col>
                <Pagination total={pages} current={page} perPage={perPage} perPageItems={perPageItems} onChange={switchPage}/>
              </Col>
            </Row>

            <Row>
              <Col>
                {!ready ? <Loading/> :
                  <ListGroup>
                    {announces.map((a, i) => (
                      <AnnounceItem key={i} announcement={a} index={i}/>
                    ))}
                  </ListGroup>
                }
              </Col>
            </Row>

            <Row>
              <Col>
                <Pagination total={pages} current={page} perPage={perPage} perPageItems={perPageItems} onChange={switchPage}/>
              </Col>
            </Row>

          </TabPane>
          <TabPane tabId={1}>
            <p>{t('Договора')}</p>
          </TabPane>
        </TabContent>
      </div>
    )
  }
}
