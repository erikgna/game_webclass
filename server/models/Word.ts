import mongoose from "mongoose";

const palavraScheme = new mongoose.Schema({
  palavra: String,
  dica: String,
});

export const Palavra = mongoose.model("Palavra", palavraScheme);
