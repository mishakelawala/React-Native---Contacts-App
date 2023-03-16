
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, LogBox, TouchableOpacity } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { FloatingAction } from "react-native-floating-action";
import { AlphabetList } from "react-native-section-alphabet-list";
import Fontisto from 'react-native-vector-icons/Fontisto';
LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();

import {
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text, TextInput, View
} from 'react-native';

import Contacts from 'react-native-contacts';
import ListItem from './components/ListItem';

const App = () => {

  const [contacts, setContacts] = useState([]);

  const [loading, setLoading] = useState(false)



  const currentRef = useRef(null)

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
        title: 'Contacts',
        message: 'This app would like to view your contacts.',
      }).then(() => {
        loadContacts();
      }
      );
    } else {
      loadContacts();
    }
  }, []);

  const loadContacts = () => {
    setLoading(true)
    Contacts.getAll()
      .then(contacts => {
        contacts.sort(
          (a, b) => a.givenName.toLowerCase() > b.givenName.toLowerCase(),
        );
        let data = []
        contacts.map((item) => {
          data.push({
            item,
            value: item.givenName,
            key: item.recordID,
          })
        })
        setContacts([...data]);
      })
      .catch(e => {
        console.warn('Permission to access contacts was denied');
      }).finally(() => setLoading(false));
  };

  const search = (text) => {
    const phoneNumberRegex =
      /\b[\+]?[(]?[0-9]{2,6}[)]?[-\s\.]?[-\s\/\.0-9]{3,15}\b/m;
    if (text === '' || text === null) {
      loadContacts();
    } else if (phoneNumberRegex.test(text)) {
      Contacts.getContactsByPhoneNumber(text).then(contacts => {
        contacts.sort(
          (a, b) => a.givenName.toLowerCase() > b.givenName.toLowerCase(),
        );
        let data = []
        contacts.map((item) => {
          data.push({
            item,
            value: item.givenName,
            key: item.recordID,
          })
        })
        setContacts([...data]);
        console.log('contacts', contacts);
      });
    } else {
      Contacts.getContactsMatchingString(text).then(contacts => {
        contacts.sort(
          (a, b) => a.givenName.toLowerCase() > b.givenName.toLowerCase(),
        );
        let data = []
        contacts.map((item) => {
          data.push({
            item,
            value: item.givenName,
            key: item.recordID,
          })
        })
        setContacts([...data]);
        console.log('contacts', contacts);
      });
    }
  };

  const openContact = (contact) => {
    console.log(JSON.stringify(contact));
    Contacts.openExistingContact(contact);
    setTimeout(() => {
      loadContacts();
    }, 2000);
  };

  const deleteOnPress = (contact) => {
    Alert.alert(
      'Delete Contact...',
      `Please confirm you want to delete the ${contact.displayName}'s contact?`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
              {
                'title': 'Contacts',
                'message': 'This app would like to view your contacts.',
                'buttonPositive': 'Please accept bare mortal'
              }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              console.log("hello");
              Contacts.deleteContact(contact).then(() => {
                loadContacts();
              })
            }
          },
        },
      ],
    );
  }

  const [img,setImg] = useState('')

  const importNewContacts = async () => {
    try {
      const results = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.allFiles],
      });
      console.log("results", results);
      setImg(results[0].uri)
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('Canceled');
      } else {
        console.log('Unknown Error: ' + JSON.stringify(err));
        throw err;
      }
    }
  }


  const actions = [
    {
      text: "Add Contact",
      icon: require('./components/Images/addContact.png'),
      name: "bt_AddContact",
      position: 2
    },
    {
      text: "Import Contact",
      icon: require('./components/Images/importContact.png'),
      name: "bt_ImportContact",
      position: 1
    },
  ]

  // const manageFloatIcons = (name) => {
  //   if (name == "bt_AddContact") {
  //     Contacts.openContactForm({}).then(contact => {
  //       loadContacts();
  //     })
  //   } else if (name == "bt_ImportContact") {
  //     importNewContacts();
  //   }
  // }

  return (
    <>
      <SafeAreaView style={styles.container}>
        {loading ?
          <View style={{
            flex: 1,
            justifyContent: 'center', flexDirection: 'row',
            justifyContent: 'space-around',
            padding: 10,
          }}>
            <ActivityIndicator size="large" color="#2E5984" />
          </View> :
          <View style={styles.container}>
            <TouchableOpacity style={styles.mainView} onPress={() => currentRef.current.focus()}>
              <Fontisto name="search" style={styles.searchIcon} color={'white'} />
              <TextInput
                ref={currentRef}
                onChangeText={search}
                placeholder="Search"
                style={styles.searchBar}
                placeholderTextColor={'white'}
              />
            </TouchableOpacity>
            <AlphabetList
              style={{ flex: 1, paddingVertical: 20 }}
              data={contacts}
              indexLetterStyle={{
                color: '#3792cb',
                paddingHorizontal: 20,
              }}
              renderCustomItem={(contact) => (
                <ListItem
                  key={contact.item.recordID}
                  item={contact.item}
                  onPress={openContact}
                  onLongPress={() => Contacts.viewExistingContact(contact)}
                  deleteOnPress={deleteOnPress}
                />
              )}
              renderCustomSectionHeader={(section) => (
                <View style={styles.sectionHeaderContainer}>
                  <Text style={styles.sectionHeaderLabel}>{section.title}</Text>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              onEndReachedThreshold={0.1}
              ListFooterComponent={() => { return (loading ? <ActivityIndicator size="large" color="'#2E5984" /> : null) }}
              keyExtractor={(item) => item.recordID}
            />
            <FloatingAction
              color="#2E5984"
              // actions={actions}
              // onPressItem={name => {
              //   //  console.log(`selected button: ${name}`);
              //   manageFloatIcons(name)
              // }}
            onPressMain={()=>Contacts.openContactForm({}).then(contact => {
              loadContacts();
            })}
            />
          </View>}
      </SafeAreaView>
    </>
  );
};
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  separator: {
    height: 0.5,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sectionHeaderContainer: {
    padding: 5,
    flex: 1,
    right: 30,
    alignSelf: 'flex-end'
  },
  sectionHeaderLabel: {
    fontSize: 25,
    padding: 10,
    paddingHorizontal: 20,
    color: 'white',
    fontWeight: 600,
    textAlign: 'center',
    backgroundColor: '#2E5984',
    borderRadius: 20,

  },
  header: {
    textAlign: 'center',
    backgroundColor: '#2E5984',
    color: 'white',
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 20,
  },
  searchBar: {
    flex: 1,
    fontSize: 20,
    color: 'white',
    paddingVertical: 11.5,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  searchIcon: {
    fontSize: 25,
    backgroundColor: 'white',
    backgroundColor: '#656565',
    padding: 14.5,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10
  },
  mainView: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    backgroundColor: '#656565',
    borderRadius: 10,
  }
});