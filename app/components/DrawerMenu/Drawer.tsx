import React from "react";
import DrawerMenu from "./DrawerMenu";
import NotesView from "./NotesView";
import { DrawerItemsProps } from "react-navigation";

interface IState {
  drawerScreen: DrawerScreen;
}

export enum DrawerScreen {
  Main,
  ReleaseNotes,
  AboutBloomReader,
  AboutBloom,
  AboutSIL
}

export default class Drawer extends React.PureComponent<
  DrawerItemsProps,
  IState
> {
  constructor(props: DrawerItemsProps) {
    super(props);
    this.state = {
      drawerScreen: DrawerScreen.Main
    };
  }

  render() {
    switch (this.state.drawerScreen) {
      case DrawerScreen.Main:
        return (
          <DrawerMenu
            setDrawerScreen={(screen: DrawerScreen) =>
              this.setState({ drawerScreen: screen })
            }
          />
        );
      case DrawerScreen.ReleaseNotes:
      case DrawerScreen.AboutBloomReader:
      case DrawerScreen.AboutBloom:
      case DrawerScreen.AboutSIL:
        return (
          <NotesView
            drawerScreen={this.state.drawerScreen}
            goBack={() => this.setState({ drawerScreen: DrawerScreen.Main })}
          />
        );
    }
  }
}
