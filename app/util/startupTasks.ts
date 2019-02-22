import * as BookStorage from "./BookStorage";
import { AsyncStorage } from "react-native";
import importSampleBooks from "./importSampleBooks";

const appVersion = require("../../package.json").version;
const lastRunVersionKey = "bloomreader.lastRunVersion";

export default async function startupTasks(): Promise<void> {
  await BookStorage.createDirectories();

  const lastRunVersion = await getLastRunVersion();
  switch (lastRunVersion) {
    case null: // First run
      await importSampleBooks();
  }
  setLastRunVersion();
}

async function getLastRunVersion() {
  return AsyncStorage.getItem(lastRunVersionKey);
}

async function setLastRunVersion() {
  AsyncStorage.setItem(lastRunVersionKey, appVersion);
}
