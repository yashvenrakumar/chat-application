import { Server } from "socket.io";

export let io: Server;

export const setSocketServer = (server: Server): void => {
  io = server;
};
