import React from "react";
import { Text, Dimensions } from "react-native";
import {
  createStackNavigator,
  createAppContainer,
  createDrawerNavigator
} from "react-navigation";
import BookList from "./app/components/BookList/BookList";
import BookReader from "./app/components/BookReader/BookReader";
import ThemeColors from "./app/util/ThemeColors";
import startupTasks from "./app/util/startupTasks";
import I18n from "./app/i18n/i18n";
import DrawerMenu from "./app/components/DrawerMenu/DrawerMenu";
import NotesScreen from "./app/components/NotesScreen/NotesScreen";
import ReceiveFromWifiScreen from "./app/components/ReceiveFromWifi/ReceiveFromWifiScreen";

const StackNavigator = createStackNavigator(
  {
    BookList: BookList,
    BookReader: BookReader,
    NotesScreen: NotesScreen,
    ReceiveFromWifiScreen: ReceiveFromWifiScreen
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
);

const DrawerNavigator = createDrawerNavigator(
  { StackNavigator: StackNavigator },
  {
    contentComponent: DrawerMenu,
    drawerWidth: Dimensions.get("window").width - 16
  }
);

// The StackNavigator is nested inside the DrawerNavigator
// This works better and enables the drawer to use the full height of the screen
const AppContainer = createAppContainer(DrawerNavigator);

export interface IState {
  loaded: boolean;
  drawerLockMode: "unlocked" | "locked-closed";
}

export default class App extends React.PureComponent<any, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      loaded: false,
      drawerLockMode: "unlocked"
    };
  }

  async componentDidMount() {
    await startupTasks();
    this.setState({ loaded: true });
    //SplashScreen.hide();  // Add this back in with the splash screen
  }

  render() {
    return this.state.loaded ? (
      <AppContainer
        screenProps={{
          drawerLockMode: this.state.drawerLockMode,
          setDrawerLockMode: (lockMode: "unlocked" | "locked-closed") =>
            this.setState({ drawerLockMode: lockMode })
        }}
      />
    ) : (
      <Text>Loading..</Text>
    );
  }
}
