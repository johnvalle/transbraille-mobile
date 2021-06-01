import React from 'react'
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from "react-native"; 
import { ButtonGroup, CheckBox } from "react-native-elements";
import axios from "axios";
import Theme from '../Theme';

export default function BrailleTextScreen() {
  const [data, setData] = React.useState([]);
  const [selectedIdx, setSelectedIdx] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [language, setLanguage] = React.useState("eng");
  async function fetchDB(query) {
    const response = await axios({
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      url: `http://192.168.0.18:8000/transbraille?q=${query}&lang=${language}`,
      method: "GET",
    });
    return response;
  }

  function sortAlphabetically (a, b) {
    return a?.fields?.text < b?.fields?.text ? -1 : (a?.fields?.text > b?.fields?.text ? 1 : 0)
  }

  function renderCard(fields, pk) {
    return (
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
    )
  }

  async function update(idx) {
    setIsLoading(true);
    const toFetch = ["letter", "number", "word"];
    const response = await fetchDB(toFetch[idx]);
    setData(response.data?.data);
    setIsLoading(false);
  }

  React.useEffect(() => {
    update(selectedIdx)
  }, [])

  React.useEffect(() => {
    update(selectedIdx)
  }, [language])

  return (
    <>
      <ButtonGroup
        onPress={(idx) => {
          update(idx);
          setSelectedIdx(idx)
        }}
        selectedIndex={selectedIdx}
        buttons={["Letters", "Numbers", "Words"]}
        containerStyle={{ height: 40 }}
      />
      {selectedIdx === 2 && (
        <View>
          <CheckBox
            center
            title='English'
            checkedIcon='dot-circle-o'
            uncheckedIcon='circle-o'
            checked={language === "eng"}
            onPress={() => setLanguage("eng")}
          />
          <CheckBox
            center
            title='Filipino'
            checkedIcon='dot-circle-o'
            uncheckedIcon='circle-o'
            checked={language === "fil"}
            onPress={() => setLanguage("fil")}
          />
        </View>
      )}
      <ScrollView>
        <View style={styles.container}>
          {isLoading ? <ActivityIndicator size="large" color={Theme.colors.primaryLight} /> : (
            data?.length > 0 && (selectedIdx === 0 || selectedIdx === 2) ? data.sort(sortAlphabetically).map(({ fields, pk }) => renderCard(fields, pk)) : data.map(({ fields, pk }) => renderCard(fields, pk))
          )}
        </View>
    </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  card: {
    height: 150,
    width: 120,
    backgroundColor: Theme.colors.white,
    margin: 16,
    borderRadius: 12,
    padding: 12,
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "column"
  },
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    padding: 20
  },
  title: {
    fontSize: 24,
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