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
      axios
        .post(DEFAULT_URL, item)
        .then((response) => allWords.value.push(response.data));
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
  },
  mounted() {
    axios.get(DEFAULT_URL).then((response) => (allWords.value = response.data));
  },
};
</script>

<template>
  <section>
    <form>
      <div class="formItem">
        <label for="palavra">Nova palavra</label>
        <input
          id="palavra"
          name="palavra"
          type="text"
          placeholder="Nova palavra"
          v-model="newWord.palavra"
        />
      </div>
      <div class="formItem">
        <label for="dica">Nova dica</label>
        <input
          id="dice"
          name="dice"
          type="text"
          placeholder="Digite uma dica"
          v-model="newWord.dica"
        />
      </div>
      <button @click.prevent="createItem(newWord)">Criar nova</button>
    </form>
    <div class="items">
      <h2>Lista de palavras</h2>
      <div class="item" v-for="item in allWords" :key="item.palavra">
        <div class="formItem">
          <label :for="item.palavra">Palavra</label>
          <input :name="item.palavra" type="text" v-model="item.palavra" />
        </div>
        <div class="formItem">
          <label :for="item.dica">Dica</label>
          <input :name="item.dica" type="text" v-model="item.dica" />
        </div>
        <div class="buttons">
          <button @click.prevent="editItem(item)">Editar</button>
          <button @click.prevent="deleteItem(item._id!)">Excluir</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss">
section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
}
.items {
  display: flex;
  flex-direction: column;
  align-items: center;

  .item {
    margin-top: 24px;
    padding: 8px 24px 16px 24px;
    border-radius: 4px;
    box-shadow: 0px 0px 10px 0px rgba(65, 65, 65, 0.5);

    .buttons {
      margin-top: 16px;
      display: flex;
      align-items: center;

      :last-child {
        background: var(--red);
        margin-left: 16px;
      }
    }
  }
}
.formItem {
  margin-top: 16px;
  display: flex;
  flex-direction: column;

  label {
    font-size: 16px;
    font-weight: 600;
    padding-bottom: 8px;
  }

  input {
    outline: none;
    border: 1px solid var(--white);
    border-radius: 4px;
    padding: 12px 8px;
  }
}
button {
  cursor: pointer;
  color: var(--white);
  font-weight: 600;
  background: var(--orange);
  width: 104px;
  padding: 8px 0;
  border-radius: 4px;
  border: none;

  &:hover {
    opacity: 0.75;
    transition: 200ms ease-in;
  }
}
form {
  min-width: 330px;
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-bottom: 48px;

  input,
  div,
  button {
    width: 100%;
  }
  button {
    margin-top: 16px;
  }
}
</style>
