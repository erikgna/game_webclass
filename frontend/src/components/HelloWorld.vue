<script setup lang="ts">
import { ref } from "vue";
import { io } from "socket.io-client";
import { GameStatus, SocketConstants } from "../constants/Socket.constants";
</script>

<script lang="ts">
const socket = io("http://localhost:8089");
const lines = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M", "Ç"],
];
const defaultGame = {
  remainingAttempts: 0,
  dica: "",
  guessedLetters: [],
  wordList: [],
  word: "",
};

const generateRandomString = (length: number) => {
  const charList =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charList.length);
    result += charList.charAt(randomIndex);
  }
  return result;
};

const gameObj = ref(defaultGame);
const status = ref(GameStatus.ACTIVE);

socket.on(SocketConstants.CONNECT, () => {
  const storageToken = localStorage.getItem("token");
  if (storageToken) {
    socket.emit(SocketConstants.AUTHENTICATE, storageToken);
    return;
  }
});

socket.on(SocketConstants.GAME_STATE, (item) => {
  gameObj.value = item;
});

socket.on(SocketConstants.GAME_OVER, (item) => {
  gameObj.value = { ...defaultGame, word: item };
  status.value = GameStatus.LOST;
});

socket.on(SocketConstants.GAME_WON, (item) => {
  gameObj.value = { ...defaultGame, word: item };
  status.value = GameStatus.WON;
});

export default {
  methods: {
    createToken() {
      const token = generateRandomString(30);
      localStorage.setItem("token", token);
      socket.emit(SocketConstants.NEW_GAME, token);
    },
    sendLetter(letter: string) {
      const token = localStorage.getItem("token");
      socket.emit(SocketConstants.GUESS_LETTER, { token, letter });
    },
    closeModal() {
      status.value = GameStatus.ACTIVE;
    },
    // teste() {
    //   const token = localStorage.getItem("token");
    //   socket.emit("teste", token);
    // },
  },
};
</script>

<template>
  <div v-if="gameObj.dica.length >= 1">
    <strong>Dica: </strong><span>{{ gameObj.dica }}</span>

    <div class="flex">
      <p v-for="item in gameObj.wordList" :key="item">
        {{ item }}
      </p>
    </div>
  </div>

  <button v-if="gameObj.dica.length === 0" @click.prevent="createToken">
    Começar jogo
  </button>

  <div>
    <div v-for="line in lines" :key="line.length" class="line">
      <div v-for="item in line" :key="item" :on-click="() => sendLetter(item)">
        <h2>{{ item }}</h2>
      </div>
    </div>
  </div>
  <!-- <button @click.prevent="teste">Teeste</button> -->
</template>

<style lang="scss">
.line {
  display: flex;
  justify-content: center;
  margin-top: 0.75rem;

  div {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border: 1px solid var(--white);
    border-radius: 6px;
    cursor: pointer;

    &:not(:last-child) {
      margin-right: 0.75rem;
    }

    @media (max-width: 600px) {
      width: 1.75rem;
      height: 1.75rem;

      &:not(:last-child) {
        margin-right: 0.25rem;
      }
    }
  }
}

.flex {
  display: flex;
}
</style>
