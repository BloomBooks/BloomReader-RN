const fs = require("fs");

const nodeModulePath = "./node_modules/bloom-player/dist";
const bloomPlayerAssetFolderPath = "./android/app/src/main/assets/bloom-player";
const filesToNotCopy = ["bloomPlayer.js"];

const moduleFiles = fs.readdirSync(nodeModulePath);
const moduleFilesToCopy = moduleFiles.filter(
  filename => !filesToNotCopy.includes(filename)
);

mkdirSafe(bloomPlayerAssetFolderPath);
moduleFilesToCopy.forEach(filename =>
  fs.copyFileSync(
    `${nodeModulePath}/${filename}`,
    `${bloomPlayerAssetFolderPath}/${filename}`
  )
);

function mkdirSafe(path) {
  if (!fs.existsSync(path)) fs.mkdirSync(path);
}
