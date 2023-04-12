import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Server } from "socket.io";

import wordManage from "./routes/WordManage";
import { client } from "./redis";
import { Palavra } from "./models/Word";
import { SocketConstants } from "./socket";

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
  timestamp: number;
}

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on(SocketConstants.CONNECTION, (socket) => {
  socket.on(SocketConstants.NEW_GAME, async (token) => {
    const word = (await Palavra.aggregate([{ $sample: { size: 1 } }]))[0];

    const fiveMinutes = 300000;
    const state = {
      word: word.palavra,
      dica: word.dica,
      remainingAttempts: word.palavra.length + 3,
      guessedLetters: [],
      timestamp: Date.now() + fiveMinutes,
      wordList: Array.from({ length: word.palavra.length }, () => "."),
    };
    await client.set(token, JSON.stringify(state));
    socket.emit(SocketConstants.GAME_STATE, {
      remainingAttempts: state.remainingAttempts,
      dica: state.dica,
      guessedLetters: state.guessedLetters,
      wordList: state.wordList,
      timestamp: state.timestamp,
    });
  });

  socket.on(SocketConstants.AUTHENTICATE, async (token) => {
    try {
      const value = await client.get(token);
      if (value) {
        const state = JSON.parse(value) as IGame;
        socket.emit(SocketConstants.GAME_STATE, {
          remainingAttempts: state.remainingAttempts,
          dica: state.dica,
          guessedLetters: state.guessedLetters,
          timestamp: state.timestamp,
          wordList: state.wordList,
        });
      }
    } catch (_) {}
  });

  socket.on(SocketConstants.OUT_OF_TIME, async (token) => {
    const value = await client.get(token);
    if (value) {
      const state = JSON.parse(value) as IGame;

      if (state.timestamp < Date.now()) {
        socket.emit(SocketConstants.GAME_OVER, state.word);
        await client.del(token);
      }
    }
  });

  socket.on(SocketConstants.GUESS_LETTER, async ({ token, letter }) => {
    try {
      const value = await client.get(token);
      if (!value) {
        throw Error();
      }
      const state = JSON.parse(value) as IGame;

      if (state.timestamp < Date.now()) {
        socket.emit(SocketConstants.GAME_OVER, state.word);
        await client.del(token);
      }

      if (state.guessedLetters.includes(letter)) {
        throw new Error("Essa letra já foi adivinhada");
      }

      if (!state.word.includes(letter)) {
        state.remainingAttempts--;
      } else {
        for (let i = 0; i < state.word.length; i++) {
          if (state.word[i] === letter) {
            state.wordList[i] = letter;
          }
        }
      }

      state.guessedLetters.push(letter);

      if (state.remainingAttempts === 0) {
        socket.emit(SocketConstants.GAME_OVER, state.word);
        await client.del(token);
      } else if (
        state.word.split("").every((c) => state.guessedLetters.includes(c))
      ) {
        socket.emit(SocketConstants.GAME_WON, state.word);
        await client.del(token);
      } else {
        await client.set(token, JSON.stringify(state));
        socket.emit(SocketConstants.GAME_STATE, {
          remainingAttempts: state.remainingAttempts,
          dica: state.dica,
          guessedLetters: state.guessedLetters,
          wordList: state.wordList,
        });
      }
    } catch (_) {}
  });

  // socket.on("teste", async (token) => {
  //   console.log(await client.get(token));
  // });
});

client.connect().then(() => io.listen(8089));

app.listen(port, () =>
  mongoose
    .connect(process.env.MONGO_CONNECTION!)
    .then(() => console.log(`The server is running on the port ${port}`))
);
