import { createClient } from "redis";

export const client = createClient({
  url: process.env.REDIS_CONNECTION,
});

client.on("error", (err) => console.log("Redis Client Error", err));
