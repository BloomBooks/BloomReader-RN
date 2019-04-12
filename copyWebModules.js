const fs = require("fs");

const bloomPlayerAssetFolderPath = "./android/app/src/main/assets/bloom-player";

mkdirSafe(bloomPlayerAssetFolderPath);

fs.copyFileSync(
  "./node_modules/bloom-player/dist/bloomPlayer.js",
  `${bloomPlayerAssetFolderPath}/bloomPlayer.js`
);

function mkdirSafe(path) {
  if (!fs.existsSync(path)) fs.mkdirSync(path);
}
