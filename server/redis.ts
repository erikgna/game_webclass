import { createClient } from "redis";

import { REDIS_PASSWORD } from "./env";

export const client = createClient({
  url: process.env.REDIS_CONNECTION,
  password: REDIS_PASSWORD,
});

client.on("error", (err) => console.log("Redis Client Error", err));
