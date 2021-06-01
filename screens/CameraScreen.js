import React from 'react';
import axios from "axios";
import * as firebase from "firebase";
import "firebase/storage";
import { LogBox } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";
import { StyleSheet, Text, View, Alert, ActivityIndicator, TouchableOpacity, Image, ScrollView } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from "expo-camera"
import { Button, CheckBox, Icon } from "react-native-elements";

import Theme from '../Theme';

const Firebase = !firebase.apps.length ? firebase.initializeApp({
  apiKey: "AIzaSyDNH_D7qWWwfBspjgEWTEn-duXwFf5z5W0",
  authDomain: "transbraille-90a37.firebaseapp.com",
  projectId: "transbraille-90a37",
  storageBucket: "transbraille-90a37.appspot.com",
  messagingSenderId: "140974633135",
  appId: "1:140974633135:web:a31e256a2e9f4d31d8a45a"
}) : firebase.app();

export default function CameraScreen({ navigation }) {
  const [hasPermission, setHasPermission] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [language, setLanguage] = React.useState("english");
  const [translation, setTranslation] = React.useState(null);
  const [imageList, setImageList] = React.useState([]);

  React.useEffect(() => {
    LogBox.ignoreLogs(["Setting a timer"]);
    (async () => {
      const library = await MediaLibrary.requestPermissionsAsync();
      const camera = await Camera.requestPermissionsAsync();
      setHasPermission(camera.status === "granted" && library.status === "granted");
    })();

    return () => {
      imageList.map((_, idx) => removeImage(idx));
    }
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ display: "flex", flexDirection: "row"}}>
          <Button
            type={showSettings ? "solid" : "clear"}
            icon={{
              name: "settings",
              type: "feather",
              color: showSettings ? "white" : "black"
            }}
            onPress={() => setShowSettings(!showSettings)}
            containerStyle={{ marginHorizontal: 12 }}
          />
        </View>
      )
    })
  }, [navigation, showSettings])


  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  async function takePicture() {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.5
    });
    if (!result.cancelled) {
      const { uri } = await ImageManipulator.manipulateAsync(result.uri, [
        {
          resize: {
            width: 300,
            height: 400
          }
        },
        
      ], {
        compress: 0.1
      })
      // console.log(result, manip)
      const blob = await uriToBlob(uri);

      const fileName = uri.split("/").pop();
      let blobData = {
        name: fileName,
        type: "image/jpeg",
        uri: uri,
        file: blob
      };

      const url = await uploadImage(blobData);
    }
  }

  function uriToBlob(uri) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.onload = function () {
        resolve(xhr.response);
      };

      xhr.onerror = function () {
        reject(new Error("uriToBlob failed"));
      };

      xhr.responseType = "blob";

      xhr.open("GET", uri, true);
      xhr.send(null);
    });
  }

  async function uploadImage(blob) {
    if (blob) {
      setIsLoading(true)
      const ref = `transbraille-image/${blob?.name}`;
      const storageRef = Firebase.storage().ref(ref);

      storageRef.put(blob?.file).on(
        "state_changed",
        (snapshot) => snapshot,
        (error) => error,
        async () => {
          const downloadURL = await storageRef.getDownloadURL();
          console.log(downloadURL)
          const image = {
            ...blob,
            storageRef: ref,
            storageURL: downloadURL
          }
          setIsLoading(false);
          setImageList(prevState => [...prevState, image]);
        }
      );
    }
  }

  async function translate() {
    setIsLoading(true);
    const data = imageList.map((image) => image.storageURL);
    const response = await axios({
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      url: `https://transbraille.herokuapp.com/translate-${language}/`,
      method: "POST",
      data: {
        braille: data
      }
    })
    setIsLoading(false);
    if (response.status) {
      setIsLoading(false);
      imageList.map((_, idx) => removeImage(idx));
      Alert.alert(response.data?.data?.toString())
    }
    // const response = await axios({
    //   headers: {
    //     'Access-Control-Allow-Origin': '*',
    //     'Content-Type': 'application/json',
    //   },
    //   url: `https://transbraille.herokuapp.com/translate-${language}/`,
    //   method: "POST",
    //   data: {
    //     braille: data
    //   }
    // })
    // if (response.status) {
    //   setTranslation(response.data?.data?.toString());
    // }
    // setIsLoading(false);
  }

  function confirmRemove(index) {
    Alert.alert(
      "Remove image",
      "Are you sure you want to remove this image from the list?",
      [
        {
          text: "Cancel",
          onPress: () => false,
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => removeImage(index),
          style: "default",
        },
      ],
      {
        cancelable: true,
      }
    );
  }

  async function removeImage(index) {

    await Firebase.storage().ref(imageList[index]?.storageRef).delete();
    await setImageList(prevState => prevState.filter((_, idx) => idx !== index));
  }


  return (
    <View style={styles.container}>
      {isLoading ? <ActivityIndicator size="large" color={Theme.colors.primaryLight} /> : (
       <>
        {showSettings ? (
          <View>
            <Text>Select a language</Text>
            <CheckBox
              center
              title='English'
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'
              checked={language === "english"}
              onPress={() => setLanguage("english")}
            />
            <CheckBox
              center
              title='Filipino'
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'
              checked={language === "filipino"}
              onPress={() => setLanguage("filipino")}
            />
          </View>
        ):(
          <>
            <View>
              <ScrollView>
              {imageList.length > 0 ? (
                  <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap"}}>
                    {imageList.length > 0 && imageList.map(({ uri }, idx) => (
                      <View key={idx} style={styles.imageContainer}>
                        <Image style={{ width: 100, height: 120 }} source={{ uri: uri }} />
                        <TouchableOpacity onPress={() => confirmRemove(idx)}>
                          <View style={styles.deleteButton}>
                            <Icon
                              name="x"
                              type="feather"
                              color="white"
                              size={16}
                              style={styles.deleteIcon}
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
              ) : (
                  <Text style={{ textAlign: "center"}}>No image captured yet.</Text>
                )}
                  </ScrollView>
            </View>
            <View>
              <Button
                type="solid"
                title="Capture Image"
                icon={{
                  name: "camera",
                  type: "feather",
                  color: Theme.colors.white
                }}
                onPress={takePicture}
                containerStyle={{
                  marginTop: 24
                }}
                buttonStyle={{
                  width: "100%"
                }}
              />
              <Button
                type="solid"
                title="Translate"
                icon={{
                  name: "repeat",
                  type: "feather",
                  color: Theme.colors.white
                }}
                onPress={translate}
                containerStyle={{
                  marginTop: 24
                }}
                buttonStyle={{
                  width: "100%",
                  backgroundColor: "green"
                }}
                disabled={imageList.length <= 0}
              />
            </View>
          </>
        )}
       </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: "column",
    paddingVertical: "10%",
    height: "80%"
  },
  camera: {
    position: "absolute",
    top: 0,
    width: 500,
    height: 400,
  },
  deleteButton: {
    marginVertical: 8,
    justifyContent: "center",
    alignItems: "center"
  },
  deleteIcon: {
    backgroundColor: "red",
    padding: 4,
    borderRadius: 50,
    width: 25,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    borderWidth: 1.5,
    borderColor: "#EEEEEE",
    margin: 8,
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#FFFF"
  },
  translation: {
    position: "absolute",
    bottom: 50
  }
});
