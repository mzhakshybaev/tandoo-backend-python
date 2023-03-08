import React from 'react'
import vars from "../common/vars";
import {ScrollableTabView, ScrollableTabBar,} from '@valdio/react-native-scrollable-tabview'
import PropTypes from "prop-types";

const TabView = ({children, onChangeTab, initialPage}) => (
  <ScrollableTabView initialPage={initialPage || 0}
                     tabBarPosition='top'
                     renderTabBar={() => <ScrollableTabBar/>}
                     tabBarActiveTextColor={vars.white}
                     tabBarInactiveTextColor={vars.borderColor}
                     tabBarUnderlineStyle={{backgroundColor: vars.white, height: 3}}
                     tabBarBackgroundColor={vars.primary}
                     style={{backgroundColor: vars.bg}}
                     onChangeTab={(e) => {
                       if (onChangeTab) onChangeTab(e);
                     }}
  >
    {children}
  </ScrollableTabView>
);

TabView.propTypes = {
  onChangeTab: PropTypes.oneOfType([PropTypes.function, undefined]),
  children: PropTypes.node.isRequired
};

export default TabView;
