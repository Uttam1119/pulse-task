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
router.get("/", auth, permit("viewer", "editor", "admin"), async (req, res) => {
  const tenantId = req.user.tenantId;
  const videos = await Video.find({ tenantId }).sort({ createdAt: -1 });
  res.json({ videos });
});

// get single video metadata
router.get("/:id", auth, async (req, res) => {
  const v = await Video.findById(req.params.id);
  if (!v || v.tenantId !== req.user.tenantId)
    return res.status(404).json({ message: "not found" });
  res.json({ video: v });
});

// stream with range requests
router.get("/stream/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const video = await Video.findById(id);

    if (!video) return res.status(404).send("Not found");
    const filePath = path.join(UPLOAD_DIR, video.filename);
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": video.mimeType || "video/mp4",
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": video.mimeType || "video/mp4",
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error streaming");
  }
});

// delete video (editor/admin)
router.delete("/:id", auth, permit("editor", "admin"), async (req, res) => {
  const v = await Video.findById(req.params.id);
  if (!v) return res.status(404).json({ message: "not found" });
  if (v.tenantId !== req.user.tenantId)
    return res.status(403).json({ message: "forbidden" });
  const filePath = path.join(UPLOAD_DIR, v.filename);
  fs.unlink(filePath, (err) => {});
  await Video.deleteOne({ _id: v._id });
  res.json({ message: "deleted" });
});

module.exports = router;
