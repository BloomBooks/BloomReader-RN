import React from "react";
import { View, Image, Text } from "react-native";
import { Book, displayName } from "../../models/BookOrShelf";
import * as BookStorage from "../../util/BookStorage";

export interface IProps {
  book: Book;
  isSelected: boolean;
}

export interface IState {
  thumbnail?: { format: string; data: string };
}

export default class BookListItem extends React.PureComponent<IProps, IState> {
  state: IState = {};

  async componentDidMount() {
    const thumbnail = await BookStorage.getThumbnail(this.props.book);
    this.setState({ thumbnail: thumbnail });
  }

  render() {
    const book = this.props.book;
    return (
      <View
        style={{
          flexDirection: "row",
          padding: 8,
          backgroundColor: this.props.isSelected ? "gray" : "white"
        }}
      >
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
          {displayName(book)}
        </Text>
      </View>
    );
  }
}
