// src/lib/socket-manager.ts

import { io, type Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001";

let callsSocket: Socket | null = null;
let agentsSocket: Socket | null = null;

export function getCallsSocket(token: string): Socket {
  if (!callsSocket) {
    callsSocket = io(`${SOCKET_URL}/calls`, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });
  }
  return callsSocket;
}

export function getAgentsSocket(token: string): Socket {
  if (!agentsSocket) {
    agentsSocket = io(`${SOCKET_URL}/agents`, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });
  }
  return agentsSocket;
}

/** À appeler au logout pour forcer la destruction des instances */
export function destroyAllSockets(): void {
  callsSocket?.disconnect();
  callsSocket = null;
  agentsSocket?.disconnect();
  agentsSocket = null;
}