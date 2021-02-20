import React from 'react';
import axios from "axios"
import { StyleSheet, Text, View, Alert, Dimensions, ActivityIndicator} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera } from "expo-camera"
import { Button } from "react-native-elements";
import Slider from '@react-native-community/slider';

import Theme from '../Theme';

export default function CameraScreen({ navigation }) {
  const [hasPermission, setHasPermission] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [topGrid, setTopGrid] = React.useState(28);
  const [bottomGrid, setBottomGrid] = React.useState(10)

  const cameraRef = React.useRef();

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

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
            type="clear"
            icon={{
              name: "settings",
              type: "feather",
              color: "black"
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

        translate(manipulatedImg.base64)
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
        {showSettings ? (
          <>
            <Text>{topGrid}x{bottomGrid}</Text>
            <Slider
              style={{ width: 200, height: 40 }}
              minimumValue={1}
              maximumValue={30}
              minimumTrackTintColor="green"
              maximumTrackTintColor="black"
              step={1}
              value={topGrid}
              onValueChange={(val) => setTopGrid(val)}
            />
            <Slider
              style={{ width: 200, height: 40 }}
              minimumValue={1}
              maximumValue={20}
              minimumTrackTintColor="green"
              maximumTrackTintColor="black"
              step={1}
              value={bottomGrid}
              onValueChange={(val) => setBottomGrid(val)}
            />
          </>
        ):(
          <Camera ref={cameraRef} style={styles.camera} type={Camera.Constants.Type.back}>
            <View style={{ display: "flex", flexDirection: "row" }}>
              {[...generatePlaceholderArray(topGrid)].map((_, idx) => (
                <View key={idx}>
                  {[...generatePlaceholderArray(bottomGrid)].map((_, idx) => <View key={idx} style={{
                    borderWidth: 1,
                    borderColor: "white",
                    width: Dimensions.get("window").width / topGrid,
                    height: 360 / (bottomGrid + 2)
                  }} />)}
                </View>
              ))}
            </View>
          </Camera>
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
    width: "100%",
    height: 300,
  },
  grid: {
    borderWidth: 1,
    borderColor: "white",
    width: Dimensions.get("window").width / 28,
    height: 360 / 12
  }
});
