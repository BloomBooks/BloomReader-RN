export function nameFromPath(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1);
}
