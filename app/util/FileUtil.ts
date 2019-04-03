import RNFS from "react-native-fs";

export function nameFromPath(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1);
}

export async function rnfsSafeUnlink(path: string) {
  const exists = await RNFS.exists(path);
  if (exists) RNFS.unlink(path);
}
