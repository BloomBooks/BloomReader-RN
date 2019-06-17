import React from "react";
import {
  SafeAreaView,
  NativeSyntheticEvent,
  StatusBar,
  AppState,
  AppStateStatus
} from "react-native";
import { WebView, WebViewMessage } from "react-native-webview";
import * as BookStorage from "../../storage/BookStorage";
import { NavigationScreenProp, NavigationEvents } from "react-navigation";
import { DrawerLocker } from "../DrawerMenu/DrawerLocker";
import * as BRAnalytics from "../../util/BRAnalytics";
import * as ErrorLog from "../../util/ErrorLog";
export interface IProps {
  navigation: NavigationScreenProp<any, any>;
  screenProps: {
    setDrawerLockMode: () => {};
  };
}

export interface IState {
  bookPath?: string;
  bookReady?: boolean;
  appState: AppStateStatus;
}

export default class BookReader extends React.PureComponent<IProps, IState> {
  state: IState = {
    appState: AppState.currentState
  };

  private book = () => this.props.navigation.getParam("book");

  // Values in this group are reported to us by the player using bookStats
  private webview: WebView | null = null;
  private totalNumberedPages = 0; // found in book
  private questionCount = 0; // comprehension questions found in book
  private contentLang = ""; // main vernacular language of book
  private features: string = ""; // combination of blind, talkingBook, signLanguage, motion

  // values in this group are derived from the pageShown event (from the player)
  private audioPages = 0; // number of audio pages user has displayed
  private nonAudioPages = 0; // number of non-audio pages user has displayed
  private lastNumberedPageRead = false; // has user read to last numbered page?

  async componentDidMount() {
    const bookPath = await BookStorage.openBookForReading(this.book());
    this.setState({ bookPath: bookPath });
    this.loadBook();
    AppState.addEventListener("change", this.onAppStateChange);
  }

  private onAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState !== "active") {
      // We only get the navigation blur event when navigating within the app.
      // If the whole app gets paused while we're active, we trigger it this way.
      this.onWillBlur();
    }
  };

  // Triggered by NavigationEvents element (in Render) for navigation inside the app
  // (e.g., back from book to home screen, either using our own control or the hardware
  // back button). Triggered by onAppStateChange if the whole app blurs while this
  // activity is in focus. This means we might get two events for the same book-reading,
  // if the whole app is paused, then resumed, then we return to home screen. Or even
  // several, if the app is repeatedly paused. My thinking is that this is better than
  // missing the event altogether if the app is not resumed before something shuts it
  // down. If necessary we could pick out the last one of these events corresponding to a
  // a single BookOrShelf opened event.
  private onWillBlur() {
    // app is going to close or pause
    var book = this.book();
    var args = {
      title: book.title,
      audioPages: this.audioPages,
      nonAudioPages: this.nonAudioPages,
      totalNumberedPages: this.totalNumberedPages,
      lastNumberedPageRead: this.lastNumberedPageRead,
      questionCount: this.questionCount,
      contentLang: this.contentLang,
      features: this.features,
      brandingProjectName: book.brandingProjectName
    };
    if (!book.brandingProjectName) {
      delete args.brandingProjectName;
    }
    BRAnalytics.reportPagesRead(args);
  }

  async componentWillUnmount() {
    AppState.removeEventListener("change", this.onAppStateChange);
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
        <NavigationEvents onWillBlur={payload => this.onWillBlur()} />
        <StatusBar hidden={true} />
        {this.state.bookReady && (
          <WebView
            source={{
              uri: `file:///android_asset/bloom-player/webView.htm?url=${bookUrl}`
            }}
            mixedContentMode="always"
            allowUniversalAccessFromFileURLs={true}
            allowFileAccess={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={["*"]}
            ref={ref => (this.webview = ref)}
            onMessage={event => this.onMessageReceived(event)}
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
      switch (data.messageType) {
        case "sendAnalytics":
          this.onAnalyticsEvent(data);
          break;
        case "logError":
          ErrorLog.logError({
            logMessage: data.message
          });
          break;
        case "requestCapabilities":
          this.webview!.postMessage(
            JSON.stringify({ messageType: "capabilities", canGoBack: true })
          );
          break;
        case "backButtonClicked":
          this.props.navigation.goBack();
          break;
        case "bookStats":
          this.onBookStats(data);
          break;
        case "pageShown":
          this.onPageShown(data);
          break;
        default:
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
          "BookReader.onMessageReceived() does not understand this event: " +
          event.nativeEvent.data
      });
    }
  }

  onPageShown(data: any) {
    this.lastNumberedPageRead =
      this.lastNumberedPageRead || data.lastNumberedPage;
    if (data.pageHasAudio) {
      this.audioPages++;
    } else {
      this.nonAudioPages++;
    }
  }

  onBookStats(data: any) {
    this.totalNumberedPages = data.totalNumberedPages;
    this.questionCount = data.questionCount;
    this.contentLang = data.contentLang;
    var book = this.book();
    if (book.bloomdVersion > 0) {
      this.features = book.features.join(",");
    } else {
      this.features =
        (data.blind ? "blind," : "") +
        (data.signLanguage ? "signLanguage," : "") +
        (data.talkingBook ? "talkingBook," : "") +
        (data.motion ? "motion," : "");
      if (this.features) {
        this.features = this.features.substring(0, this.features.length - 1);
      }
    }
    var args = {
      title: book.title,
      totalNumberedPages: this.totalNumberedPages,
      questionCount: this.questionCount,
      contentLang: this.contentLang,
      features: this.features,
      brandingProjectName: book.brandingProjectName
    };
    if (!book.brandingProjectName) {
      delete args.brandingProjectName;
    }
    BRAnalytics.reportLoadBook(args);
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
}
