import { Sequelize } from "sequelize";
import { env } from "./env";

export const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: "mysql",
  dialectOptions: {
    socketPath: env.db.socketPath,
  },
  pool: {
    max: env.db.pool.max,
    min: env.db.pool.min,
    acquire: env.db.pool.acquire,
    idle: env.db.pool.idle,
  },
  logging: env.nodeEnv === "development" ? console.log : false,
});

export const connectDB = async (): Promise<void> => {
  await sequelize.authenticate();
};
