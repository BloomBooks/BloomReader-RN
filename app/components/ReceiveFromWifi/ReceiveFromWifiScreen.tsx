import React from "react";
import {
  SafeAreaView,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { NavigationScreenProp, NavigationEvents } from "react-navigation";
import { DrawerLocker } from "../DrawerMenu/DrawerLocker";
import * as GetFromWifiModule from "../../native_modules/GetFromWifiModule";
import ThemeColors from "../../util/ThemeColors";
import I18n from "../../i18n/i18n";
import ProgressSpinner from "../shared/ProgressSpinner";

interface IProps {
  navigation: NavigationScreenProp<any, any>;
  screenProps: {
    setDrawerLockMode: () => {};
  };
}

interface IState {
  currentProgressMessage: string;
  progressHistory: string;
}

export default class ReceiveFromWifiScreen extends React.PureComponent<
  IProps,
  IState
> {
  progressListener?: GetFromWifiModule.ProgressListener;

  constructor(props: IProps) {
    super(props);
    this.state = {
      currentProgressMessage: "",
      progressHistory: ""
    };
  }

  render() {
    return (
      <SafeAreaView style={styles.screen}>
        <ProgressSpinner />
        <View style={styles.contentsContainer}>
          <ScrollView style={styles.scroll}>
            <Text style={[styles.text, styles.currentMessageText]}>
              {this.state.currentProgressMessage}
            </Text>
            <Text style={styles.text}>{this.state.progressHistory}</Text>
          </ScrollView>
          <View style={styles.btnContainer}>
            <Button
              onPress={() => this.props.navigation.navigate("BookList")}
              title={I18n.t("OK")}
              color={ThemeColors.red}
            />
          </View>
        </View>
        <NavigationEvents
          onDidFocus={() => {
            this.progressListener = GetFromWifiModule.startWifiReceiver(
              (message: string) => {
                this.setState(prevState => ({
                  currentProgressMessage: message,
                  progressHistory:
                    prevState.currentProgressMessage +
                    "\n\n" +
                    prevState.progressHistory
                }));
              }
            );
          }}
          onWillBlur={() => {
            this.progressListener && this.progressListener.stopListening();
          }}
        />

        <DrawerLocker
          setDrawerLockMode={this.props.screenProps.setDrawerLockMode}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  contentsContainer: {
    flex: 1,
    padding: 12
  },
  scroll: {
    flex: 1
  },
  text: {
    fontSize: 18
  },
  currentMessageText: {
    fontWeight: "bold",
    marginBottom: 12
  },
  btnContainer: {
    alignSelf: "flex-end"
  }
});
