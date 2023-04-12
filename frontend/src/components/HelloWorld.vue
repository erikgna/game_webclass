<script setup lang="ts">
import { ref } from "vue";
import { io } from "socket.io-client";
</script>

<script lang="ts">
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

const dica = ref("");
const word = ref([]);
const socket = io("http://localhost:8089");

const sendToken = () => {
  const storageToken = localStorage.getItem("token");
  if (storageToken) {
    socket.emit("authenticate", storageToken);
    return;
  }

  const token = generateRandomString(30);
  localStorage.setItem("token", token);
  socket.emit("authenticate", token);
};

socket.on("connect", () => {
  sendToken();
});

socket.on("gameStarted", (item) => {
  dica.value = item.dica;
  word.value = item.wordList;
});

socket.on("gameState", (item) => {
  word.value = item.wordList;
});

export default {
  props: ["pageCreated"],
  data() {
    return {
      text: "",
    };
  },
  methods: {
    submitForm() {
      const token = localStorage.getItem("token");
      socket.emit("guessLetter", { token, letter: this.text });
    },
    teste() {
      const token = localStorage.getItem("token");
      socket.emit("teste", token);
    },
  },
};
</script>

<template>
  <strong>Dica: </strong><span>{{ dica }}</span>

  <input type="text" v-model="text" />
  <div class="flex">
    <p v-for="item in word" :key="item">
      {{ item }}
    </p>
  </div>
  <button @click.prevent="submitForm">Enviar letra</button>
  <button @click.prevent="teste">Teeste</button>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
.flex {
  display: flex;
}
</style>
