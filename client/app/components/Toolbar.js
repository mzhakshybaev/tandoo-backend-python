import React from 'react';
import {PixelRatio, Platform, StatusBar, Text, View} from 'react-native';
import {Icon} from 'react-native-elements'
import TouchableItem from './TouchableItem';
import vars from "../common/vars";
import {withNavigation} from "react-navigation";
import PropTypes from "prop-types";

const Toolbar = ({children, hasTabs}) => {
  let shadow = hasTabs ? {
      elevation: 0,
      shadowColor: null,
      shadowOffset: null,
      shadowRadius: null,
      shadowOpacity: null,
      borderBottomWidth: null
    } :
    {
      borderBottomWidth: Platform.OS === "ios" ? 1 / PixelRatio.getPixelSizeForLayoutSize(1) : 0,
      borderBottomColor: vars.grey,
      shadowColor: "#000",
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 1.2,
      elevation: 3
    };
  return (
    <React.Fragment>
      <StatusBar barStyle="light-content" translucent={false} animated/>
      <View style={[{
        alignItems: 'center',
        paddingHorizontal: 10,
        height: Platform.OS === 'ios' ? 50 : 56,
        backgroundColor: vars.primary,
        flexDirection: 'row',
        justifyContent: 'space-between',
        top: 0,
        left: 0,
        right: 0,
      }, shadow]}>
        {children}
      </View>
    </React.Fragment>
  )
};

Toolbar.propTypes = {
  hasTabs: PropTypes.bool,
  children: PropTypes.node.isRequired
};

export default Toolbar;

const Button = ({onPress, iconName, iconType, menu, back, size, style, color, disabled, navigation}) => {
  if (menu) {
    iconName = vars.platform === 'ios' ? 'ios-menu' : 'md-menu';
    iconType = 'ionicon';
  }

  if (back) {
    iconName = vars.platform === 'ios' ? 'ios-arrow-back' : 'md-arrow-back';
    iconType = 'ionicon';
  }

  let s = (menu || back) ? 28 : 24;
  if (size) {
    s = size;
  }
  return (
    <TouchableItem
      accessibilityComponentType="button"
      accessibilityTraits="button"
      testID="header-button"
      delayPressIn={0}
      onPress={() => {
        if (onPress) {
          onPress()
        } else if (back) {
          navigation.goBack();
        } else if (menu) {
          navigation.openDrawer()
        }
      }}
      disabled={disabled}
      pressColor={'rgba(0, 0, 0, .32)'}
      style={[{paddingHorizontal: 5}, style]}
      borderless>
      <Icon style={{transform: [{scaleX: 1}]}} name={iconName} type={iconType} size={s} color={color || vars.white}/>
    </TouchableItem>
  );
};

Button.propTypes = {
  menu: PropTypes.bool,
  back: PropTypes.bool,
  onPress: PropTypes.oneOfType([undefined, PropTypes.function]),
};

export const ToolbarButton = withNavigation(Button);

export const ToolbarTitle = ({children}) => (
  <Text style={{fontSize: 20, marginLeft: 10, backgroundColor: 'transparent', color: vars.white, flex: 1}}>
    {children}
  </Text>
);

export const Title = ({children, style}) => (
  <Text style={[{fontWeight: 'bold', fontSize: 16, color: vars.text, marginBottom: 15}, style]}>{children}</Text>
);
