declare module "react-native-vector-icons/Ionicons" {
  import { Component } from "react";

  interface IProps {
    name: string;
    color?: string;
    size?: number;
    style?: { fontSize: number; marginRight: number };
  }

  export default function iconSet(props: IProps): any;
}
