const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Video = require("../models/Video");
const auth = require("../middleware/auth");
const { permit } = require("../middleware/roles");
const { ensureUploadDir } = require("../utils/storage");
const { simulateProcessing } = require("../services/processor");

const router = express.Router();

const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(__dirname, "../../uploads");
ensureUploadDir(UPLOAD_DIR);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 },
});

// upload route
router.post(
  "/upload",
  auth,
  permit("editor", "admin"),
  upload.single("video"),
  async (req, res) => {
    try {
      const file = req.file;
      const video = new Video({
        owner: req.user._id,
        tenantId: req.user.tenantId,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        status: "uploaded",
      });
      await video.save();

      const io = req.app.get("io");
      simulateProcessing(io, video);

      res.json({ message: "uploaded", video });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "upload failed", error: err.message });
    }
  }
);

// list videos
router.get("/", auth, async (req, res) => {
  const tenantId = req.user.tenantId;
  const videos = await Video.find({ tenantId }).sort({ createdAt: -1 });
  res.json({ videos });
});

module.exports = router;
