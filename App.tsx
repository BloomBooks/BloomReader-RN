import React from "react";
import { Text } from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import BookList from "./app/components/BookList/BookList";
import BookReader from "./app/components/BookReader/BookReader";
import ThemeColors from "./app/util/ThemeColors";
import startupTasks from "./app/util/startupTasks";
import I18n from "./app/i18n/i18n";

const RootStack = createAppContainer(
  createStackNavigator(
    {
      BookList: BookList,
      BookReader: BookReader
    },
    {
      initialRouteName: "BookList",
      defaultNavigationOptions: {
        title: I18n.t("Bloom Reader"),
        headerStyle: {
          backgroundColor: ThemeColors.red
        },
        headerTintColor: "white",
        headerTruncatedBackTitle: ""
      }
    }
  )
);

export interface State {
  loaded?: boolean
}

export default class App extends React.PureComponent<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      loaded: false
    };
  }

  async componentDidMount() {
    await startupTasks();
    this.setState({ loaded: true });
    //SplashScreen.hide();  // Add this back in with the splash screen
  }

  render() {
    return this.state.loaded ? <RootStack /> : <Text>Loading..</Text>;
  }
}
