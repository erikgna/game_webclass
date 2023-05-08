export interface IGame { // Create a new interface IGame
  word: string; //define o campo word como string 
  dica: string; //define o campo dica como string
  remainingAttempts: number; //define o campo remainingAttempts como number
  guessedLetters: string[]; //define o campo guessedLetters como string[]
  wordList: string[]; //define o campo wordList como string[]
  timestamp: number; //define o campo timestamp como number
}
