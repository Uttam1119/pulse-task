const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const videoRoutes = require("./routes/videos");

const app = express();
app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

module.exports = app;
