import { Namespace, Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../types/sky-pack-io";

export default function initializeStreamifySignalingServer(io: Server) {
  const skypackIO: Namespace<ClientToServerEvents, ServerToClientEvents> = io.of('/sky-pack');

  const roomAcceptsPeer = new Map<string, boolean>();

  skypackIO.on("connection", (ws) => {
    ws.on("ROOM_EXISTS", ({ roomId }, cb) => {
      cb(skypackIO.adapter.rooms.has(roomId));
    })

    ws.on("CAN_JOIN_ROOM", async ({ roomId }, cb) => {
      cb(roomAcceptsPeer.get(roomId) ?? false);
    });

    ws.on("CONNECT_ROOM", ({ roomId, userId }) => {
      ws.join(roomId);
      skypackIO.adapter.rooms.set(`${roomId}:peers`, new Set([userId]));
    });

    ws.on("DISCONNECT_ROOM", ({ roomId, userId }) => {
      ws.to(roomId).emit("HOST_LEFT", userId);
      skypackIO.adapter.rooms.delete(roomId);
      skypackIO.adapter.rooms.delete(`${roomId}:peers`);
      roomAcceptsPeer.delete(roomId);
    });

    ws.on("ROOM_ACCEPTS_PEERS", ({ roomId, canAccept }) => {
      roomAcceptsPeer.set(roomId, canAccept);
    });

    ws.on("JOIN_ROOM", ({ roomId, userId }, cb) => {
      ws.rooms.forEach(roomId => {
        if (roomId === ws.id) return;
        ws.leave(roomId);
      })
      ws.join(roomId);
      const peers = skypackIO.adapter.rooms.get(`${roomId}:peers`) ?? new Set();
      peers.add(userId);
      const roomUsers = Array.from(peers).filter(peerId => peerId !== userId);
      cb({ roomId, userId, peers: roomUsers });
      skypackIO.adapter.rooms.set(`${roomId}:peers`, peers);
      ws.to(roomId).emit("PEER_JOINED", userId);
    });

    ws.on("LEAVE_ROOM", ({ roomId, userId }) => {
      ws.leave(roomId);
      const peers = skypackIO.adapter.rooms.get(`${roomId}:peers`) ?? new Set();
      peers.delete(userId);
      skypackIO.adapter.rooms.set(`${roomId}:peers`, peers);
      ws.to(roomId).emit("PEER_LEFT", userId);
    });

    ws.on("SEND_OFFER", ({ roomId, from, sdp, to }) => {
      ws.to(roomId).emit("ON_OFFER", sdp, from, to);
    });

    ws.on("SEND_ANSWER", ({ roomId, from, sdp, to }) => {
      ws.to(roomId).emit("ON_ANSWER", sdp, from, to);
    });

    ws.on("SEND_ICE", ({ roomId, from, ice, to }) => {
      ws.to(roomId).emit("ON_ICE", ice, from, to);
    });
  });
}