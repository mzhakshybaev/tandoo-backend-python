import React, {Component} from 'react';
import {Platform, StyleSheet, TouchableNativeFeedback, TouchableOpacity, View} from 'react-native';

const ANDROID_VERSION_LOLLIPOP = 21;

export default class TouchableItem extends Component {
  static defaultProps = {
    borderless: false,
    pressColor: 'rgba(0, 0, 0, .32)',
  };

  render() {
    /*
     * TouchableNativeFeedback.Ripple causes a crash on old Android versions,
     * therefore only enable it on Android Lollipop and above.
     *
     * All touchables on Android should have the ripple effect according to
     * platform design guidelines.
     * We need to pass the background prop to specify a borderless ripple effect.
     */
    if (Platform.OS === 'android' && Platform.Version >= ANDROID_VERSION_LOLLIPOP) {
      const {style, onPress, ...rest} = this.props;
      let containerStyle = styles.container;
      if (style) {
        containerStyle = StyleSheet.flatten([containerStyle, style])
      }
      return (
        <TouchableNativeFeedback
          accessibilityComponentType="button"
          accessibilityTraits="button"
          delayPressIn={0}
          onPress={onPress}
          {...rest}
          style={null}
          background={TouchableNativeFeedback.Ripple(
            this.props.pressColor || TouchableItem.defaultProps.pressColor,
            this.props.borderless || TouchableItem.defaultProps.borderless
          )}
        >
          <View style={containerStyle}>
            {this.props.children}
          </View>
        </TouchableNativeFeedback>
      );
    }

    return (
      <TouchableOpacity {...this.props}>
        {this.props.children}
      </TouchableOpacity>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
});
