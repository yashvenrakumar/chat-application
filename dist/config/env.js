"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const parseIntEnv = (key, fallback) => {
    const raw = process.env[key];
    if (raw === undefined || raw === "")
        return fallback;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
};
exports.env = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT || 5000),
    exposeApiDocs: process.env.EXPOSE_API_DOCS === "true",
    userPresenceBroadcast: process.env.USER_PRESENCE_BROADCAST === "global"
        ? "global"
        : "scoped",
    db: {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 3306),
        name: process.env.DB_NAME || "msg",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "mysql",
        socketPath: process.env.DB_SOCKET_PATH || undefined, // ← fixed: no fallback
        pool: {
            max: parseIntEnv("DB_POOL_MAX", 30),
            min: parseIntEnv("DB_POOL_MIN", 2),
            acquire: parseIntEnv("DB_POOL_ACQUIRE_MS", 60000),
            idle: parseIntEnv("DB_POOL_IDLE_MS", 10000),
        },
    },
    socketIo: {
        perMessageDeflate: process.env.SOCKET_IO_PER_MESSAGE_DEFLATE !== "true",
        pingInterval: parseIntEnv("SOCKET_IO_PING_INTERVAL_MS", 25000),
        pingTimeout: parseIntEnv("SOCKET_IO_PING_TIMEOUT_MS", 20000),
        maxHttpBufferSize: parseIntEnv("SOCKET_IO_MAX_HTTP_BUFFER", 1000000),
    },
    webPush: {
        vapidPublicKey: (process.env.VAPID_PUBLIC_KEY || "").trim(),
        vapidPrivateKey: (process.env.VAPID_PRIVATE_KEY || "").trim(),
        vapidSubject: (process.env.VAPID_SUBJECT || "").trim(),
    },
};
