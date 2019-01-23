import React from "react";
import {
  SafeAreaView,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  FlatList,
  View
} from "react-native";
import * as BookStorage from "../../util/BookStorage";
import BookListItem from "./BookListItem";
import * as ImportBookModule from "../../native_modules/ImportBookModule";
import { NavigationScreenProp } from "react-navigation";
import I18n from "../../i18n/i18n";
import ShelfListItem from "./ShelfListItem";
import {
  Book,
  Shelf,
  goesOnShelf,
  displayName,
  BookOrShelf
} from "../../models/BookOrShelf";
import { BookCollection } from "../../models/BookCollection";

export interface IProps {
  navigation: NavigationScreenProp<any, any>;
}

export interface IState {
  list: Array<BookOrShelf>;
  collection?: BookCollection;
}

export default class BookList extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      list: []
    };
  }

  // The shelf that we are displaying - undefined for the root BookList
  private shelf = () => this.props.navigation.getParam("shelf");

  async componentDidMount() {
    let collection = this.props.navigation.getParam("collection");
    if (!collection) {
      // No collection passed in means this is the root BookList
      collection = await BookStorage.getBookCollection();
      // Having a file shared with us results in a new instance of our app,
      // so we can check for imports in componentDidMount()
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

  private makeList = (collection: BookCollection) =>
    (collection.shelves as BookOrShelf[])
      .filter(shelf => goesOnShelf(shelf, this.shelf(), collection.shelves))
      .concat(
        collection.books.filter(book =>
          goesOnShelf(book, this.shelf(), collection.shelves)
        )
      )
      .sort((a, b) => displayName(a).localeCompare(displayName(b)));

  private openBook = (book: Book) =>
    this.props.navigation.navigate("BookReader", {
      book: book
    });

  private openShelf = (shelf: Shelf) =>
    this.props.navigation.push("BookList", {
      collection: this.state.collection,
      shelf: shelf
    });

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={this.state.list}
          keyExtractor={item =>
            item.isShelf ? (item as Shelf).id : (item as Book).filename
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                item.isShelf
                  ? this.openShelf(item as Shelf)
                  : this.openBook(item as Book)
              }
            >
              {item.isShelf ? (
                <ShelfListItem shelf={item as Shelf} />
              ) : (
                <BookListItem book={item as Book} />
              )}
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }
}
