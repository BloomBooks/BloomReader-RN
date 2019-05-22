import React from "react";
import { SafeAreaView, NativeSyntheticEvent, StatusBar } from "react-native";
import { WebView, WebViewMessage } from "react-native-webview";
import * as BookStorage from "../../storage/BookStorage";
import { NavigationScreenProp } from "react-navigation";
import { DrawerLocker } from "../DrawerMenu/DrawerLocker";
import * as BRAnalytics from "../../util/BRAnalytics";
import * as ErrorLog from "../../util/ErrorLog";
import { getBookViewerTranslationPairs } from "../../i18n/i18n";
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
  private webview: WebView | null = null;

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

  // Hide the header bar
  static navigationOptions = () => ({
    header: null
  });

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
        <StatusBar hidden={true} />
        {this.state.bookReady && (
          <WebView
            ref={ref => (this.webview = ref)}
            source={{
              uri: `file:///android_asset/bloom-player/webView.htm?url=${bookUrl}`
            }}
            mixedContentMode="always"
            allowUniversalAccessFromFileURLs={true}
            allowFileAccess={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={["*"]}
            onMessage={event => this.onMessageReceived(event)}
            onLoad={() => this.sendInitializationDataToBookViewer()}
          />
        )}
        <DrawerLocker
          setDrawerLockMode={this.props.screenProps.setDrawerLockMode}
        />
      </SafeAreaView>
    );
  }

  onMessageReceived(event: NativeSyntheticEvent<WebViewMessage>) {
    try {
      if (!event.nativeEvent || !event.nativeEvent.data) {
        // At startup we get a completely spurious
        // message, the source of which I have not been able to track down.
        // However, since it doesn't have any data format we expect, we can easily ignore it.
        return;
      }

      const data = JSON.parse(event.nativeEvent.data);
      if (data.messageType === "sendAnalytics") {
        this.onAnalyticsEvent(data);
      } else if (data.messageType === "logError") {
        ErrorLog.logError({
          logMessage: data.message
        });
      } else {
        ErrorLog.logError({
          logMessage:
            "BookReader.onMessageReceived() does not understand the messageType on this event: " +
            event
        });
      }
      // Next step: should also handle message type storePageData. The data object will also
      // have a key and a value, both strings. We need to store them somewhere that will
      // (at least) survive rotating the phone, and ideally closing and re-opening the book;
      // but it should NOT survive downloading a new version of the book. Whether there's some
      // other way to get rid of it (for testing, or for a new reader) remains to be decided.
      // Once the data is stored, it needs to become part of the reader startup to give it
      // back to the reader using window.sendMessage(). BloomPlayer is listening for a message
      // with messageType restorePageData and pageData an object whose fields are the key/value
      // pairs passed to storePageData. See the event listener in boom-player's externalContext
      // file.
    } catch (e) {
      ErrorLog.logError({
        logMessage:
          "BookReader.onMessageReceived() does not understand this event: " + e
      });
    }
  }

  // Handle an anlytics event. data is the result of parsing the json received
  // in the message. It should have properties event and params, the analytics
  // event to track and the params to send.
  onAnalyticsEvent(data: any) {
    try {
      const eventName = data.event;
      const params = data.params;
      if (eventName === "comprehension") {
        // special case gets converted to match legacy comprehension question analytics
        BRAnalytics.track("Questions correct", {
          questionCount: params.possiblePoints,
          rightFirstTime: params.actualPoints,
          percentRight: params.percentRight,
          title: this.book().title
        });
      } else {
        params.title = this.book().title;
        BRAnalytics.track(eventName, params);
      }
    } catch (ex) {
      ErrorLog.logError({
        logMessage: "BookReader.onAnalyticsEvent error: " + ex
      });
    }
  }

  sendInitializationDataToBookViewer(): void {
    if (this.webview) {
      const initializationData = JSON.stringify({
        messageType: "initializationData",
        l10nData: getBookViewerTranslationPairs()
      });
      this.webview.postMessage(initializationData);
    }
  }
}
