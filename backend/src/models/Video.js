const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tenantId: { type: String, required: true },
    filename: { type: String, required: true },
    originalName: { type: String },
    mimeType: { type: String },
    size: { type: Number },
    status: {
      type: String,
      enum: ["uploaded", "processing", "processed", "failed"],
      default: "uploaded",
    },
    progress: { type: Number, default: 0 },
    sensitivity: {
      type: String,
      enum: ["safe", "flagged", "unknown"],
      default: "unknown",
    },
    metadata: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", VideoSchema);
