export function nameFromPath(path: string) {
  return path.slice(path.lastIndexOf("/") + 1);
}
