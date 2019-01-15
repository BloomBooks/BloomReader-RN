import React from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  Text,
  View,
  Image,
  StyleSheet,
  ImageSourcePropType
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import I18n from "../../i18n/i18n";

interface IProps {
  onPress: () => void;
  iconName?: string;
  iconSource?: ImageSourcePropType;
  label: string;
}

export default function DrawerMenuItem(props: IProps) {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View style={styles.container}>
        {props.iconSource && (
          <Image source={props.iconSource} style={styles.image} />
        )}
        {props.iconName && (
          <Icon name={props.iconName} color="gray" style={styles.icon} />
        )}
        <Text style={styles.text}>{props.label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8
  },
  text: {
    fontSize: 20
  },
  icon: {
    fontSize: 24,
    marginRight: 8
  },
  image: {
    height: 24,
    width: 24,
    marginRight: 8
  }
});
