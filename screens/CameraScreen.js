import React from 'react';
import axios from "axios"
import { StyleSheet, Text, View, Alert, Dimensions, ActivityIndicator, TextInput, Pressable } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera } from "expo-camera"
import { Button, Input } from "react-native-elements";
import Theme from '../Theme';

export default function CameraScreen({ navigation }) {
  const [hasPermission, setHasPermission] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showInput, setShowInput] = React.useState(false);
  const [valueToShow, setValueToShow] = React.useState("");
  const cameraRef = React.useRef();

  const textRef = React.useRef(valueToShow);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          type="solid"
          title="Capture Image"
          icon={{
            name: "camera",
            type: "feather",
            color: Theme.colors.white
          }}
          onPress={() => takePicture()}
          containerStyle={{ marginHorizontal: 12 }}
        />
      ),
      headerTitle: () => (
        <>
          <Pressable onPress={() => setShowInput(prevState => !prevState)}>
            <Text>Camera</Text>
          </Pressable>
        </>
      )
    })
  }, [navigation])


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
        
        translate(manipulatedImg.base64)
        // setIsLoading(true);
        // setTimeout(() => {
        //   setIsLoading(false);
        //   Alert.alert(textRef.current);
        // }, 4500)
      }
    }
  }

  async function translate(imageData) {
    setIsLoading(true);
    try {
      const response = await axios({
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        url: "https://transbraille.herokuapp.com/translate/",
        method: "POST",
        data: {
          braille: imageData
        }
      })

      if (response.data) {
        Alert.alert(response.data?.data.toString())
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error)
    }
  }

  function generatePlaceholderArray(length) {
    return Array.from({ length: length }, (v, k) => k + 1);
  }

  return (
    <View style={styles.container}>
      {isLoading ? <ActivityIndicator size="large" color={Theme.colors.primaryLight} /> : (
        <>
          <Input
            placeholder='input here'
            onChangeText={(text) => {
              setValueToShow(text);
              textRef.current = text
            }}
            containerStyle={{ marginTop: 50, display: showInput ? "flex" : "none" }}
            value={valueToShow}
          />
          <Camera ref={cameraRef} style={styles.camera} type={Camera.Constants.Type.back}>
            <View style={{ display: "flex", flexDirection: "row" }}>
              {[...generatePlaceholderArray(28)].map((_, idx) => (
                <View key={idx}>
                  {[...generatePlaceholderArray(7)].map((_, idx) => <View key={idx} style={styles.grid} />)}
                </View>
              ))}
            </View>
          </Camera>
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
        width: "100%",
    height: 300,
  },
  grid: {
    borderWidth: 1,
    borderColor: "white",
    width: Dimensions.get("window").width / 28,
    height: 360 / 8
  }
});
