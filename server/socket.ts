import { Server } from "socket.io";

import { SocketConstants } from "./constants/SocketConstants";
import { Palavra } from "./models/Word";
import { client } from "./redis";
import { IGame } from "./interfaces/Game";

const TOKEN_EXPIRATION_TIME = 1000 * 60 * 5;

export const io = new Server({
  cors: {
    origin: "https://web_game_class",
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
    await client.set(token, JSON.stringify(state), {
      EX: TOKEN_EXPIRATION_TIME,
    });
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

      const specialLetters = [];
      if (letter === "A") {
        if (
          state.word.includes("Ã") ||
          state.word.includes("Á") ||
          state.word.includes("Â") ||
          state.word.includes("A") ||
          state.word.includes("À")
        ) {
          specialLetters.push(...["Ã", "Á", "À", "Â", "A"]);
        }
      } else if (letter === "E") {
        if (
          state.word.includes("Ê") ||
          state.word.includes("E") ||
          state.word.includes("É")
        ) {
          specialLetters.push(...["Ê", "É", "E"]);
        }
      } else if (letter === "I") {
        if (state.word.includes("I") || state.word.includes("Í")) {
          specialLetters.push(...["I", "Í"]);
        }
      } else if (letter === "O") {
        if (
          state.word.includes("Ó") ||
          state.word.includes("Ò") ||
          state.word.includes("Ô") ||
          state.word.includes("Õ") ||
          state.word.includes("O")
        ) {
          specialLetters.push(...["Õ", "Ô", "Ó", "Ò", "O"]);
        }
      } else if (letter === "U") {
        if (state.word.includes("Ú") || state.word.includes("U")) {
          specialLetters.push(...["U", "Ú"]);
        }
      }

      if (specialLetters.length > 0) {
        for (let c = 0; c < specialLetters.length; c++) {
          for (let i = 0; i < state.word.length; i++) {
            if (state.word[i] === specialLetters[c]) {
              state.wordList[i] = specialLetters[c];
            }
          }
        }
      } else {
        if (!state.word.includes(letter)) {
          state.remainingAttempts--;
        } else {
          for (let i = 0; i < state.word.length; i++) {
            if (state.word[i] === letter) {
              state.wordList[i] = letter;
            }
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
        await client.set(token, JSON.stringify(state), {
          EX: TOKEN_EXPIRATION_TIME,
        });
        socket.emit(SocketConstants.GAME_STATE, {
          remainingAttempts: state.remainingAttempts,
          dica: state.dica,
          guessedLetters: state.guessedLetters,
          wordList: state.wordList,
        });
      }
    } catch (_) {}
  });
});
