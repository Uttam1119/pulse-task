const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");

require("dotenv").config();
const PORT = process.env.PORT || 4000;
connectDB(process.env.MONGO_URI);

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on("subscribe", ({ videoId }) => {
    if (videoId) socket.join(`video_${videoId}`);
  });
  socket.on("subscribeTenant", ({ tenantId }) => {
    if (tenantId) socket.join(`tenant_${tenantId}`);
  });

  socket.on("disconnect", () => {});
});

app.set("io", io);

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
