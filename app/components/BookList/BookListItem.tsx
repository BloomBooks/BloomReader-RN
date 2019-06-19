import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import { Book, displayName, BookFeatures } from "../../models/BookOrShelf";
import * as BookStorage from "../../storage/BookStorage";
import Icon from "react-native-vector-icons/Ionicons";
import ThemeColors from "../../util/ThemeColors";

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
        style={[
          styles.container,
          this.props.isSelected ? styles.containerSelected : {}
        ]}
      >
        {this.state.thumbnail && (
          <Image
            style={styles.thumbnail}
            source={{
              uri: `data:image/${this.state.thumbnail.format};base64,${
                this.state.thumbnail.data
              }`
            }}
          />
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{displayName(book)}</Text>
          {this.props.book.features.includes(BookFeatures.talkingBook) && (
            <Icon name="md-volume-high" color={ThemeColors.speakerIcon} />
          )}
        </View>
      </View>
    );
  }
}

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "white"
  },
  containerSelected: {
    backgroundColor: ThemeColors.lightGray
  },
  titleContainer: {
    flexDirection: "column",
    paddingLeft: 8,
    flex: 1
  },
  title: {
    fontSize: 20,
    marginBottom: 4,
    color: "black",
    flex: 1,
    flexWrap: "wrap"
  },
  thumbnail: {
    width: 64,
    height: 64
  }
});
