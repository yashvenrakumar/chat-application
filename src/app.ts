import cors from "cors";
import express from "express";
// import helmet from "helmet";
 
import { env } from "./config/env";
 
const app = express();

if (env.trustProxy) {
  app.set("trust proxy", 1);
}

 

// app.use(helmet());
 
 
 app.use(express.json());

 
// app.use("/api/v1", apiRouter);
 

export default app;
