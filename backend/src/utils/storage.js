const fs = require("fs");
const path = require("path");
const multer = require("multer");

function ensureUploadDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tenantDir = path.join(__dirname, "../../uploads", req.user.tenantId);
    ensureUploadDir(tenantDir);
    cb(null, tenantDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const tempName = `temp-${Date.now()}${ext}`;
    cb(null, tempName);
  },
});

module.exports = {
  ensureUploadDir,
  uploadMiddleware: multer({ storage }),
};
