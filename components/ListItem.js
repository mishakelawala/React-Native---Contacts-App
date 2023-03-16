import PropTypes from 'prop-types';
import React, { memo, useRef } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RBSheet from "react-native-raw-bottom-sheet";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Avatar from './Avatar';

const getAvatarInitials = (textString) => {
  if (!textString) return '';
  const text = textString.trim();
  const textSplit = text.split(' ');
  if (textSplit.length <= 1) return text.charAt(0);
  const initials =
    textSplit[0].charAt(0) + textSplit[textSplit.length - 1].charAt(0);
  return initials;
};

const ListItem = (props) => {
  const shouldComponentUpdate = () => {
    return false;
  };
  const { item, onPress, deleteOnPress } = props;

  const ManageRef = useRef();

  return (
    <View>
      <TouchableOpacity onPress={() => ManageRef.current.open()} >
        <View style={styles.itemContainer}>
          <View style={styles.leftElementContainer}>
            <Avatar
              img={item.hasThumbnail ? { uri: item.thumbnailPath } : undefined}
              placeholder={getAvatarInitials(
                `${item.givenName} ${item.familyName}`,
              )}
              width={40}
              height={40}
            />
          </View>
          <View style={styles.rightSectionContainer}>
            <View style={styles.mainTitleContainer}>
              <Text
                style={
                  styles.titleStyle
                }>{`${item.givenName} ${item.familyName}`}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      <RBSheet
        ref={ManageRef}
        height={Number(Dimensions.get('window').height)/5}
        openDuration={250}
        customStyles={{
          container: {
            justifyContent: "center",
            alignItems: "center",
            borderRadius:20,
            backgroundColor: '#656565',
            width:'80%',
            alignSelf:'center',
            margin:20
          }
        }}
      >
        <View style={styles.rbsheet}>
          <Text numberOfLines={1} style={[styles.titleStyle,{fontSize:20,textAlign:'center',paddingTop:5,fontWeight:600}]}>{`${item.givenName.toUpperCase()} ${item.familyName.toUpperCase()}`}</Text>
          <TouchableOpacity onPress={()=>{onPress(item);ManageRef.current.close()}} style={{padding:25}}>
            <Text style={[styles.titleStyle,{fontSize:20,textAlign:'center'}]}>Edit Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>{deleteOnPress(item);ManageRef.current.close()}} style={{paddingHorizontal:25,paddingBottom:25}}>
            <Text style={[styles.titleStyle,{fontSize:20,textAlign:'center'}]}>Delete Contact</Text>
          </TouchableOpacity>
        </View>
      </RBSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    minHeight: 44,
    height: 63,
  },
  leftElementContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 2,
    paddingLeft: 13,
  },
  rightSectionContainer: {
    marginLeft: 18,
    flexDirection: 'row',
    flex: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#515151',
  },
  mainTitleContainer: {
    justifyContent: 'center',
    flexDirection: 'column',
    flex: 1,
  },
  titleStyle: {
    fontSize: 16,
    color: 'white'
  },
  rbsheet: {
    flex:1,
    width:'100%'
  }
});

export default memo(ListItem);

ListItem.propTypes = {
  item: PropTypes.object,
  onPress: PropTypes.func,
};
