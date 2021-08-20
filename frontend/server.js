const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    method: ["GET", "POST"],
  },
});
const next = require("next");

const DEV = process.env.NODE_ENV !== "production";
const PORT = 3000;

const nextApp = next({ dev: DEV });
const nextHandler = nextApp.getRequestHandler();
let count = 1;

io.on("connect", (socket) => {
  console.log("connected!");
  socket.emit("init", count);
  socket.on("click", (c) => {
    count = c;
    socket.broadcast.emit("click", count);
  });
});

nextApp.prepare().then(() => {
  app.all("*", (req, res) => {
    if (!res.socket.io) res.socket.io = io;
    return nextHandler(req, res);
  });
  server.listen(PORT, (err) => {
    if (err) {
      throw err;
    }
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
