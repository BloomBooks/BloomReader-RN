import React from "react";
import {
  SafeAreaView,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  FlatList,
  View,
  StatusBar
} from "react-native";
import * as BookStorage from "../../util/BookStorage";
import BookListItem from "./BookListItem";
import * as ImportBookModule from "../../native_modules/ImportBookModule";
import { NavigationScreenProp, NavigationEvents } from "react-navigation";
import I18n from "../../i18n/i18n";
import ShelfListItem from "./ShelfListItem";
import {
  Book,
  Shelf,
  goesOnShelf,
  displayName,
  BookOrShelf,
  sortedListForShelf
} from "../../models/BookOrShelf";
import { BookCollection } from "../../models/BookCollection";
import { BRHeaderButtons, Item } from "../shared/BRHeaderButtons";
import { AndroidBackHandler } from "react-navigation-backhandler";
import Icon from "react-native-vector-icons/Ionicons";
import { DrawerUnlocker } from "../DrawerMenu/DrawerLocker";
import * as Share from "../../util/Share";
import * as Progress from "react-native-progress";
import * as GetFromWifiModule from "../../native_modules/GetFromWifiModule";
import ThemeColors from "../../util/ThemeColors";
import ProgressSpinner from "../shared/ProgressSpinner";

export interface IProps {
  navigation: NavigationScreenProp<any, any>;
  screenProps: {
    setDrawerLockMode: () => {};
  };
}

export interface IState {
  list: Array<BookOrShelf>;
  collection?: BookCollection;
  selectedItem?: BookOrShelf;
  fullyLoaded?: boolean;
}

export default class BookList extends React.PureComponent<IProps, IState> {
  // The highest BookList on the stack listens for new books.
  // So we subscribe on navigation didFocus event and unsubscribe on openShelf
  newBookListener?: GetFromWifiModule.NewBookListener;

  constructor(props: IProps) {
    super(props);
    this.state = {
      list: []
    };
    props.navigation.setParams({
      clearSelectedItem: this.clearSelectedItem,
      deleteSelectedItem: async () => {
        const newCollection = await BookStorage.deleteItem(this.state
          .selectedItem as BookOrShelf);
        this.updateCollection(newCollection);
        this.clearSelectedItem();
      },
      shareSelectedItem: () => {
        Share.share(this.state.selectedItem as BookOrShelf);
        this.clearSelectedItem();
      }
    });
  }

  // The shelf that we are displaying - undefined for the root BookList
  private shelf = () => this.props.navigation.getParam("shelf");

  private collection = () =>
    this.props.navigation.getParam("collection") || this.state.collection;

  updateCollection = (collection: BookCollection) => {
    this.state.collection
      ? this.setState({ collection: collection })
      : this.props.navigation.getParam("updateCollection")(collection);
    this.setState({ list: sortedListForShelf(this.shelf(), collection) });
  };

  private handleNewBook = async (filename: string) => {
    const newCollection = await BookStorage.importBookFile(filename);
    this.updateCollection(newCollection);
  };

  private setSelectedItem = (item: BookOrShelf) => {
    this.setState({ selectedItem: item });
    this.props.navigation.setParams({ selectedItem: item });
  };

  clearSelectedItem = () => {
    this.setState({ selectedItem: undefined });
    this.props.navigation.setParams({ selectedItem: undefined });
  };

  async componentDidMount() {
    let collection = this.collection();
    if (!collection) {
      // No collection passed in means this is the root BookList
      collection = await BookStorage.getBookCollection();
      this.setState({
        collection: collection,
        list: sortedListForShelf(undefined, collection)
      });
      // Having a file shared with us results in a new instance of our app,
      // so we can check for imports in componentDidMount()
      this.checkForBooksToImport();
    } else {
      this.setState({
        list: sortedListForShelf(this.shelf(), collection),
        fullyLoaded: true
      });
    }
  }

  private async checkForBooksToImport() {
    const updatedCollection = await ImportBookModule.checkForBooksToImport();
    if (updatedCollection) {
      this.updateCollection(updatedCollection);
      if (updatedCollection.book) this.openBook(updatedCollection.book);
    }
    this.setState({ fullyLoaded: true });
  }

  private itemTouch = (item: BookOrShelf) => {
    if (this.state.selectedItem) this.clearSelectedItem();
    else
      item.isShelf
        ? this.openShelf(item as Shelf)
        : this.openBook(item as Book);
  };

  private openBook = (book: Book) =>
    this.props.navigation.navigate("BookReader", {
      book: book
    });

  private openShelf = (shelf: Shelf) => {
    this.props.navigation.push("BookList", {
      collection: this.collection(),
      updateCollection: this.updateCollection,
      shelf: shelf
    });
    this.newBookListener && this.newBookListener.stopListening();
  };

  static navigationOptions = ({
    navigation
  }: {
    navigation: NavigationScreenProp<any, any>;
  }) => {
    const shelf: Shelf | undefined = navigation.getParam("shelf");
    const selectedItem: BookOrShelf | undefined = navigation.getParam(
      "selectedItem"
    );
    return selectedItem
      ? {
          headerTitle: displayName(selectedItem),
          headerLeft: (
            <BRHeaderButtons>
              <Item
                title="back"
                iconName="md-arrow-back"
                onPress={navigation.getParam("clearSelectedItem")}
              />
            </BRHeaderButtons>
          ),
          headerRight: (
            <BRHeaderButtons>
              <Item
                title="share"
                iconName="md-share"
                onPress={navigation.getParam("shareSelectedItem")}
              />
              <Item
                title="trash"
                iconName="md-trash"
                onPress={navigation.getParam("deleteSelectedItem")}
              />
            </BRHeaderButtons>
          )
        }
      : {
          headerTitle: shelf ? displayName(shelf) : I18n.t("Bloom Reader"),
          headerLeft: shelf ? (
            undefined
          ) : (
            <BRHeaderButtons>
              <Item
                title="drawer"
                iconName="md-menu"
                onPress={navigation.toggleDrawer}
                accessibilityLabel={I18n.t("Main Menu")}
              />
            </BRHeaderButtons>
          )
        };
  };

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor={ThemeColors.darkRed} />
        {!this.state.fullyLoaded && <ProgressSpinner />}
        <FlatList
          extraData={this.state}
          data={this.state.list}
          keyExtractor={item =>
            item.isShelf ? (item as Shelf).id : (item as Book).filename
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => this.itemTouch(item)}
              onLongPress={() => this.setSelectedItem(item)}
            >
              {item.isShelf ? (
                <ShelfListItem
                  shelf={item as Shelf}
                  isSelected={this.state.selectedItem == item}
                />
              ) : (
                <BookListItem
                  book={item as Book}
                  isSelected={this.state.selectedItem == item}
                />
              )}
            </TouchableOpacity>
          )}
        />
        {/* Custom handler for Android back button */}
        <AndroidBackHandler
          onBackPress={() => {
            if (this.state.selectedItem) {
              this.clearSelectedItem();
              return true;
            }
            return false; // Default back button behavior
          }}
        />
        <DrawerUnlocker
          setDrawerLockMode={this.props.screenProps.setDrawerLockMode}
        />
        <NavigationEvents
          onDidFocus={() => {
            this.newBookListener = GetFromWifiModule.listenForNewBooks(
              this.handleNewBook
            );
          }}
        />
      </SafeAreaView>
    );
  }
}
