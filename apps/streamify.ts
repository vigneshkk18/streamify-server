import { Server } from "socket.io";

export default function initializeStreamifySignalingServer(io: Server) {
  const streamifyIO = io.of('/streamify');

  streamifyIO.on("connection", (ws) => {
    ws.on("onOffer", ({ roomId, offer, uuid }) => {
      streamifyIO.to(roomId).emit("onOffer", offer, uuid);
    });

    ws.on("onAnswer", ({ roomId, answer, uuid }) => {
      streamifyIO.to(roomId).emit("onAnswer", answer, uuid);
    });

    ws.on("onIce", ({ roomId, ice, uuid }) => {
      streamifyIO.to(roomId).emit("onIce", ice, uuid);
    });

    ws.on("createRoom", ({ roomId }) => {
      const rooms = streamifyIO.adapter.rooms;
      if (rooms.has(roomId)) {
        ws.emit("roomAlreadyExists");
        return;
      }
      ws.join(roomId);
    });

    ws.on("joinRoom", ({ roomId }) => {
      const rooms = streamifyIO.adapter.rooms;
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
        streamifyIO.to(roomId).emit("peersJoined");
      }
    });

    ws.on("closeRoom", ({ roomId, uuid }) => {
      streamifyIO.to(roomId).emit("hostLeft", uuid);
      ws.leave(roomId);
      streamifyIO.adapter.rooms.delete(roomId);
    });

    ws.on("leaveRoom", ({ roomId, uuid }) => {
      ws.leave(roomId);
      streamifyIO.to(roomId).emit("peerLeft", uuid);
    });
  });
}