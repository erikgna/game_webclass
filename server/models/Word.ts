import mongoose from "mongoose";

const palavraScheme = new mongoose.Schema({
  palavra: { type: String, unique: true, required: true },
  dica: { type: String, required: true },
});

export const Palavra = mongoose.model("Model", palavraScheme, "palavras");
