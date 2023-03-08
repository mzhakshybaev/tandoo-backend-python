import React from 'react';
import {createDrawerNavigator, createStackNavigator} from 'react-navigation';
import Home from './screens/Home';
import vars from './common/vars';
import SideMenu from './components/SideMenu';
import Login from './screens/Login';
import Registration from './screens/supplier/Registration';
import Announcements from './screens/Announcements';
import AnnounceView from './screens/AnnounceView';
import Recovery from './screens/Recovery';
import SupplierPassword from './screens/supplier/SupplierPassword';
import AddProduct, {AddProductFilter} from './screens/supplier/AddProduct';
import Announces from './screens/supplier/Announces';
import SupContractsList from './screens/supplier/SupContractsList';
import News from './screens/News';
import Info from './screens/Info';
import Profile from './screens/supplier/Profile';
import Companies from './screens/supplier/Companies';
import Notifications from './screens/supplier/Notifications';
import MyAccount from './screens/supplier/MyAccount';
import ProductView from './screens/ProductView';
import Catalog, {CatalogFilter} from './screens/purchaser/Catalog';
import PurAnnounce from './screens/purchaser/PurAnnounce';
import PurAnnouncePreview from './screens/purchaser/PurAnnouncePreview';
import PurAnnounceResult from './screens/purchaser/PurAnnounceResult';
import PurAnnounceContracts from './screens/purchaser/PurAnnounceContracts';
import PurBasket from './screens/purchaser/PurBasket';
import {withNamespaces} from "react-i18next";
import SupAddCompany from "./screens/supplier/SupAddCompany";
import ContractView from "./screens/ContractView";
import ScreenWrapper from "./components/ScreenWrapper";
import Toolbar, {ToolbarButton} from "./components/Toolbar";
import SupProposalEdit from "./screens/supplier/SupProposalEdit";
import SupplierProducts from "./screens/supplier/SupplierProducts";
import ProductRequests from "./screens/supplier/ProductRequests";
import AdminNotifications from "./screens/messages/AdminNotifications";
import AddProductRequests from "./screens/messages/ProductRequests";
import SubmittedAnnouncements from "./screens/messages/SubmittedAnnouncements";
import References from "./screens/messages/References";
import ByDateExpiration from "./screens/messages/ByDateExpiration";

const DraftScreen = () => <ScreenWrapper header={<Toolbar><ToolbarButton back/></Toolbar>}/>;

const Drawer = createDrawerNavigator(
  {
    home: {screen: Home},
    // profile: {screen: Profile},
  },
  {
    initialRouteName: 'home',
    drawerWidth: vars.deviceWidth - 100,
    contentComponent: props => {
      return <SideMenu {...props} />;
    },
  },
);

const Route = createStackNavigator(
  {
    drawer: Drawer,
    login: Login,
    supplier_registration: Registration,
    announcements: Announcements,
    'announce/view': AnnounceView,
    recovery: Recovery,
    supplierPassword: SupplierPassword,
    'supplier/products': SupplierProducts, // fs "Мой каталог"
    'supplier/products/add': {
      screen: createDrawerNavigator(
        {addProduct: {screen: AddProduct}},
        {
          initialRouteName: 'addProduct',
          drawerWidth: vars.deviceWidth - 60,
          drawerPosition: 'right',
          contentComponent: props => {
            return <AddProductFilter {...props} />;
          },
        },
      ),
    },
    'supplier/products/request': ProductRequests,
    'supplier/applications': Announces, // мои зявки
    'supplier/contracts': SupContractsList, // fs "Мои договора"
    'supplier/proposal/edit': SupProposalEdit,
    'purchaser/announce/listing': PurAnnounce, // fs Мои объявления
    'purchaser/announce/preview': PurAnnouncePreview,
    'purchaser/announce/result': PurAnnounceResult,
    'purchaser/announce/contracts': PurAnnounceContracts,
    'purchaser/basket': PurBasket,
    'contracts/view': ContractView,
    news: News,
    info: Info,
    org: Profile, // fs Профиль организации
    companies: Companies, // fs Мои организации
    'companies/add': SupAddCompany,
    notifications: Notifications, // fs "Сообщения"
    myAccount: MyAccount,
    productView: ProductView,
    'purchaser/catalog': {
      screen: createDrawerNavigator(
        {catalog: {screen: Catalog}},
        {
          initialRouteName: 'catalog',
          drawerWidth: vars.deviceWidth - 60,
          drawerPosition: 'right',
          contentComponent: props => {
            return <CatalogFilter {...props} />;
          },
        },
      ),
    },

    adminNotifications: AdminNotifications,
    addProductRequests: AddProductRequests,
    submittedAnnouncements: SubmittedAnnouncements,
    references: References,
    byDateExpiration: ByDateExpiration,
  },
  {
    mode: 'card',
    initialRouteName: 'drawer',
    headerBackTitle: null,
    headerTintColor: vars.text,
    headerStyle: {backgroundColor: vars.primary},
    headerMode: 'none',
  },
);

const WrappedNavigator = ({t}) => {
  return <Route screenProps={{t}}/>;
};

const ReloadAppOnLanguageChange = withNamespaces('', {
  bindI18n: 'languageChanged',
  bindStore: false,
})(WrappedNavigator);


export default ReloadAppOnLanguageChange;
