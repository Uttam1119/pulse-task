const ffmpeg = require("fluent-ffmpeg");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");

async function extractFrames(videoPath, outputDir) {
  console.log("FFmpeg starting on file:", videoPath);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        count: 3,
        folder: outputDir,
        size: "320x240",
      })
      .on("end", resolve)
      .on("error", (err) => {
        console.error("FFmpeg ERROR:", err);
        reject(err);
      });
  });
}

async function analyzeFrame(frameFile) {
  const img = await Jimp.read(frameFile);

  let brightness = 0;
  let redness = 0;

  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];

    brightness += (r + g + b) / 3;
    redness += r;
  });

  const pixels = img.bitmap.width * img.bitmap.height;

  return {
    brightness: brightness / pixels,
    red: redness / pixels,
  };
}

async function ffmpegSensitivityCheck(videoPath) {
  console.log("Running sensitivity check on:", videoPath);

  const tempDir = path.join(__dirname, "../../temp_frames");

  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  await extractFrames(videoPath, tempDir);

  const frames = fs.readdirSync(tempDir).filter((f) => f.endsWith(".png"));

  let totalBrightness = 0;
  let totalRedness = 0;

  for (const frame of frames) {
    const result = await analyzeFrame(path.join(tempDir, frame));
    totalBrightness += result.brightness;
    totalRedness += result.red;

    fs.unlinkSync(path.join(tempDir, frame));
  }

  const avgBrightness = totalBrightness / frames.length;
  const avgRed = totalRedness / frames.length;

  if (avgBrightness < 40) return "flagged"; // too dark
  if (avgRed > 180) return "flagged"; // too much red (blood-like)

  return "safe";
}

module.exports = { ffmpegSensitivityCheck };
