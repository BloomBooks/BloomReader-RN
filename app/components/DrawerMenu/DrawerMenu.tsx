import React from "react";
import { SafeAreaView, View, Dimensions, Image } from "react-native";
import I18n from "../../i18n/i18n";
import DrawerMenuItem from "./DrawerMenuItem";
import { DrawerItemsProps } from "react-navigation";
import { Notes } from "../NotesScreen/NotesScreen";
import * as Share from "../../util/Share";
import * as ErrorLog from "../../util/ErrorLog";

interface IState {}

export default class DrawerMenu extends React.PureComponent<
  DrawerItemsProps,
  IState
> {
  render() {
    // Have the drawer cover most of the screen
    const drawerWidth = Dimensions.get("window").width - 16;
    // Image ratio is 600x156 pixels, adjust height to match width of drawer
    const imageHeight = (drawerWidth / 600) * 156;
    return (
      <SafeAreaView>
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
