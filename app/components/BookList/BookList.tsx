import React from "react";
import PropTypes from "prop-types";
import {
  SafeAreaView,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  FlatList,
  View
} from "react-native";
import BookStorage from "../../util/BookStorage";
import BookListItem from "./BookListItem";
import ImportBookModule from "../../native_modules/ImportBookModule";
import I18n from "../../i18n/i18n";
import BookShelfListItem from "./BookShelfListItem";
import { NavigationScreenProp } from "react-navigation";
import BookOrShelf from "../../util/BookOrShelf";

export interface IProps {
  navigation: NavigationScreenProp<any, any>;
}
export interface IState {
  list: Array<BookOrShelf>;
}
export default class BookList extends React.PureComponent<IProps, IState> {
    constructor(props: IProps) {
    super(props);
    this.state = {
      list: []
    };
  }

  shelf = () => {
    return this.props.navigation.getParam("shelf");
  };

  async componentDidMount() {
    let collection = this.props.navigation.getParam("collection");
    if (!collection) {
      // No collection passed in means this is the root BookList
      collection = await BookStorage.getBooksAndShelves();
      this.checkForBooksToImport();
    }
    this.setState({ collection: collection, list: this.makeList(collection) });
  }

  async checkForBooksToImport() {
    const updatedCollection = await ImportBookModule.checkForBooksToImport();
    if (updatedCollection) {
      this.setState({
        collection: updatedCollection,
        list: this.makeList(updatedCollection)
      });
      if (updatedCollection.book) this.openBook(updatedCollection.book);
    }
  }

  makeList = collection => {
    let list = collection.shelves
      .filter(shelf =>
        BookOrShelf.goesOnShelf(shelf, this.shelf(), collection.shelves)
      )
      .concat(
        collection.books.filter(book =>
          BookOrShelf.goesOnShelf(book, this.shelf(), collection.shelves)
        )
      )
      .sort((a, b) =>
        BookOrShelf.displayName(a).localeCompare(BookOrShelf.displayName(b))
      );
    return list;
  };

  openBook = book => {
    this.props.navigation.navigate("BookReader", {
      book: book
    });
  };

  openShelf = shelf => {
    this.props.navigation.push("BookList", {
      collection: this.state.collection,
      shelf: shelf
    });
  };

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={this.state.list}
          keyExtractor={item => (item.isShelf ? item.id : item.name)}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                item.isShelf ? this.openShelf(item) : this.openBook(item)
              }
            >
              {item.isShelf ? (
                <BookShelfListItem shelf={item} />
              ) : (
                <BookListItem book={item} />
              )}
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }
}

BookList.propTypes = {
  navigation: PropTypes.object.isRequired
};


