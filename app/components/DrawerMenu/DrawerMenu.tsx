import React from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Dimensions,
  Image
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import I18n from "../../i18n/i18n";
import DrawerMenuItem from "./DrawerMenuItem";
import { DrawerScreen } from "./Drawer";

interface IProps {
  setDrawerScreen: (screen: DrawerScreen) => void;
}

export default function DrawerMenu(props: IProps) {
  const drawerWidth = Dimensions.get("window").width - 16;
  const imageHeight = (drawerWidth / 600) * 156;
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../../assets/bloom-reader-against-dark.png")}
        style={{
          width: drawerWidth,
          height: imageHeight,
          backgroundColor: "black"
        }}
      />
      <DrawerMenuItem
        label={I18n.t("Receive books from computer")}
        iconName="md-wifi"
        onPress={() => {}}
      />
      <DrawerMenuItem
        label={I18n.t("Share Books")}
        iconName="md-share"
        onPress={() => {}}
      />
      <DrawerMenuItem
        label={I18n.t("Share Bloom Reader app")}
        iconName="md-share"
        onPress={() => {}}
      />
      <DrawerMenuItem
        label={I18n.t("Find Bloom books on this device")}
        iconSource={require("../../assets/bookshelf.png")}
        onPress={() => {}}
      />
      <View style={{ borderBottomWidth: 1, borderBottomColor: "gray" }} />
      <DrawerMenuItem
        label={I18n.t("Release Notes")}
        onPress={() => props.setDrawerScreen(DrawerScreen.ReleaseNotes)}
      />
      <DrawerMenuItem
        label={I18n.t("About Bloom Reader")}
        onPress={() => props.setDrawerScreen(DrawerScreen.AboutBloomReader)}
      />
      <DrawerMenuItem
        label={I18n.t("About Bloom")}
        onPress={() => props.setDrawerScreen(DrawerScreen.AboutBloom)}
      />
      <DrawerMenuItem
        label={I18n.t("About SIL")}
        onPress={() => props.setDrawerScreen(DrawerScreen.AboutSIL)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {}
});
