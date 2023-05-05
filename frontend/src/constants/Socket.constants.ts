export enum SocketConstants {
  CONNECT = "connect",
  NEW_GAME = "newGame",
  GAME_STARTED = "gameStarted",
  GUESS_LETTER = "guessLetter",
  AUTHENTICATE = "authenticate",
  OUT_OF_TIME = "outOfTime",
  GAME_OVER = "gameOver",
  GAME_WON = "gameWon",
  GAME_STATE = "gameState",
  ERROR = "error",
}

export enum GameStatus {
  ACTIVE = "ACTIVE",
  LOST = "LOST",
  WON = "WON",
}
