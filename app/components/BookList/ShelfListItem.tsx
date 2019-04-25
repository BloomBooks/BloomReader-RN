import React from "react";
import { View, Image, Text } from "react-native";
import { Shelf, displayName } from "../../models/BookOrShelf";
import { styles } from "./BookListItem";

interface IProps {
  shelf: Shelf;
  isSelected: boolean;
}

export default function ShelfListItem(props: IProps) {
  const shelf = props.shelf;
  return (
    <View
      style={[
        styles.container,
        props.isSelected ? styles.containerSelected : {}
      ]}
    >
      <Image
        style={{ backgroundColor: `#${shelf.color}` }}
        source={require("../../assets/bookshelf.png")}
      />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{displayName(shelf)}</Text>
      </View>
    </View>
  );
}
