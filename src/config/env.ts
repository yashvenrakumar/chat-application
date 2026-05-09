import dotenv from "dotenv";

dotenv.config();

 
export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
    exposeApiDocs: process.env.EXPOSE_API_DOCS === "true",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || "chat",
    user: process.env.DB_USER || "chat",
    password: process.env.DB_PASSWORD || "mysql",
    socketPath: process.env.DB_SOCKET_PATH || "/tmp/mysql.sock",
  },
};
