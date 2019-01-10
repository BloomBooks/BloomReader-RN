import React from "react";
import PropTypes from "prop-types";
import { View, Image, Text } from "react-native";
import BookStorage from "../../util/BookStorage";

export default class BookListItem extends React.PureComponent {
  state = {};

  async componentDidMount() {
    const thumbnail = await BookStorage.getThumbnail(this.props.book);
    this.setState({ thumbnail: thumbnail });
  }

  render() {
    return (
      <View style={{ flexDirection: "row", padding: 8 }}>
        {this.state.thumbnail && (
          <Image
            style={{ width: 70, height: 57 }}
            source={{
              uri: `data:image/${this.state.thumbnail.format};base64,${
                this.state.thumbnail.data
              }`
            }}
          />
        )}
        <Text style={{ fontSize: 20, fontWeight: "bold", paddingLeft: 4 }}>
          {this.props.book.name}
        </Text>
      </View>
    );
  }
}

BookListItem.propTypes = {
  book: PropTypes.object.isRequired
};
