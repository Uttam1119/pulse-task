const Video = require("../models/Video");

const simulateProcessing = (io, video) => {
  const vidId = video._id.toString();
  let progress = 0;
  video.status = "processing";
  video.progress = 0;
  video.save();

  const interval = setInterval(async () => {
    progress += Math.floor(Math.random() * 12) + 5;
    if (progress > 100) progress = 100;
    await Video.findByIdAndUpdate(vidId, { progress });

    io.to(`video_${vidId}`).emit("processing:update", {
      videoId: vidId,
      progress,
    });

    if (progress >= 100) {
      clearInterval(interval);
      const sensitivity = Math.random() < 0.85 ? "safe" : "flagged";
      await Video.findByIdAndUpdate(vidId, {
        status: "processed",
        progress: 100,
        sensitivity,
      });
      io.to(`video_${vidId}`).emit("processing:done", {
        videoId: vidId,
        sensitivity,
      });
    }
  }, 500);
};

module.exports = { simulateProcessing };
