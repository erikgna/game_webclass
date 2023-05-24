<script setup lang="ts">
import { ref } from "vue";
import { io } from "socket.io-client";
import { GameStatus, SocketConstants } from "../../constants/Socket.constants";
</script>

<script lang="ts">
const socket = io("https://webclassapi.erikna.com");
const lines = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M", "Ç"],
];
const defaultGame = {
  remainingAttempts: 0,
  dica: "",
  guessedLetters: [""],
  wordList: [""],
  word: "",
};
const fiveMinutes = 300;

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

const secondsToMinutes = (seconds: number) => {
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = seconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${
    remainingSeconds.toString().padStart(2, "0").split(".")[0].length === 1
      ? "0" + remainingSeconds.toString().padStart(2, "0").split(".")[0]
      : remainingSeconds.toString().padStart(2, "0").split(".")[0]
  }`;
};

const dealInterval = () => {
  clearInterval(interval.value);

  interval.value = setInterval(() => {
    timestamp.value = timestamp.value - 1;

    if (timestamp.value <= 0) {
      timestamp.value = fiveMinutes;
      const token = document.cookie
        .split(";")
        .find((c) => c.trim().startsWith("token="))
        ?.split("=")[1];
      socket.emit(SocketConstants.OUT_OF_TIME, token);
      clearInterval(interval.value);
    }
  }, 1000);
};

const gameObj = ref(defaultGame);
const status = ref(GameStatus.ACTIVE);
const timestamp = ref(fiveMinutes);
const interval = ref();
const error = ref(false);

socket.on(SocketConstants.CONNECT, () => {
  const token = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith("token="))
    ?.split("=")[1];
  if (token) {
    socket.emit(SocketConstants.AUTHENTICATE, token);
    return;
  }
});

socket.on(SocketConstants.GAME_STATE, (item) => {
  gameObj.value = item;

  const resultInMilliseconds = item.timestamp - Date.now();
  const resultInSeconds = resultInMilliseconds / 1000;
  timestamp.value = isNaN(resultInSeconds) ? fiveMinutes : resultInSeconds;
  dealInterval();
});

socket.on(SocketConstants.GAME_OVER, (item) => {
  gameObj.value = { ...defaultGame, word: item };
  status.value = GameStatus.LOST;
  timestamp.value = fiveMinutes;
  clearInterval(interval.value);
});

socket.on(SocketConstants.GAME_WON, (item) => {
  gameObj.value = { ...defaultGame, word: item };
  status.value = GameStatus.WON;
  timestamp.value = fiveMinutes;
  clearInterval(interval.value);
});

socket.on(SocketConstants.ERROR, (_) => {
  error.value = true;
});

export default {
  methods: {
    createToken() {
      const token = generateRandomString(30);

      const date = new Date();
      date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
      document.cookie = `token=${token}; expires=${date.toUTCString()}; path=/`;

      socket.emit(SocketConstants.NEW_GAME, token);
      status.value = GameStatus.ACTIVE;

      dealInterval();
    },
    sendLetter(letter: string) {
      if (
        !gameObj.value.wordList.includes(letter) &&
        gameObj.value.guessedLetters.includes(letter)
      ) {
        return;
      }

      const token = document.cookie
        .split(";")
        .find((c) => c.trim().startsWith("token="))
        ?.split("=")[1];

      socket.emit(SocketConstants.GUESS_LETTER, { token, letter });
    },
    closeModal() {
      status.value = GameStatus.ACTIVE;
    },
    closeErrorModal() {
      error.value = false;
    },
    clearState() {
      gameObj.value = defaultGame;
      status.value = GameStatus.ACTIVE;
      timestamp.value = fiveMinutes;
      error.value = false;
    },
    navigation(path: string) {
      window.location.replace(path);
    },
  },
};
</script>

<template>
  <div class="modal" v-if="status !== GameStatus.ACTIVE">
    <div class="modal-content">
      <h2 class="win" v-if="status === GameStatus.WON">Você venceu!</h2>
      <h2 class="lost" v-if="status === GameStatus.LOST">Você perdeu!</h2>
      <p><strong>A palavra era: </strong>{{ gameObj.word }}</p>
      <div class="buttons">
        <button class="button button-orange" @click.prevent="createToken">
          Novo jogo
        </button>
        <button class="button button-white" @click.prevent="clearState">
          Voltar
        </button>
      </div>
    </div>
  </div>

  <div class="modal" v-if="error">
    <div class="modal-content">
      <h2 style="margin-bottom: 16px">Ocorreu um erro</h2>
      <button class="button button-orange" @click.prevent="closeErrorModal">
        Tentar novamente
      </button>
    </div>
  </div>

  <section
    v-if="gameObj.dica.length >= 1"
    class="container container-between game-board"
  >
    <div class="content">
      <h3>{{ secondsToMinutes(timestamp) }}</h3>
      <p>
        <strong>Tentativas: </strong> {{ gameObj.remainingAttempts }} restantes
      </p>
      <p><strong>Dica: </strong> {{ gameObj.dica }}</p>

      <div class="wrong-letters">
        <h2 v-for="item in gameObj.guessedLetters" :key="item">{{ item }}</h2>
      </div>

      <div class="letters-line">
        <div
          class="letter-box letter-box-orange"
          v-for="(item, index) in gameObj.wordList"
          :key="item + index"
        >
          <h2 v-if="item !== '.'">{{ item }}</h2>
        </div>
      </div>
    </div>

    <div>
      <div v-for="line in lines" :key="line.length" class="letters-line">
        <div
          class="letter-box letter-box-white"
          v-for="item in line"
          :key="item"
          v-bind:class="{
            'letter-box-green': gameObj.wordList.some((word) =>
              word
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .includes(item.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
            ),
            'letter-box-red':
              !gameObj.wordList.some((word) =>
                word
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .includes(
                    item.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                  )
              ) && gameObj.guessedLetters.includes(item),
          }"
          @click.prevent="() => sendLetter(item)"
        >
          <h2>{{ item }}</h2>
        </div>
      </div>
    </div>
  </section>

  <section v-if="gameObj.dica.length === 0" class="container container-center">
    <div class="buttons">
      <button class="button button-orange" @click.prevent="createToken">
        Começar jogo
      </button>
      <button
        class="button button-white"
        @click.prevent="navigation('dashboard')"
      >
        Dashboard
      </button>
    </div>
  </section>
</template>

<style lang="scss">
@import "./styles.scss";
@import "../../styles/globalStyles.scss";
</style>
