import React from "react";
import { Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import Hyperlink from "react-native-hyperlink";
import ThemeColors from "../../util/ThemeColors";
import { NavigationScreenProp } from "react-navigation";

export enum Notes {
  ReleaseNotes,
  AboutBloomReader,
  AboutBloom,
  AboutSIL
}

interface IProps {
  navigation: NavigationScreenProp<any, any>;
}

interface IState {}

export default class NotesScreen extends React.PureComponent<IProps, IState> {
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Hyperlink linkDefault={true} linkStyle={styles.link}>
            <Text style={styles.text}>
              {getText(this.props.navigation.getParam("notes"))}
            </Text>
          </Hyperlink>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

function getText(notes: Notes): string {
  switch (notes) {
    case Notes.ReleaseNotes:
      return require("./release_notes").notes;
    case Notes.AboutBloomReader:
      return require("./about_reader").notes;
    case Notes.AboutBloom:
      return require("./about_bloom").notes;
    case Notes.AboutSIL:
    default:
      return require("./about_sil").notes;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12
  },
  scrollView: {
    flex: 1
  },
  backButton: {
    marginVertical: 8
  },
  text: {
    fontSize: 16
  },
  link: {
    color: ThemeColors.red
  }
});
