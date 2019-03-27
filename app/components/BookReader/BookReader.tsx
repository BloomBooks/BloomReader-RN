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
          <WebView source={{ baseUrl: "file:///android_asset/",
            html: "<!DOCTYPE html>\
            <html>\
          <head>\
          </head>\
          <body>\
           <!--This is the root element of the React DOM. The class identifies it to applyToMarkedElements()\
              and the data-url tells the bloom-player where to find the data. -->\
           <div class='bloom-player-controls' data-url='" + bookUrl + "'>Didn't get converted</div>\
           <script onload='BloomPlayer.BloomPlayerControls.applyToMarkedElements();\
            BloomPlayer.BloomPlayerControls.scalePageToWindow();'\
            src='bloom-player/bloomPlayerControlBundle.js' type='text/javascript'></script>\
          </body>\
          </html>" }}
            mixedContentMode="always"
            allowUniversalAccessFromFileURLs={true}
            allowFileAccess={true}
            javaScriptEnabled={true}
            originWhitelist={['*']}
            />
        )}
        <DrawerLocker
          setDrawerLockMode={this.props.screenProps.setDrawerLockMode}
        />
      </SafeAreaView>
    );
  }
}
