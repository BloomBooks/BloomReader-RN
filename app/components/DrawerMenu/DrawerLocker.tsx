import React from "react";
import { NavigationEvents } from "react-navigation";

interface IProps {
  setDrawerLockMode: (lockMode: "unlocked" | "locked-closed") => void;
}

/*
  The Drawer Menu exists everywhere in the app, but we only want to use it on the BookList screen.
  So, we use the DrawerLocker to disable it on other screens
  And enable it on the BookList screen with the DrawerUnlocker
*/

export function DrawerLocker(props: IProps) {
  return (
    <NavigationEvents
      onDidFocus={() => props.setDrawerLockMode("locked-closed")}
    />
  );
}

export function DrawerUnlocker(props: IProps) {
  return (
    <NavigationEvents onDidFocus={() => props.setDrawerLockMode("unlocked")} />
  );
}
