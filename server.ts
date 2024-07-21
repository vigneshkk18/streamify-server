import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://streamify-cyan.vercel.app"],
    methods: ["GET", "POST"],
  },
});
io.on("connection", (ws) => {
  ws.on("onOffer", ({ roomId, offer, uuid }) => {
    io.to(roomId).emit("onOffer", offer, uuid);
  });

  ws.on("onAnswer", ({ roomId, answer, uuid }) => {
    io.to(roomId).emit("onAnswer", answer, uuid);
  });

  ws.on("onIce", ({ roomId, ice, uuid }) => {
    io.to(roomId).emit("onIce", ice, uuid);
  });

  ws.on("createRoom", ({ roomId }) => {
    const rooms = io.of("/").adapter.rooms;
    if (rooms.has(roomId)) {
      ws.emit("roomAlreadyExists");
      return;
    }
    ws.join(roomId);
  });

  ws.on("joinRoom", ({ roomId }) => {
    const rooms = io.of("/").adapter.rooms;
    const peers = rooms.get(roomId);
    if (!peers) {
      ws.emit("hostLeft");
      return;
    }

    if (peers?.size && peers.size >= 2) {
      ws.emit("roomFull");
      return;
    }

    ws.join(roomId);

    if (peers?.size === 2) {
      io.to(roomId).emit("peersJoined");
    }
  });

  ws.on("closeRoom", ({ roomId }) => {
    io.to(roomId).emit("hostLeft");
    ws.leave(roomId);
    io.of("/").adapter.rooms.delete(roomId);
  });

  ws.on("leaveRoom", ({ roomId }) => {
    ws.leave(roomId);
    io.to(roomId).emit("peerLeft");
  });
});

server.listen(3000, undefined, undefined, () => {
  console.log("server running at http://localhost:3000");
});

export default app;
