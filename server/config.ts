import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT;
export const CORS = process.env.CORS;
export const MONGO_CONNECTION = process.env.MONGO_CONNECTION;
export const REDIS_CONNECTION = process.env.REDIS_CONNECTION;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
