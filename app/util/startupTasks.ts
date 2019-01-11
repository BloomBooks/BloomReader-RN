import * as BookStorage from "./BookStorage";

export default async function startupTasks(): Promise<void> {
  await BookStorage.createDirectories(); // Make this run only on new-install?
}
