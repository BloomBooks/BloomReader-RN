import React from "react";
import {
  SafeAreaView,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity
} from "react-native";
import * as BookStorage from "../../util/BookStorage";
import BookListItem from "./BookListItem";
import ImportBookModule from "../../native_modules/ImportBookModule";
import {NavigationScreenProp} from "react-navigation"
import { Book } from "../../models/Book";

export interface Props {
  navigation: NavigationScreenProp<any,any>
}

export interface State {
  list: Array<Book>
}

export default class BookList extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      list: []
    };
  }

  async componentDidMount() {
    const list = await BookStorage.getBookList();
    this.setState({ list: list });
    this.checkForBookToImport();
  }

  async checkForBookToImport() {
    const bookAndNewList = await ImportBookModule.checkForBooksToImport();
    if (bookAndNewList) {
      this.setState({ list: bookAndNewList.list });
      this.openBook(bookAndNewList.book);
    }
  }

  openBook = (book: Book) => {
    this.props.navigation.navigate("BookReader", {
      book: book
    });
  };

  render() {
    return (
      <SafeAreaView>
        {/* Replace this with a proper FlatList or other List component */}
        {this.state.list.map(book => (
          <TouchableOpacity key={book.name} onPress={() => this.openBook(book)}>
            <BookListItem book={book} />
          </TouchableOpacity>
        ))}
      </SafeAreaView>
    );
  }
}
