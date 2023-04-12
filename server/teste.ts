import redis from "redis";
import { Server } from "socket.io";

import { Palavra } from "./models/Word";

interface IGame {
  word: string;
  remainingAttempts: number;
  guessedLetters: string[];
}

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});
const redisClient = redis.createClient();

io.on("connection", (socket) => {
  console.log("Usuário conectado");

  socket.on("authenticate", async (token) => {
    try {
      // Verificar se o token existe no Redis
      await redisClient.connect();

      const value = await redisClient.json.get(token, { path: ".node" });

      if (!value) {
        throw new Error("Token inválido");
      }

      // Obter a palavra aleatória do MongoDB
      const word = (await Palavra.aggregate([{ $sample: { size: 1 } }]))[0];

      // Iniciar o jogo
      const state = {
        word,
        remainingAttempts: word.length + 3,
        guessedLetters: [],
      };
      await redisClient.json.set(token, ".", state);
      socket.emit("gameStarted", {
        remainingAttempts: state.remainingAttempts,
      });
    } catch (error) {
      console.error(error);
      socket.emit("gameError", error);
    }
  });

  socket.on("guessLetter", async ({ token, letter }) => {
    try {
      // Obter o estado do jogo do Redis
      const state = (await redisClient.json.get(token, {
        path: ".node",
      })) as unknown as IGame;
      if (!state) {
        throw new Error("Token inválido");
      }

      // Verificar se a letra já foi adivinhada antes
      if (state.guessedLetters.includes(letter)) {
        throw new Error("Essa letra já foi adivinhada");
      }

      // Verificar se a letra está na palavra
      if (!state.word.includes(letter)) {
        state.remainingAttempts--;
      }

      // Adicionar a letra à lista de letras adivinhadas
      state.guessedLetters.push(letter);

      // Verificar se o jogo acabou
      if (state.remainingAttempts === 0) {
        socket.emit("gameOver", { word: state.word });
        await redisClient.del(token);
      } else if (
        state.word.split("").every((c) => state.guessedLetters.includes(c))
      ) {
        socket.emit("gameWon", { word: state.word });
        await redisClient.del(token);
      } else {
        await redisClient.json.set(token, ".", state as any);
        socket.emit("gameState", {
          remainingAttempts: state.remainingAttempts,
          guessedLetters: state.guessedLetters,
        });
      }
    } catch (error) {
      console.error(error);
      socket.emit("gameError", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Usuário desconectado");
  });
});
