import React from "react";
import PropTypes from "prop-types";
import {
  SafeAreaView,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity
} from "react-native";
import BookStorage from "../../util/BookStorage";
import BookListItem from "./BookListItem";
import ImportBookModule from "../../native_modules/ImportBookModule";

export default class BookList extends React.PureComponent {
  constructor(props) {
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

  openBook = book => {
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

BookList.propTypes = {
  navigation: PropTypes.object.isRequired
};
