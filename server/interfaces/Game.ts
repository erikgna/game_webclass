export interface IGame {
  word: string;
  dica: string;
  remainingAttempts: number;
  guessedLetters: string[];
  wordList: string[];
  timestamp: number;
}
