import React from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StatusBar
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
  displayName,
  BookOrShelf,
  sortedListForShelf
} from "../../models/BookOrShelf";
import { BookCollection } from "../../models/BookCollection";
import { BRHeaderButtons, Item } from "../shared/BRHeaderButtons";
import { AndroidBackHandler } from "react-navigation-backhandler";
import { DrawerUnlocker } from "../DrawerMenu/DrawerLocker";
import * as Share from "../../util/Share";
import ThemeColors from "../../util/ThemeColors";
import ProgressSpinner from "../shared/ProgressSpinner";
import * as BRAnalytics from "../../util/BRAnalytics";

export interface IProps {
  navigation: NavigationScreenProp<any, any>;
  screenProps: {
    setDrawerLockMode: () => {};
    bookCollection: BookCollection;
    setBookCollection: (bc: BookCollection) => void;
  };
}

export interface IState {
  selectedItem?: BookOrShelf;
  fullyLoaded?: boolean;
}

export default class BookList extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {};
    props.navigation.setParams({
      clearSelectedItem: this.clearSelectedItem,
      deleteSelectedItem: async () => {
        const newCollection = await BookStorage.deleteItem(this.state
          .selectedItem as BookOrShelf);
        this.props.screenProps.setBookCollection(newCollection);
        this.clearSelectedItem();
      },
      shareSelectedItem: () => {
        Share.share(this.state.selectedItem as BookOrShelf);
        this.clearSelectedItem();
      }
    });
  }

  // The shelf that we are displaying - undefined for the root BookList
  private shelf = (): Shelf | undefined =>
    this.props.navigation.getParam("shelf");

  private setSelectedItem = (item: BookOrShelf) => {
    this.setState({ selectedItem: item });
    this.props.navigation.setParams({ selectedItem: item });
  };

  clearSelectedItem = () => {
    this.setState({ selectedItem: undefined });
    this.props.navigation.setParams({ selectedItem: undefined });
  };

  async componentDidMount() {
    const shelf = this.shelf();
    if (shelf === undefined) {
      // This is the root BookList

      // Having a file shared with us results in a new instance of our app,
      // so we can check for imports in componentDidMount()
      await this.checkForBooksToImport();
      BRAnalytics.screenView("Main");
    } else {
      BRAnalytics.screenView("Shelf", displayName(shelf));
    }
    this.setState({ fullyLoaded: true });
  }

  private async checkForBooksToImport() {
    const updatedCollection = await ImportBookModule.checkForBooksToImport();
    if (updatedCollection) {
      this.props.screenProps.setBookCollection(updatedCollection);
      if (updatedCollection.newBook) this.openBook(updatedCollection.newBook);
    }
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
      shelf: shelf
    });
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
            undefined // Let ReactNavigation supply the default back arrow
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
    const list = sortedListForShelf(
      this.shelf(),
      this.props.screenProps.bookCollection
    );

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor={ThemeColors.darkRed} />
        {!this.state.fullyLoaded && <ProgressSpinner />}
        <FlatList
          extraData={this.state}
          data={list}
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
      </SafeAreaView>
    );
  }
}
