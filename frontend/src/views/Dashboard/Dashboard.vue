<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
</script>

<script lang="ts">
const DEFAULT_URL = "https://webclassapi.erikna.com/api/v1/manage/";
interface IPalavra {
  _id?: string;
  palavra: string;
  dica: string;
}

const allWords = ref([] as IPalavra[]);
const newWord = ref({ palavra: "", dica: "" });

export default {
  methods: {
    createItem(item: IPalavra) {
      axios.post(DEFAULT_URL, item).then((response) => {
        allWords.value.unshift(response.data);
        newWord.value = { palavra: "", dica: "" };
      });
    },
    editItem(item: IPalavra) {
      axios.patch(DEFAULT_URL + item._id, item).then((_) => {
        const index = allWords.value.findIndex((x) => x._id === item._id);
        allWords.value.splice(index, 1, item);
      });
    },
    deleteItem(id: string) {
      axios
        .delete(DEFAULT_URL + id)
        .then(
          (_) => (allWords.value = allWords.value.filter((x) => x._id !== id))
        );
    },
    navigation(path: string) {
      window.location.replace(path);
    },
  },
  mounted() {
    axios
      .get(DEFAULT_URL)
      .then((response) => (allWords.value = response.data.reverse()));
  },
};
</script>

<template>
  <section class="container dashboard">
    <h2>Adicionar palavras</h2>
    <form class="new-word">
      <div class="form-item">
        <label for="palavra">Palavra</label>
        <input
          autocomplete="off"
          id="palavra"
          name="palavra"
          type="text"
          placeholder="Nova palavra"
          v-model="newWord.palavra"
        />
      </div>
      <div class="form-item">
        <label for="dica">Dica</label>
        <input
          autocomplete="off"
          id="dica"
          name="dica"
          type="text"
          placeholder="Digite uma dica"
          v-model="newWord.dica"
        />
      </div>
      <div class="buttons">
        <button
          class="button button-orange"
          @click.prevent="createItem(newWord)"
        >
          Criar nova
        </button>
        <button class="button button-white" @click.prevent="navigation('/')">
          Voltar ao Início
        </button>
      </div>
    </form>
    <div class="divider"></div>
    <h2>Lista de palavras</h2>
    <p v-if="allWords.length === 0">Não há palavras listadas</p>
    <div class="items">
      <form v-for="item in allWords" :key="item.palavra">
        <div class="form-item">
          <label :for="item.palavra">Palavra</label>
          <input
            :name="item.palavra"
            type="text"
            v-model.trim.lazy="item.palavra"
          />
        </div>
        <div class="form-item">
          <label :for="item.dica">Dica</label>
          <input :name="item.dica" type="text" v-model="item.dica" />
        </div>
        <div class="buttons">
          <button class="button button-orange" @click.prevent="editItem(item)">
            Editar
          </button>
          <button
            class="button button-red"
            @click.prevent="deleteItem(item._id!)"
          >
            Excluir
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<style lang="scss">
@import "./styles.scss";
@import "../../styles/globalStyles.scss";
</style>
