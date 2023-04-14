import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import server from "http";
import morgan from "morgan";

import wordManage from "./routes/WordManage";
import { client } from "./redis";
import { io } from "./socket";
import { CORS, MONGO_CONNECTION, PORT } from "./config";

const app: Application = express();
// const http = server.createServer(app);
// io.listen(http);

app.use(morgan("combined"));
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/manage", wordManage);

app.get("/", (req: Request, res: Response) => {
  res.send("Worked");
});

app.use((req: Request, res: Response) => {
  res.status(404);
});

client
  .connect()
  .then(() =>
    mongoose
      .connect(MONGO_CONNECTION!)
      .then(() =>
        app.listen(PORT || 8030, () => console.log("Server is running"))
      )
  );
