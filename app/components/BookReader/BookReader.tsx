import React from "react";
import { SafeAreaView, Text } from "react-native";
import * as BookStorage from "../../util/BookStorage";
import { WebView } from "react-native-webview";
import { NavigationScreenProp } from "react-navigation";

export interface IProps {
  navigation: NavigationScreenProp<any, any>;
}

export interface IState {
  bookPath?: string;
  html?: string;
}

export default class BookReader extends React.PureComponent<IProps, IState> {
  state: IState = {};

  private book = () => this.props.navigation.getParam("book");

  async componentDidMount() {
    const bookPath = await BookStorage.openBookForReading(this.book());
    this.setState({ bookPath: bookPath });
    this.loadHtml();
  }

  async loadHtml() {
    const html = await BookStorage.fetchHtml();
    this.setState({ html: html });
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Text>Reading {this.book().name} Put a Bloom Player here vvv</Text>
        {!!this.state.html && (
          <WebView source={{ html: this.state.html }} />
          // <Text>{this.state.html}</Text>
        )}
      </SafeAreaView>
    );
  }
}
