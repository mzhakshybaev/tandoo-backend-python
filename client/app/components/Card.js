import React from "react";
import {TouchableOpacity, View, Text} from "react-native";
import Image from './AppImage';
import {Badge} from "react-native-elements";
import PropTypes from "prop-types";
import vars from "../common/vars";
import {Title} from "./Toolbar";

const Card = ({images, children, title, showImageCount, imageFullSize, onPress, containerStyle}) => {
  return (
    <TouchableOpacity activeOpacity={onPress ? 0.5 : 1}
                      style={[{
                        shadowColor: vars.grey,
                        shadowOffset: {
                          width: 0,
                          height: 3
                        },
                        shadowRadius: 5,
                        shadowOpacity: .5,
                        elevation: 3,

                        borderRadius: 5,
                        backgroundColor: 'white',
                        marginBottom: 10,
                      }, containerStyle]}
                      onPress={() => {
                        if (onPress) onPress()
                      }}
    >
      {showImageCount && images && images.length > 0 && (
        <View style={{position: "absolute", zIndex: 100, top: 5, left: 5}}>
          <Badge status="error" size="large" value={images.length}/>
        </View>
      )}
      {images && images.length > 0 && (
        <Image
          resizeMode={imageFullSize ? 'contain' : 'cover'}
          source={{uri: images[0]}}
          style={{width: "100%", height: imageFullSize ? '100%' : 150}}
        />
      )}

      <View style={{padding: 10, backgroundColor: vars.white}}>
        {!!title &&
        <>
          <Title style={{marginBottom: 10}}>{title}</Title>
          <View style={{padding: 1, backgroundColor: vars.grey, marginBottom: 5}}/>
        </>
        }
        {children}
      </View>
    </TouchableOpacity>
  );
};

Card.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node.isRequired
};

export default Card;


