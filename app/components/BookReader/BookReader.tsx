import React from "react";
import { SafeAreaView, Text, NativeSyntheticEvent } from "react-native";
import * as BookStorage from "../../util/BookStorage";
import { WebView, WebViewMessage } from "react-native-webview";
import { NavigationScreenProp } from "react-navigation";
import { DrawerLocker } from "../DrawerMenu/DrawerLocker";
import Analytics from "@segment/analytics-react-native";

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
    // (BloomPlayer currently assumes that the book has the same name as the folder.
    // If we change this we can stop renaming it.)
    await BookStorage.moveBook();
    this.setState({ bookReady: true });
  }

  // The source here loads in the bloom-player-react code to display the book
  // in the indicated folder. Since the player code lives in a file in the
  // assets folder, we have to specify a baseUrl that contains it.
  // (Even with all the flags I've set allowing cross-domain stuff, which
  // needs research to make sure it's not dangerous, omitting the baseUrl
  // and setting the src of the bundle to file:///android_asset/bloom-player/bloomPlayerControlBundle.js)
  // does not work...we get errors saying we don't have permission to load it.)
  // Since the player loads the book's HTML from a file:/// url
  // in yet another domain, and then proceeds to
  // similarly load images and other resources from that folder, we are still violating
  // cross-domain rules. However, WebView allows us to turn some of them off. I'm not sure
  // all the properties used here are necessary to prevent problems, but probably
  // at least some of them are.
  render() {
    const bookUrl = BookStorage.openBookFolderPath();
    return (
      <SafeAreaView style={{ flex: 1 }}>
        {this.state.bookReady && (
          <WebView
            source={{
              uri: `file:///android_asset/bloom-player/webView.htm?url=${bookUrl}`
            }}
            mixedContentMode="always"
            allowUniversalAccessFromFileURLs={true}
            allowFileAccess={true}
            javaScriptEnabled={true}
            originWhitelist={["*"]}
            onMessage={event => this.onAnalyticsEvent(event)}
          />
        )}
        <DrawerLocker
          setDrawerLockMode={this.props.screenProps.setDrawerLockMode}
        />
      </SafeAreaView>
    );
  }

  onAnalyticsEvent(event: NativeSyntheticEvent<WebViewMessage>) {
    console.log(event);
    try {
      // One reason for the try...catch is that at startup we get a completely spurious
      // message, the source of which I have not been able to track down.
      // However, since it doesn't have at all the data format we expect, the try...catch
      // happily ignores it. But in any case, it's not worth crashing over a failure
      // to send analytics.
      const data = JSON.parse(event.nativeEvent.data);
      const eventName = data.event;
      const params = data.params;
      params.title = this.book().title;
      Analytics.track(eventName, params);
    } catch(ex) {
      console.log(ex);
    }

  }
}


