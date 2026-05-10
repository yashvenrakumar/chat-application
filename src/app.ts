import cors from "cors";
import express from "express";
import helmet from "helmet";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import apiRouter from "./routes";

const app = express();

app.use(
  cors({
    origin: "*",
  }),
);

app.use(helmet());
app.use(express.json());

app.use("/api/v1", apiRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
