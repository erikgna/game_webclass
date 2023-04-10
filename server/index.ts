import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import wordManage from "./routes/WordManage";
import { client } from "./redis";

dotenv.config();

const app: Application = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/manage", wordManage);

app.get("/", async (req: Request, res: Response) => {
  await client.connect();

  await client.set("key", "value");
  const value = await client.get("key");
  console.log(value);
  await client.disconnect();

  res.send("Worked");
});

app.use((req: Request, res: Response) => {
  res.status(404);
});

const port = process.env.PORT || 8030;

app.listen(port, () =>
  mongoose
    .connect(process.env.MONGO_CONNECTION!)
    .then(() => console.log(`The server is running on the port ${port}`))
);
