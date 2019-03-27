import React from "react";
import { SafeAreaView, Text } from "react-native";
import * as BookStorage from "../../util/BookStorage";
import { WebView } from "react-native-webview";
import { NavigationScreenProp } from "react-navigation";
import { DrawerLocker } from "../DrawerMenu/DrawerLocker";

export interface IProps {
  navigation: NavigationScreenProp<any, any>;
  screenProps: {
    setDrawerLockMode: () => {};
  };
}

export interface IState {
  bookPath?: string;
  bookReady?: boolean;
}

export default class BookReader extends React.PureComponent<IProps, IState> {
  state: IState = {};

  private book = () => this.props.navigation.getParam("book");

  async componentDidMount() {
    const bookPath = await BookStorage.openBookForReading(this.book());
    this.setState({ bookPath: bookPath });
    this.loadBook();
  }

  async loadBook() {
    // book is now called openBook.htm in temp folder.
    // (We are taking advantage of bloom-player's assumption that the htm file has the
    // same name as the folder. Although it's a slight nuisance to have to rename it,
    // it means that the book we want to play is always at the same exact location,
    // so we don't have to come up with a mechanism to pass the html file path to
    // the player.)
    await BookStorage.moveBook();
    this.setState({ bookReady: true });
  }

  // The player-webview.htm file loads in the bloom-player-react code to display the book
  // in the indicated folder. Since the player loads the book's HTML from a file:/// url
  // not in the assets folder where player-webview.htm lives, and then proceeds to
  // similarly load images and other resources from that folder, we are violating
  // cross-domain rules. However, WebView allows us to turn that off. I'm not sure
  // all the properties used here are necessary to prevent problems, but probably
  // at least some of them are.
  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        {this.state.bookReady && (
          <WebView source={{ uri: "file:///android_asset/bloom-player/player-webview.htm" }}
            mixedContentMode="always"
            allowUniversalAccessFromFileURLs={true}
            allowFileAccess={true}
            javaScriptEnabled={true}
            />
        )}
        <DrawerLocker
          setDrawerLockMode={this.props.screenProps.setDrawerLockMode}
        />
      </SafeAreaView>
    );
  }
}
