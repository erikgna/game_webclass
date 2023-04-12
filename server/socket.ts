import { Server } from "socket.io";

export enum SocketConstants {
  CONNECTION = "connection",
  NEW_GAME = "newGame",
  GAME_STARTED = "gameStarted",
  GUESS_LETTER = "guessLetter",
  AUTHENTICATE = "authenticate",
  OUT_OF_TIME = "outOfTime",
  GAME_OVER = "gameOver",
  GAME_WON = "gameWon",
  GAME_STATE = "gameState",
}

// const io = new Server({
//   cors: {
//     origin: "https://forca.erikna.com",
//   },
// });

// io.on(SocketStatics.CONNECTION, (socket) => {
//   socket.on(SocketStatics.ON_CONNECTION, () => {});
// });
