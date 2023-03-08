import React from 'react';
import Modal from "react-native-modal";
import {Text, TouchableOpacity, View} from "react-native";
import {Icon} from "react-native-elements";
import vars from "../common/vars";

const BottomMenu = ({onClose, children, isVisible, title, containerStyle}) => {

  let showTitle = false;
  if (title && title.length > 0)
    showTitle = true;

  return (
    <Modal isVisible={isVisible}
           style={{justifyContent: "flex-end", marginHorizontal: 0, marginVertical: 0}}
           onBackdropPress={onClose}
           onBackButtonPress={onClose}
           useNativeDriver
           animationInTiming={500}
           animationOutTiming={300}
    >
      <View style={[{backgroundColor: 'white'}, containerStyle]}>
        {showTitle && <Text style={{margin: 15}}>{title}</Text>}
        {children}
        <TouchableOpacity style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 15,
          borderTopColor: vars.grey,
          borderTopWidth: 1
        }} onPress={onClose}>
          <Icon name='x' type='feather' size={22} width={50}/>
          <Text style={{flex: 1, color: vars.text, fontSize: 16}}>Отмена</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
};

// BottomMenu.propTypes = {
//   onClose: PropTypes.function.isRequired,
//   children: PropTypes.node.isRequired,
//   isVisible: PropTypes.bool.isRequired,
//   title: PropTypes.string
// };

export default BottomMenu;
