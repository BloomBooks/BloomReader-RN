import BookStorage from "./BookStorage";

export default async function startupTasks() {
  await BookStorage.createDirectories(); // Make this run only on new-install?
}
