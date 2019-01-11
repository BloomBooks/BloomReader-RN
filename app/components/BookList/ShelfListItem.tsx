import React from "react";
import { View, Image, Text } from "react-native";
import { Shelf, displayName } from "../../models/BookOrShelf";

interface IProps {
  shelf: Shelf;
}

export default function ShelfListItem(props: IProps) {
  const shelf = props.shelf;
  return (
    <View style={{ flexDirection: "row", padding: 8 }}>
      <Image
        style={{ backgroundColor: `#${shelf.color}` }}
        source={require("../../assets/bookshelf.png")}
      />
      <Text style={{ fontSize: 20, fontWeight: "bold", paddingLeft: 4 }}>
        {displayName(shelf)}
      </Text>
    </View>
  );
}
