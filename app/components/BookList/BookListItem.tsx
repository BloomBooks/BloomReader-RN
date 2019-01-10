import React from "react";
import { View, Image, Text } from "react-native";
import { Book } from "../../models/BookOrShelf";
import * as BookStorage from "../../util/BookStorage"

export interface Props {
  book: Book
}

export interface State {
  thumbnail?: {format: string, data: string}
}

export default class BookListItem extends React.PureComponent<Props, State> {
  state: State = {};

  async componentDidMount() {
    const thumbnail = await BookStorage.getThumbnail(this.props.book);
    this.setState({ thumbnail: thumbnail });
  }

  render() {
    return (
      <View style={{ flexDirection: "row", padding: 8 }}>
        {this.state.thumbnail && (
          <Image
            style={{ width: 64, height: 64 }}
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
