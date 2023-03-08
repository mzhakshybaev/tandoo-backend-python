import React from 'react';
import ImageLoad from 'react-native-image-placeholder';
import vars from "../common/vars";

export default ({source, style, resizeMode, ...rest}) => (
  <ImageLoad
    loadingStyle={{size: 'large', color: vars.primary}}
    placeholderSource={require('../images/empty.png')}
    style={style}
    resizeMode={resizeMode || 'contain'}
    source={source}
    {...rest}
  />
)
