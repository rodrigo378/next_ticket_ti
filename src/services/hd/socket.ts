import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const URL =
      process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3000/hd/ws/ticket";
    socket = io(URL, { transports: ["websocket"], autoConnect: true });
  }
  return socket;
}
