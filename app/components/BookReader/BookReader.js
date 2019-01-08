import React from "react";
import PropTypes from "prop-types";
import { SafeAreaView, Text } from "react-native";
import BookStorage from "../../util/BookStorage";
import { WebView } from "react-native-webview";

export default class BookReader extends React.PureComponent {
  state = {};

  book = () => {
    return this.props.navigation.getParam("book");
  };

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

BookReader.propTypes = {
  navigation: PropTypes.object.isRequired
};
