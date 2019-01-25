import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import HeaderButtons, { HeaderButton } from "react-navigation-header-buttons";

const BRHeaderButton = (props: { title: string }) => (
  <HeaderButton
    IconComponent={Ionicons}
    iconSize={23}
    color="white"
    {...props}
  />
);

export const BRHeaderButtons = (props: object) => (
  <HeaderButtons HeaderButtonComponent={BRHeaderButton} {...props} />
);

export const Item = HeaderButtons.Item;
