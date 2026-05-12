"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./types/express-request-augmentation");
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const io_1 = require("./socket/io");
const register_events_1 = require("./socket/register-events");
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    let httpServer;
    let socketServer;
    const gracefulShutdown = (signal) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`${signal} received, shutting down gracefully`);
        try {
            socketServer === null || socketServer === void 0 ? void 0 : socketServer.disconnectSockets(true);
            yield new Promise((resolve, reject) => {
                socketServer === null || socketServer === void 0 ? void 0 : socketServer.close((err) => (err ? reject(err) : resolve()));
            });
        }
        catch (closeError) {
            console.error("Socket.IO shutdown error:", closeError);
        }
        try {
            yield database_1.sequelize.close();
        }
        catch (dbError) {
            console.error("Database shutdown error:", dbError);
        }
        yield new Promise((resolve, reject) => {
            httpServer === null || httpServer === void 0 ? void 0 : httpServer.close((err) => (err ? reject(err) : resolve()));
        });
        process.exit(0);
    });
    try {
        yield (0, database_1.connectDB)();
        console.log("Database connected successfully");
        yield database_1.sequelize.sync({
            force: env_1.env.nodeEnv === "development", // ← drops & recreates tables (one-time fix)
            logging: false,
        });
        httpServer = (0, http_1.createServer)(app_1.default);
        socketServer = new socket_io_1.Server(httpServer, {
            cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
            perMessageDeflate: env_1.env.socketIo.perMessageDeflate,
            pingInterval: env_1.env.socketIo.pingInterval,
            pingTimeout: env_1.env.socketIo.pingTimeout,
            maxHttpBufferSize: env_1.env.socketIo.maxHttpBufferSize,
        });
        (0, io_1.setSocketServer)(socketServer);
        (0, register_events_1.registerSocketEvents)(socketServer);
        httpServer.once("error", (err) => {
            if (err.code === "EADDRINUSE") {
                console.error(`Port ${env_1.env.port} is already in use. Stop the other process (e.g. \`lsof -ti:${env_1.env.port} | xargs kill\`) or set PORT in .env.`);
            }
            else {
                console.error(err);
            }
            process.exit(1);
        });
        httpServer.listen(env_1.env.port, () => {
            console.log(`Server is running on port ${env_1.env.port}`);
        });
        process.once("SIGTERM", () => void gracefulShutdown("SIGTERM"));
        process.once("SIGINT", () => void gracefulShutdown("SIGINT"));
    }
    catch (error) {
        console.error("Failed to start backend:", error);
        process.exit(1);
    }
});
void startServer();
