<script setup lang="ts">
import { ref } from "vue";
import { io } from "socket.io-client";
import { GameStatus, SocketConstants } from "../constants/Socket.constants";
</script>

<script lang="ts">
const socket = io("45.90.108.97:8029");
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
      socket.emit(SocketConstants.OUT_OF_TIME, localStorage.getItem("token"));
      clearInterval(interval.value);
    }
  }, 1000);
};

const gameObj = ref(defaultGame);
const status = ref(GameStatus.ACTIVE);
const timestamp = ref(fiveMinutes);
const interval = ref();

socket.on(SocketConstants.CONNECT, () => {
  const storageToken = localStorage.getItem("token");
  if (storageToken) {
    socket.emit(SocketConstants.AUTHENTICATE, storageToken);
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

export default {
  methods: {
    createToken() {
      const token = generateRandomString(30);
      localStorage.setItem("token", token);
      socket.emit(SocketConstants.NEW_GAME, token);
      status.value = GameStatus.ACTIVE;

      dealInterval();
    },
    sendLetter(letter: string) {
      const token = localStorage.getItem("token");
      socket.emit(SocketConstants.GUESS_LETTER, { token, letter });
    },
    closeModal() {
      status.value = GameStatus.ACTIVE;
    },
  },
};
</script>

<template>
  <div class="modal" v-if="status !== GameStatus.ACTIVE">
    <div>
      <h2 class="win" v-if="status === GameStatus.WON">Você venceu!</h2>
      <h2 class="lost" v-if="status === GameStatus.LOST">Você perdeu!</h2>
      <p><strong>A palavra era: </strong>{{ gameObj.word }}</p>
      <button class="button" @click.prevent="createToken">Novo jogo</button>
    </div>
  </div>
  <div v-if="gameObj.dica.length >= 1" class="screen">
    <div class="content">
      <h3>{{ secondsToMinutes(timestamp) }}</h3>
      <p>
        <strong>Tentativas: </strong> {{ gameObj.remainingAttempts }} restantes
      </p>
      <p><strong>Dica: </strong> {{ gameObj.dica }}</p>

      <div class="wrongLatters">
        <h2 v-for="item in gameObj.guessedLetters" :key="item">{{ item }}</h2>
      </div>

      <div class="word">
        <div v-for="(item, index) in gameObj.wordList" :key="item + index">
          <h2 v-if="item !== '.'">{{ item }}</h2>
        </div>
      </div>
    </div>

    <div>
      <div v-for="line in lines" :key="line.length" class="line">
        <div
          v-for="item in line"
          :key="item"
          v-bind:class="{
            greenBox: gameObj.wordList.includes(item),
            redBox:
              !gameObj.wordList.includes(item) &&
              gameObj.guessedLetters.includes(item),
          }"
          @click.prevent="() => sendLetter(item)"
        >
          <h2>{{ item }}</h2>
        </div>
      </div>
    </div>
  </div>

  <div v-if="gameObj.dica.length === 0" class="screenCenter">
    <button class="button" @click.prevent="createToken">Começar jogo</button>
  </div>
</template>

<style lang="scss">
.modal {
  top: 0;
  left: 0;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #00000050;
  width: 100vw;
  height: 100vh;

  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 48px;
    background-color: #2e2e2e;
    border-radius: 6px;

    h2 {
      font-size: 24px;
    }
    p {
      font-size: 16px;
      margin: 8px 0 24px 0;
    }

    .win {
      color: var(--green);
    }
    .lost {
      color: var(--red);
    }
  }
}
.screen {
  height: 100vh;
  width: 100vw;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 32px 0;
}
.screenCenter {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  h3 {
    color: var(--orange);
    font-size: 28px;
    margin-bottom: 2rem;
  }

  .wrongLatters {
    margin-top: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--white);
    border-radius: 6px;
    min-height: 2.5rem;
    min-width: 300px;
    padding: 0 8px;

    h2 {
      &:not(:last-child) {
        margin-right: 12px;
      }
    }
  }

  .word {
    padding-top: 6rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    div {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      border: 1px solid var(--orange);
      border-radius: 6px;
      margin-top: 0.75rem;

      &:not(:last-child) {
        margin-right: 0.75rem;
      }

      @media (max-width: 600px) {
        height: 1.75rem;
        width: 1.75rem;

        h2 {
          font-size: 1rem;
        }
        &:not(:last-child) {
          margin-right: 0.5rem;
        }
      }
    }
  }
}

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

      h2 {
        font-size: 1rem;
      }
    }
  }
}
.redBox {
  cursor: not-allowed !important;
  border: 1px solid var(--red) !important;
}
.greenBox {
  cursor: not-allowed !important;
  border: 1px solid var(--green) !important;
}
.button {
  cursor: pointer;
  color: var(--dark);
  font-weight: 600;
  background: var(--orange);
  border-radius: 40px;
  width: 8.5rem;
  height: 2.5rem;
  border: none;

  &:hover {
    opacity: 0.75;
    transition: 200ms ease-in;
  }
}
</style>
