import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

import initializeStreamifySignalingServer from "./apps/streamify";
import initializeSkyPackSignalingServer from "./apps/sky-pack";

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://streamify-cyan.vercel.app", "https://sky-pack.vercel.app"],
    methods: ["GET", "POST"],
  },
});

initializeStreamifySignalingServer(io);
initializeSkyPackSignalingServer(io);

server.listen(3000, undefined, undefined, () => {
  console.log("server running at http://localhost:3000");
});

export default app;
