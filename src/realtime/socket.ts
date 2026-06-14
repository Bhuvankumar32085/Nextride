import { io } from "socket.io-client";

const realtimeUrl =
  process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:5004";


export const socket = io(realtimeUrl, {
  transports: ["websocket"],
  autoConnect: false,
});
