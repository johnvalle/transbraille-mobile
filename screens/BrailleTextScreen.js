import React from 'react'
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from "react-native"; 
import { ButtonGroup } from "react-native-elements";
import axios from "axios";
import Theme from '../Theme';

export default function BrailleTextScreen() {
  const [data, setData] = React.useState([]);
  const [selectedIdx, setSelectedIdx] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  async function fetchDB(query) {
    const response = await axios({
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      url: `https://transbraille.herokuapp.com/transbraille?q=${query}`,
      method: "GET",
    });
    return response;
  }

  React.useEffect(() => {
    (async () => {
      setIsLoading(true);
      const toFetch = ["letter", "number", "word"];
      const response = await fetchDB(toFetch[selectedIdx]);
      console.log(response.data)
      setData(response.data?.data);
      setIsLoading(false);
    })();
  }, [selectedIdx])

  return (
    <>
      <ButtonGroup
        onPress={(idx) => setSelectedIdx(idx)}
        selectedIndex={selectedIdx}
        buttons={["Letters", "Numbers", "Words"]}
        containerStyle={{ height: 40 }}
      />
      <View style={styles.container}>

        {isLoading ? <ActivityIndicator size="large" color={Theme.colors.primaryLight} /> : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data?.length > 0 && data.map(({ fields, pk }) => (
              <View style={styles.card} key={pk}>
                <View style={{ alignSelf: "flex-end" }}>
                  <View style={styles.row}>
                    <View style={[styles.circle, fields?.braille.split("")[0] === "1" ? styles.shaded : {}]}></View>
                    <View style={[styles.circle, fields?.braille.split("")[1] === "1" ? styles.shaded : {}]}></View>
                  </View>
                  <View style={styles.row}>
                    <View style={[styles.circle, fields?.braille.split("")[2] === "1" ? styles.shaded : {}]}></View>
                    <View style={[styles.circle, fields?.braille.split("")[3] === "1" ? styles.shaded : {}]}></View>
                  </View>
                  <View style={styles.row}>
                    <View style={[styles.circle, fields?.braille.split("")[4] === "1" ? styles.shaded : {}]}></View>
                    <View style={[styles.circle, fields?.braille.split("")[5] === "1" ? styles.shaded : {}]}></View>
                  </View>
                </View>
                <View>
                  <Text style={styles.title}>{fields?.text}</Text>
                  <Text style={styles.subtitle}>{fields?.braille}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  card: {
    height: 150,
    minWidth: 120,
    backgroundColor: Theme.colors.white,
    marginRight: 16,
    borderRadius: 12,
    padding: 12,
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "column"
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: Theme.colors.primaryDark
  },
  row: {
    display: "flex",
    flexDirection: "row"
  },
  circle: {
    width: 15,
    height: 15,
    borderRadius: 50,
    backgroundColor: Theme.colors.gray,
    margin: 2
  },
  shaded: {
    backgroundColor: Theme.colors.primaryDark,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "normal",
    color: Theme.colors.primaryLight
  },
})