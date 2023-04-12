import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import wordManage from "./routes/WordManage";

import { Server } from "socket.io";

// import { Palavra } from "./models/Word";
import { client } from "./redis";
import { Palavra } from "./models/Word";

dotenv.config();

const app: Application = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/manage", wordManage);

app.get("/", async (req: Request, res: Response) => {
  res.send("Worked");
});

app.use((req: Request, res: Response) => {
  res.status(404);
});

const port = process.env.PORT || 8030;

interface IGame {
  word: string;
  dica: string;
  remainingAttempts: number;
  guessedLetters: string[];
  wordList: string[];
}

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("Usuário conectado");

  socket.on("authenticate", async (token) => {
    // await client.del(token);
    try {
      const value = await client.get(token);
      if (value) {
        const state = JSON.parse(value) as IGame;
        socket.emit("gameStarted", {
          remainingAttempts: state.remainingAttempts,
          dica: state.dica,
          guessedLetters: state.guessedLetters,
          wordList: state.wordList,
        });
        return;
      }

      const word = (await Palavra.aggregate([{ $sample: { size: 1 } }]))[0];

      const state = {
        word: word.palavra,
        dica: word.dica,
        remainingAttempts: word.palavra.length + 3,
        guessedLetters: [],
        wordList: Array.from({ length: word.palavra.length }, () => "."),
      };
      await client.set(token, JSON.stringify(state));
      socket.emit("gameStarted", {
        remainingAttempts: state.remainingAttempts,
        dica: state.dica,
        guessedLetters: state.guessedLetters,
        wordList: state.guessedLetters,
      });
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("guessLetter", async ({ token, letter }) => {
    try {
      const value = await client.get(token);
      if (!value) {
        throw Error();
      }
      const state = JSON.parse(value) as IGame;

      // Verificar se a letra já foi adivinhada antes
      if (state.guessedLetters.includes(letter)) {
        throw new Error("Essa letra já foi adivinhada");
      }

      // Verificar se a letra está na palavra
      if (!state.word.includes(letter)) {
        state.remainingAttempts--;
      } else {
        for (let i = 0; i < state.word.length; i++) {
          if (state.word[i] === letter) {
            state.wordList[i] = letter;
          }
        }
      }

      // Adicionar a letra à lista de letras adivinhadas
      state.guessedLetters.push(letter);

      // Verificar se o jogo acabou
      if (state.remainingAttempts === 0) {
        socket.emit("gameOver", { word: state.word });
        await client.del(token);
      } else if (
        state.word.split("").every((c) => state.guessedLetters.includes(c))
      ) {
        socket.emit("gameWon", { word: state.word });
        await client.del(token);
      } else {
        await client.set(token, JSON.stringify(state));
        socket.emit("gameState", {
          remainingAttempts: state.remainingAttempts,
          dica: state.dica,
          guessedLetters: state.guessedLetters,
          wordList: state.wordList,
        });
      }
    } catch (error) {
      console.error(error);
      socket.emit("gameError", error);
    }
  });

  socket.on("teste", async (token) => {
    console.log(await client.get(token));
  });

  socket.on("disconnect", () => {
    console.log("Usuário desconectado");
  });
});

client.connect().then(() => io.listen(8089));

app.listen(port, () =>
  mongoose
    .connect(process.env.MONGO_CONNECTION!)
    .then(() => console.log(`The server is running on the port ${port}`))
);
