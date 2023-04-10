import { createClient } from "redis";

export const client = createClient({
  url: "redis://default:Utc30rgaq*@dashboard.erikna.com:6379",
});

client.on("error", (err) => console.log("Redis Client Error", err));
