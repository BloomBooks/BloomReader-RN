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
import {
  BookCollection,
  emptyBookCollection
} from "./app/models/BookCollection";
import * as BookStorage from "./app/util/BookStorage";
import SplashScreen from "react-native-splash-screen";

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
        backgroundColor: ThemeColors.bloomRed
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
  bookCollection: BookCollection;
}

export default class App extends React.PureComponent<any, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      loaded: false,
      drawerLockMode: "unlocked",
      bookCollection: emptyBookCollection()
    };
  }

  async componentDidMount() {
    // SplashScreen.hide(); // Uncomment when debugging issues opening the app
    await startupTasks();
    this.setState({ loaded: true });
    const bookCollection = await BookStorage.getBookCollection();
    this.setState({ bookCollection });
    SplashScreen.hide();
  }

  render() {
    return this.state.loaded ? (
      <AppContainer
        screenProps={{
          bookCollection: this.state.bookCollection,
          setBookCollection: (bookCollection: BookCollection) =>
            this.setState({ bookCollection }),
          drawerLockMode: this.state.drawerLockMode,
          setDrawerLockMode: (lockMode: "unlocked" | "locked-closed") =>
            this.setState({ drawerLockMode: lockMode })
        }}
      />
    ) : (
      // The Splash Screen is displayed until state.loaded is set
      <Text> </Text>
    );
  }
}
