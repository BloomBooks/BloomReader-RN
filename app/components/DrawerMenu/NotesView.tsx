import React from "react";
import { DrawerScreen } from "./Drawer";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Hyperlink from "react-native-hyperlink";
import ThemeColors from "../../util/ThemeColors";

interface IProps {
  drawerScreen: DrawerScreen;
  goBack: () => void;
}

export default function NotesView(props: IProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={props.goBack} style={styles.backButton}>
        <Icon name="md-arrow-back" size={36} />
      </TouchableOpacity>
      <ScrollView style={styles.scrollView}>
        <Hyperlink linkDefault={true} linkStyle={styles.link}>
          <Text style={styles.text}>{getText(props.drawerScreen)}</Text>
        </Hyperlink>
      </ScrollView>
    </View>
  );
}

function getText(drawerScreen: DrawerScreen): string {
  switch (drawerScreen) {
    case DrawerScreen.ReleaseNotes:
      return require("./release_notes").notes;
    case DrawerScreen.AboutBloomReader:
      return require("./about_reader").notes;
    case DrawerScreen.AboutBloom:
      return require("./about_bloom").notes;
    case DrawerScreen.AboutSIL:
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
