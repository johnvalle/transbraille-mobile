import React from 'react';
import axios from "axios"
import { StyleSheet, Text, View, Alert, Dimensions, ActivityIndicator, Modal, Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from "expo-camera"
import { Button, CheckBox } from "react-native-elements";

import Theme from '../Theme';

export default function CameraScreen({ navigation }) {
  const [hasPermission, setHasPermission] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [language, setLanguage] = React.useState("english");
  const [imageURI, setImageURI] = React.useState(null);
  const [imagebase64, setImageBase64] = React.useState(null);
  const [translation, setTranslation] = React.useState(null);

  const cameraRef = React.useRef();

  React.useEffect(() => {
    (async () => {
      const library = await MediaLibrary.requestPermissionsAsync();
      const camera = await Camera.requestPermissionsAsync();
      setHasPermission(camera.status === "granted" && library.status === "granted");
    })();  
  }, []);

  React.useEffect(() => {
    if (imageURI && imagebase64) {
      translate()
    }
  }, [imageURI, imagebase64])

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ display: "flex", flexDirection: "row"}}>
          <Button
            type="solid"
            title="Capture Image"
            icon={{
              name: "camera",
              type: "feather",
              color: Theme.colors.white
            }}
            onPress={() => takePicture()}
          />
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
    if (cameraRef) {
      const image = await cameraRef.current.takePictureAsync();
      cameraRef.current.pausePreview();
      if (image) {
        cameraRef.current.resumePreview();
        const manipulatedImg = await ImageManipulator.manipulateAsync(
          image.uri,
          [{ resize: { width: 1280, height: 720 } }],
          {
            base64: true,
            compress: 0.5
          }
        )
        const { base64, uri } = manipulatedImg;
        setImageURI(uri)
        setImageBase64(base64);
      }
    }
  }

  async function translate() {
    await MediaLibrary.createAssetAsync(imageURI)
    setIsLoading(true);
    setImageURI(null);
    const response = await axios({
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      url: `https://transbraille.herokuapp.com/translate-${language}/`,
      method: "POST",
      data: {
        braille: imagebase64
      }
    })
    if (response.data) {
      setTranslation(response.data?.data?.toString());
    }
    setIsLoading(false);
  }

  function generatePlaceholderArray(length) {
    return Array.from({ length: length }, (v, k) => k + 1);
  }

  return (
    <View style={styles.container}>
      {isLoading ? <ActivityIndicator size="large" color={Theme.colors.primaryLight} /> : (
       <>
        {showSettings ? (
          <>
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
          </>
        ):(
          <>
            <Camera ref={cameraRef} style={styles.camera} type={Camera.Constants.Type.back}>
              <View style={{ display: "flex", flexDirection: "row" }}>
                {[...generatePlaceholderArray(18)].map((_, idx) => (
                  <View key={idx}>
                    {[...generatePlaceholderArray(4)].map((_, idx) => <View key={idx} style={{
                      borderWidth: 1,
                      borderColor: "white",
                      width: 50,
                      height: 60
                    }} />)}
                  </View>
                ))}
              </View>
            </Camera>
            <Text style={styles.translation}>{translation ? `Translation: ${translation}`: "No image captured yet."}</Text>
          </>
        )}
       </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0000",
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: Dimensions.get("window").height / 2,
  },
  buttonGroupContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "30%",
    paddingVertical: 16
  },
  translation: {
    position: "absolute",
    bottom: 50
  }
});
