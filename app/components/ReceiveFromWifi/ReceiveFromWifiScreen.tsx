import React from "react";
import { SafeAreaView, Text, Button } from "react-native";
import { NavigationScreenProp, NavigationEvents } from "react-navigation";
import { DrawerLocker } from "../DrawerMenu/DrawerLocker";
import * as GetFromWifiModule from "../../native_modules/GetFromWifiModule";

interface IProps {
  navigation: NavigationScreenProp<any, any>;
  screenProps: {
    setDrawerLockMode: () => {};
  };
}

interface IState {
  progress: string;
}

export default class ReceiveFromWifiScreen extends React.PureComponent<
  IProps,
  IState
> {
  progressListener?: GetFromWifiModule.ProgressListener;

  constructor(props: IProps) {
    super(props);
    this.state = {
      progress: ""
    };
  }

  render() {
    return (
      <SafeAreaView>
        <Text>This is the receive from wifi screen</Text>
        <Text>{this.state.progress}</Text>
        <Button
          onPress={() => this.props.navigation.navigate("BookList")}
          title="Done"
        />
        <NavigationEvents
          onDidFocus={() => {
            this.progressListener = GetFromWifiModule.startWifiReceiver(
              (message: string) => {
                this.setState(prevState => ({
                  progress: message + "\n\n" + prevState.progress
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
