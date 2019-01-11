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
import { NavigationScreenProp } from "react-navigation";
import { Book } from "../../models/Book";

export interface IProps {
  navigation: NavigationScreenProp<any, any>;
}

export interface IState {
  list: Array<Book>;
}

export default class BookList extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      list: []
    };
  }

  async componentDidMount() {
    const list = await BookStorage.getBookList();
    this.setState({ list: list });
    // Having a file shared with us results in a new instance of our app,
    // so we can check for imports in componentDidMount()
    this.checkForBookToImport();
  }

  async checkForBookToImport() {
    const bookAndNewList = await ImportBookModule.checkForBooksToImport();
    if (bookAndNewList) {
      this.setState({ list: bookAndNewList.list });
      this.openBook(bookAndNewList.book);
    }
  }

  private openBook = (book: Book) =>
    this.props.navigation.navigate("BookReader", {
      book: book
    });

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
