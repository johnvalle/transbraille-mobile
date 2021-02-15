import React from 'react'
import { ImageBackground, View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";

import Theme from "../Theme";

export default function Dashboard({ navigation }) {
  return (
    <ImageBackground source={require("../assets/bg.png")} style={{ width: '100%', height: '100%' }}>
      <View style={styles.wrapper}>
        <Pressable style={styles.container} onPress={() => navigation.navigate("Camera")}>
          <View>
            <Icon
              name="aperture"
              type="feather"
              size={30}
              color={Theme.colors.white}
            />
            <Text style={styles.mainTitle}>Translate a braille</Text>
            <Text style={styles.mainSubtitle}>Capture an image of a braille and we’ll translate it for you</Text>
          </View>
        </Pressable>
        <Pressable style={styles.dbContainer} onPress={() =>  navigation.navigate("BrailleText")}>
          <View>
            <Icon
              name="database"
              type="feather"
              size={24}
              color={Theme.colors.primaryDark}
            />
            <Text style={styles.dbTitle}>View Braille to Text Database</Text>
            <Text style={styles.dbSubtitle}>See how words, numbers, and letters are converted to braille.</Text>
          </View>
        </Pressable>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.primaryDark,
    borderRadius: 16,
    width: 350,
    padding: 30,
    marginBottom: 12,
    elevation: 2
  },
  dbContainer: {
    backgroundColor: Theme.colors.white,
    borderRadius: 16,
    width: 350,
    padding: 20,
    elevation: 2
  },
  dbTitle: {
    color: Theme.colors.primaryDark,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
    marginVertical: 8
  },
  dbSubtitle: {
    color: Theme.colors.primaryLight,
    fontWeight: "200",
    textAlign: "center",
    fontSize: 12
  },
  mainTitle: {
    color: Theme.colors.white,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 24,
    marginVertical: 8
  },
  mainSubtitle: {
    color: Theme.colors.white,
    fontWeight: "200",
    textAlign: "center",
    fontSize: 16
  },
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
})