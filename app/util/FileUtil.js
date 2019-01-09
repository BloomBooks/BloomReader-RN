export default {
  nameFromPath: nameFromPath
};

function nameFromPath(path) {
  return path.slice(path.lastIndexOf("/") + 1);
}
