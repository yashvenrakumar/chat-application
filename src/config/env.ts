import dotenv from "dotenv";

dotenv.config();

const parseIntEnv = (key: string, fallback: number): number => {
  const raw = process.env[key];
  if (raw === undefined || raw === "") return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

/** `scoped` = only `user:{id}` + `group:{id}` rooms (see emit-user-presence). `global` = legacy broadcast. */
export type UserPresenceBroadcastMode = "scoped" | "global";

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  exposeApiDocs: process.env.EXPOSE_API_DOCS === "true",
  /** High-traffic default: scoped. Set USER_PRESENCE_BROADCAST=global for legacy clients. */
  userPresenceBroadcast:
    (process.env.USER_PRESENCE_BROADCAST as UserPresenceBroadcastMode) === "global"
      ? "global"
      : "scoped",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || "msg",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "mysql",
    socketPath: process.env.DB_SOCKET_PATH || "/tmp/mysql.sock",
    pool: {
      max: parseIntEnv("DB_POOL_MAX", 30),
      min: parseIntEnv("DB_POOL_MIN", 2),
      acquire: parseIntEnv("DB_POOL_ACQUIRE_MS", 60_000),
      idle: parseIntEnv("DB_POOL_IDLE_MS", 10_000),
    },
  },
  socketIo: {
    /** Disabling per-message deflate cuts CPU at high message rates (more bandwidth). */
    perMessageDeflate: process.env.SOCKET_IO_PER_MESSAGE_DEFLATE !== "true",
    pingInterval: parseIntEnv("SOCKET_IO_PING_INTERVAL_MS", 25_000),
    pingTimeout: parseIntEnv("SOCKET_IO_PING_TIMEOUT_MS", 20_000),
    maxHttpBufferSize: parseIntEnv("SOCKET_IO_MAX_HTTP_BUFFER", 1_000_000),
  },
  /**
   * Web Push (VAPID). Public key is safe to expose to the browser; keep the private key secret.
   * `VAPID_SUBJECT` must be a contact URI: `mailto:you@example.com` or `https://your-site.com`.
   */
  webPush: {
    vapidPublicKey: (process.env.VAPID_PUBLIC_KEY || "").trim(),
    vapidPrivateKey: (process.env.VAPID_PRIVATE_KEY || "").trim(),
    vapidSubject: (process.env.VAPID_SUBJECT || "").trim(),
  },
};
