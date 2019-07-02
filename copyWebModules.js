const fs = require("fs");

const nodeModulePath = "./node_modules/bloom-player/dist";
const androidAssetFolderPath = "./android/app/src/main/assets/bloom-player";
const iosBundlePath = "./ios/bloomreader/BloomPlayer.bundle";
const filesToNotCopy = ["bloomPlayer.js"];

const moduleFiles = fs.readdirSync(nodeModulePath);
const moduleFilesToCopy = moduleFiles.filter(
  filename => !filesToNotCopy.includes(filename)
);

mkdirSafe(androidAssetFolderPath);
mkdirSafe(iosBundlePath);
moduleFilesToCopy.forEach(filename => {
  fs.copyFileSync(
    `${nodeModulePath}/${filename}`,
    `${androidAssetFolderPath}/${filename}`
  );
  fs.copyFileSync(
    `${nodeModulePath}/${filename}`,
    `${iosBundlePath}/${filename}`
  );
});

function mkdirSafe(path) {
  if (!fs.existsSync(path)) fs.mkdirSync(path);
}
