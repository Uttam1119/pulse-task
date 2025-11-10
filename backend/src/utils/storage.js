const path = require("path");
const fs = require("fs");

const ensureUploadDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const makeFilePath = (uploadDir, filename) => {
  return path.join(uploadDir, filename);
};

module.exports = { ensureUploadDir, makeFilePath };
