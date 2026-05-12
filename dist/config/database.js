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
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const env_1 = require("./env");
exports.sequelize = new sequelize_1.Sequelize(env_1.env.db.name, env_1.env.db.user, env_1.env.db.password, {
    host: env_1.env.db.host,
    port: env_1.env.db.port,
    dialect: "mysql",
    dialectOptions: Object.assign({}, (env_1.env.db.socketPath ? { socketPath: env_1.env.db.socketPath } : {})),
    pool: {
        max: env_1.env.db.pool.max,
        min: env_1.env.db.pool.min,
        acquire: env_1.env.db.pool.acquire,
        idle: env_1.env.db.pool.idle,
    },
    logging: env_1.env.nodeEnv === "development" ? console.log : false,
});
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.sequelize.authenticate();
});
exports.connectDB = connectDB;
