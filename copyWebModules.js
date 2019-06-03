const fs = require("fs");

const bloomPlayerAssetFolderPath = "./android/app/src/main/assets/bloom-player";

mkdirSafe(bloomPlayerAssetFolderPath);

fs.copyFileSync(
  "./node_modules/bloom-player/dist/bloomPlayer.js",
  `${bloomPlayerAssetFolderPath}/bloomPlayer.min.js`
);

fs.copyFileSync(
  "./node_modules/bloom-player/dist/right_answer.mp3",
  `${bloomPlayerAssetFolderPath}/right_answer.mp3`
);

fs.copyFileSync(
  "./node_modules/bloom-player/dist/wrong_answer.mp3",
  `${bloomPlayerAssetFolderPath}/wrong_answer.mp3`
);

fs.copyFileSync(
  "./node_modules/bloom-player/dist/simpleComprehensionQuiz.js",
  `${bloomPlayerAssetFolderPath}/simpleComprehensionQuiz.js`
);

function mkdirSafe(path) {
  if (!fs.existsSync(path)) fs.mkdirSync(path);
}
