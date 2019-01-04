import React from "react";
import { Platform, Text } from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import BookList from "./components/BookList/BookList";
import BookReader from "./components/BookReader/BookReader";
import ThemeColors from "./util/ThemeColors";

const isIOS = Platform.OS == "ios";

const RootStack = createAppContainer(
  createStackNavigator(
    {
      BookList: BookList,
      BookReader: BookReader
    },
    {
      initialRouteName: "BookList",
      defaultNavigationOptions: {
        title: "Bloom Reader",
        headerStyle: {
          backgroundColor: ThemeColors.red
        },
        headerTintColor: "white",
        headerTruncatedBackTitle: ""
      }
    }
  )
);

export default class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false
    };
  }

  async componentDidMount() {
    // await checkVersionAndDoUpdates();  // Add this back in to run startup tasks
    this.setState({ loaded: true });
    //SplashScreen.hide();  // Add this back in with the splash screen
  }

  render() {
    return this.state.loaded ? <RootStack /> : <Text>"Loading.."</Text>;
  }
}
