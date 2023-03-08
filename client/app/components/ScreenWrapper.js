import React from 'react';
import vars from "../common/vars";
import {SafeAreaView, ScrollView, StatusBar, View} from "react-native";
import Spinner, {NoDataView} from "./Spinner";

export default ({header, tab, loading, children, noScroll, noData}) => {
  const hasTabs = !!tab;
  const content = noData ? <NoDataView/> : children;
  return (
    <>
      <StatusBar backgroundColor={vars.primary} barStyle="light-content"/>
      <SafeAreaView style={{flex: 1, backgroundColor: vars.primary}}>
        {!!header && React.cloneElement(header, {hasTabs})}
        {tab}
        {!hasTabs && (loading ? <Spinner/> : (noScroll ? content : <ScrollContainer>{content}</ScrollContainer>))}
      </SafeAreaView>
    </>
  )
}

export const ScrollContainer = ({children}) => (
  <ScrollView style={{flex: 1, backgroundColor: vars.bg, paddingHorizontal: 10, paddingTop: 10}}>
    {children}
    <View style={{padding: 5}}/>
  </ScrollView>
);
