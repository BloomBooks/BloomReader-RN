import React from "react";
import { SafeAreaView, View, Dimensions, Image, Text } from "react-native";
import I18n from "../../i18n/i18n";
import DrawerMenuItem from "./DrawerMenuItem";
import { DrawerItemsProps } from "react-navigation";
import { Notes } from "../NotesScreen/NotesScreen";
import * as Share from "../../util/Share";
import * as ErrorLog from "../../util/ErrorLog";
import VersionNumber from "react-native-version-number";

interface IState {}

export default class DrawerMenu extends React.PureComponent<
  DrawerItemsProps,
  IState
> {
  render() {
    // Have the drawer cover most of the screen
    const drawerWidth = Dimensions.get("window").width - 16;
    // We only want the logo to be about 2/3 of that width
    let imageWidth = (drawerWidth / 3) * 2;
    // Image ratio is 600x156 pixels; adjust height to match width of drawer
    let imageHeight = (imageWidth / 600) * 156;

    return (
      <SafeAreaView>
        <View style={{ backgroundColor: "black", padding: 10 }}>
          <Image
            source={require("../../assets/bloom-reader-against-dark.png")}
            style={{
              width: imageWidth,
              height: imageHeight
            }}
          />
          <Text style={{ color: "white" }}>{VersionNumber.appVersion}</Text>
        </View>
        <DrawerMenuItem
          label={I18n.t("Receive books from computer")}
          iconName="md-wifi"
          onPress={() => {
            this.props.navigation.navigate("ReceiveFromWifiScreen");
          }}
        />
        <DrawerMenuItem
          label={I18n.t("Share Books")}
          iconName="md-share"
          onPress={() => {
            Share.shareAll();
            this.props.navigation.closeDrawer();
          }}
        />
        <DrawerMenuItem
          label={I18n.t("Share Bloom Reader app")}
          iconName="md-share"
          onPress={() => {
            Share.shareApp();
            this.props.navigation.closeDrawer();
          }}
        />
        <View style={{ borderBottomWidth: 1, borderBottomColor: "gray" }} />
        <DrawerMenuItem
          label={I18n.t("Release Notes")}
          onPress={() =>
            this.props.navigation.navigate("NotesScreen", {
              notes: Notes.ReleaseNotes
            })
          }
        />
        <DrawerMenuItem
          label={I18n.t("About Bloom Reader")}
          onPress={() =>
            this.props.navigation.navigate("NotesScreen", {
              notes: Notes.AboutBloomReader
            })
          }
        />
        <DrawerMenuItem
          label={I18n.t("About Bloom")}
          onPress={() =>
            this.props.navigation.navigate("NotesScreen", {
              notes: Notes.AboutBloom
            })
          }
        />
        <DrawerMenuItem
          label={I18n.t("About SIL")}
          onPress={() =>
            this.props.navigation.navigate("NotesScreen", {
              notes: Notes.AboutSIL
            })
          }
        />
        <DrawerMenuItem
          label={I18n.t("Email Error Log")}
          onPress={() => {
            ErrorLog.emailLog();
            this.props.navigation.closeDrawer();
          }}
        />
      </SafeAreaView>
    );
  }
}
