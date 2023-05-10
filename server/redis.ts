import { createClient } from "redis";

import { REDIS_CONNECTION, REDIS_PASSWORD } from "./config";

export const client = createClient({
  url: REDIS_CONNECTION,
  password: REDIS_PASSWORD,
});

client.on("error", (err) => console.log("Redis Client Error", err));
