import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import wordManage from "./routes/WordManage";
import { client } from "./redis";
import { io } from "./socket";

dotenv.config();

const app: Application = express();
app.use(cors());
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
  .then(() => io.listen(Number(process.env.SOCKET_PORT || "8029")));

const port = process.env.REST_PORT || 8030;
app.listen(port, () =>
  mongoose
    .connect(process.env.MONGO_CONNECTION!)
    .then(() => console.log(`The server is running on the port ${port}`))
);
