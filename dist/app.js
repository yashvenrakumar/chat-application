"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const notFound_middleware_1 = require("./middlewares/notFound.middleware");
const error_middleware_1 = require("./middlewares/error.middleware");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*",
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use("/api/v1", routes_1.default);
app.use(notFound_middleware_1.notFoundMiddleware);
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
