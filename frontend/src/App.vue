<script lang="ts">
import HelloWorld from "./components/HelloWorld.vue";

export default {
  components: {
    HelloWorld,
  },
  methods: {
    pageCreated(pageObj: any) {
      console.log(pageObj);
    },
  },
};
</script>

<template>
  <hello-world :pageCreated="pageCreated"></hello-world>
</template>
