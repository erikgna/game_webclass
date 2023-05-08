import mongoose from "mongoose"; // Import mongoose

const palavraScheme = new mongoose.Schema({ // Create a new mongoose schema
  palavra: { type: String, unique: true, required: true }, // Define the fields
  dica: { type: String, required: true }, // Define the fields
});

export const Palavra = mongoose.model("Model", palavraScheme, "palavras"); // Create a new mongoose model
