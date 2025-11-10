const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");

require("dotenv").config();
const PORT = process.env.PORT || 4000;
connectDB(process.env.MONGO_URI);

const server = http.createServer(app);
const { Server } = require("socket.io");

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
