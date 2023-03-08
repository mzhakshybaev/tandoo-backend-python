import React, {Component} from 'react';
import Home from './views/Home';
import {Redirect, Route, Switch} from 'react-router-dom';

import Roles from './views/admin/Roles';
import Category from './views/operator/Category';
import Spr from './views/operator/Spr';
import Recovery from './views/Recovery';
import RecoveryConfirmation from './views/RecoveryConfirmation';
import Products from './views/operator/Products';
import ProductView from './views/operator/ProductView';
import Specifications from './views/operator/Specifications';
import PurchaserRegistration from './views/purchaser/PurchaserRegistration';

import Messages from './views/messages';
import Approval from './views/operator/Approval';
import Catalog from './views/operator/Catalog';
import Suppliers from './views/operator/Suppliers';
import Menus from './views/admin/Menus';
import CompanyView from './views/operator/CompanyView';
import Purchasers from './views/operator/Purchasers';
import Users from './views/operator/Users';

import Announcements from './views/Announcements/List';
import AnnounceView from './views/Announcements/View';
import AnnounceProtocol from './views/Announcements/Protocol';

import PurCatalog from './views/purchaser/Catalog';
import PurBasket from './views/purchaser/announce/Basket';
import PurAnnounceEvaluation from './views/purchaser/announce/Evaluation';
import PurAnnounceResult from './views/purchaser/announce/Result';
import PurAnnounceEdit from './views/purchaser/announce/Edit';
import PurAnnounceList from './views/purchaser/announce/List';
import PurAnnouncePreview from './views/purchaser/announce/Preview';
import PurAnnContracts from './views/purchaser/announce/Contracts';
import Budget from './views/purchaser/announce/Budget';
import PurContracts from './views/purchaser/contracts/List';

import PasswordRecovery from './views/supplier/PasswordRecovery';
import SupplierRegistration from './views/supplier/Registration';
import Confirmation from './views/supplier/Confirmation';
import SupProducts from './views/supplier/SupplierProduct';
import SupAddCompany from './views/supplier/AddCompany';
import CompanyProfile from './views/supplier/CompanyProfile';
import MyAccount from './views/supplier/MyAccount';
import SupCompanies from './views/supplier/Companies';
import CompanyQual from './views/supplier/CompanyQual';
import AddProduct from './views/supplier/AddProduct';
import ProductRequests from './views/supplier/messages/ProductRequests';

import SupPropEdit from './views/supplier/proposal/Edit';
import SupPropSubmit from './views/supplier/proposal/Submit';
import SupPropOferta from './views/supplier/proposal/Oferta';
import SupPropLots from './views/supplier/proposal/Lots';
import SupPropProducts from './views/supplier/proposal/Products';

import SupApplications from './views/supplier/application/List';
import SupAppDrafts from './views/supplier/application/DraftsList';
import SupAppRequests from './views/supplier/application/RequestsList';
import SupContractsList from './views/supplier/contracts/List';

import ContractView from './views/contracts/View';

// import SupContractsPage from "./views/supplier/contracts/Page";
// import ContractList from "./views/contracts/List";
// import ContractView from "./views/contracts/View";

import NewsView from './views/news/View';
import InvoiceView from './views/invoice/View';
import ConsignmentView from './views/consignment/View';

import PurScheduleEdit from './views/purchaser/contracts/SheduleEdit';
import EditUser from './views/operator/EditUser';
import SupplierConfirmed from './views/SupplierConfirmed';
import PurchaserList from './views/PurchaserList';
import BlackList from './views/BlackList';
import Coate from './views/operator/Coate';
import EditCoate from './views/operator/EditCoate';
import CoateAdd from './views/operator/CoateAdd';
import InfoView from './views/InfoView';
import DirBranch from './views/operator/DirBranch';
import DirDocs from './views/operator/DirDocs';
import ViewSupplierInfo from './views/purchaser/ViewSupplierInfo';
import LocalProducts from './views/Announcements/LocalProducts';
import Login from './views/Login';
import EdSpeedup from "./views/purchaser/announce/EdSpeedup";
import KC from "./views/KC";

export default () => (
  <>
    <Route exact path="/" component={Home}/>
    <Route path="/admin/ugo" exact component={Home}/>
    <Route path="/login/:token" component={Login}/>
    <Route path="/keycloak" component={KC}/>
    <Route path="/spr" component={Spr}/>
    <Route path="/users" component={Users}/>
    <Route path="/user/edit/:id" component={EditUser}/>
    <Route path="/roles" component={Roles}/>
    <Route path="/menus" component={Menus}/>
    <Route exact path="/passwordRecovery" component={PasswordRecovery}/>
    <Route exact path="/recovery" component={Recovery}/>
    <Route exact path="/recovery/confirm" component={RecoveryConfirmation}/>
    <Route exact path="/registration/supplier" component={SupplierRegistration}/>
    <Route exact path="/registration/supplier/password" component={Confirmation}/>
    <Route path="/category" component={Category}/>
    <Route path="/products" component={Products}/>
    <Route path="/local" component={LocalProducts}/>
    <Route path="/product/:id" component={ProductView}/>
    <Route path="/specifications" component={Specifications}/>
    <Route path="/approval" component={Approval}/>
    <Route path="/suppliers" component={Suppliers}/>
    <Route path="/purchasers" component={Purchasers}/>
    <Route path="/purchaser/add" component={PurchaserRegistration}/>
    <Route exact path="/notifications" component={Messages}/>
    <Route exact path="/news/:id" component={NewsView}/>
    <Route path="/catalog" component={Catalog}/>
    <Route path="/myaccount" component={MyAccount}/>
    <Route path="/org" component={CompanyProfile}/>
    <Route path="/operator/company/view" component={CompanyView}/>
    <Route path="/announcements/:tab(evaluation|results|contracts|canceled)?" component={Announcements}/>
    <Route path="/announce/view/:id" component={AnnounceView}/>
    <Route path="/announce/protocol/:id" component={AnnounceProtocol}/>
    <Route path="/purchaser/catalog/:id?" component={PurCatalog}/>
    <Route path="/purchaser/basket/:id?" component={PurBasket}/>
    <Route exact path="/purchaser/announce/:status(listing|draft|published|evaluate|result)"
           component={PurAnnounceList}/>
    <Route path="/purchaser/announce/edit/:id" component={PurAnnounceEdit}/>
    <Route path="/purchaser/announce/EdSpeedup/:id" component={EdSpeedup}/>
    <Route path="/purchaser/announce/preview/:id" component={PurAnnouncePreview}/>
    <Route path="/purchaser/announce/evaluate/:id" component={PurAnnounceEvaluation}/>
    <Route path="/purchaser/announce/result/:id" component={PurAnnounceResult}/>
    <Route path="/purchaser/announce/contracts/:id" component={PurAnnContracts}/>
    <Route path="/purchaser/contracts" exact component={PurContracts}/>
    <Route path="/purchaser/budget" exact component={Budget}/>
    <Route path="/purchaser/contracts/schedule_edit/:id" component={PurScheduleEdit}/>
    <Route path="/companies" exact component={SupCompanies}/>
    <Route path="/companies/add/" component={SupAddCompany}/>
    <Route path="/companies/edit/:id" component={SupAddCompany}/>
    <Route path="/supplier/products" exact component={SupProducts}/>
    <Route path="/supplier/products/add" component={AddProduct}/>
    <Route path="/supplier/products/request" component={ProductRequests}/>
    <Route path="/supplier/proposal/edit/:ann_id" component={SupPropEdit}/>
    <Route path="/supplier/proposal/lots/:ann_id" component={SupPropLots}/>
    <Route path="/supplier/proposal/products/:ann_id" component={SupPropProducts}/>
    <Route path="/supplier/proposal/oferta/:ann_id" component={SupPropOferta}/>
    <Route path="/supplier/proposal/submit/:ann_id" component={SupPropSubmit}/>
    <Route path="/supplier/applications" exact component={SupApplications}/>
    <Route path="/supplier/applications/drafts" component={SupAppDrafts}/>
    <Route path="/supplier/applications/requests" component={SupAppRequests}/>
    <Route path="/supplier/contracts" exact component={SupContractsList}/>
    <Route path="/supplier/info/:id" exact component={ViewSupplierInfo}/>
    <Route path="/supplier/company/qualification" exact component={CompanyQual}/>
    <Route path="/contracts/view/:id" exact component={ContractView}/>
    <Route path="/invoice/view/:id" exact component={InvoiceView}/>
    <Route path="/consignment/view/:id" exact component={ConsignmentView}/>
    <Route path="/home/supplier" exact component={SupplierConfirmed}/>
    <Route path="/home/purchaser" exact component={PurchaserList}/>
    <Route path="/home/blacklist" exact component={BlackList}/>
    <Route path="/coate" exact component={Coate}/>
    <Route path="/coate/edit/:id" exact component={EditCoate}/>
    <Route path="/coate/add" exact component={CoateAdd}/>
    <Route exact path="/info/:id" component={InfoView}/>
    <Route path="/branch" component={DirBranch}/>
    <Route path="/operator/dirdocs" component={DirDocs}/>
    {/*<Route path="/sup_contracts" exact component={SupContractsPage}/>*/}
    {/*<Route path="/contracts" exact component={ContractList}/> /!*Реестр договоров*!/*/}
    {/*<Route path="/contracts/view/:id" component={ContractView}/>*/}{' '}
    {/*bug*/}
    {/*<Redirect from="*" to="/"/>*/}
  </>
)
