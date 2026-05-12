import "./types/express-request-augmentation";
import app from "./app";
import { connectDB, sequelize } from "./config/database";
import { env } from "./config/env";
import { createServer, type Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { setSocketServer } from "./socket/io";
import { registerSocketEvents } from "./socket/register-events";

const startServer = async (): Promise<void> => {
  let httpServer: HttpServer | undefined;
  let socketServer: SocketServer | undefined;

  const gracefulShutdown = async (signal: string): Promise<void> => {
    console.log(`${signal} received, shutting down gracefully`);
    try {
      socketServer?.disconnectSockets(true);
      await new Promise<void>((resolve, reject) => {
        socketServer?.close((err) => (err ? reject(err) : resolve()));
      });
    } catch (closeError) {
      console.error("Socket.IO shutdown error:", closeError);
    }

    try {
      await sequelize.close();
    } catch (dbError) {
      console.error("Database shutdown error:", dbError);
    }
    await new Promise<void>((resolve, reject) => {
      httpServer?.close((err) => (err ? reject(err) : resolve()));
    });
    process.exit(0);
  };

  try {
    await connectDB();
    console.log("Database connected successfully");
    await sequelize.sync({
      alter: env.nodeEnv === "development",
      logging: false,
    });

    httpServer = createServer(app);
    socketServer = new SocketServer(httpServer, {
      cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
      perMessageDeflate: env.socketIo.perMessageDeflate,
      pingInterval: env.socketIo.pingInterval,
      pingTimeout: env.socketIo.pingTimeout,
      maxHttpBufferSize: env.socketIo.maxHttpBufferSize,
    });

    setSocketServer(socketServer);
    registerSocketEvents(socketServer);

    httpServer.once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `Port ${env.port} is already in use. Stop the other process (e.g. \`lsof -ti:${env.port} | xargs kill\`) or set PORT in .env.`,
        );
      } else {
        console.error(err);
      }
      process.exit(1);
    });
    httpServer.listen(env.port, () => {
      console.log(`Server is running on port ${env.port}`);
    });

    process.once("SIGTERM", () => void gracefulShutdown("SIGTERM"));
    process.once("SIGINT", () => void gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start backend:", error);
    process.exit(1);
  }
};

void startServer();
