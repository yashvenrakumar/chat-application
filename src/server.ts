import app from "./app";
import { connectDB, sequelize } from "./config/database";
import { env } from "./config/env";
 
import { createServer, type Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
 
 
 
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
    await sequelize.sync({ alter: env.nodeEnv === "development" });

    httpServer = createServer(app);
   
 

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


// import express from "express";

// const app = express();

// app.get("/", (_req, res) => {
//   res.send("Server Running");
// });

// app.listen(5000, () => {
//   console.log("Server running on port 5000");
// });