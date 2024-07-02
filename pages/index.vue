<template>
    <enterFigmaId @entered="emits('enterFigmaEmbedded', $event)"></enterFigmaId>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const runtimeConfig = useRuntimeConfig()

onMounted(() => {
  console.log(runtimeConfig.public.FIREBASE_API_KEY);
});

const enterFigmaIdPage = ref(false);




</script>

<style scoped>
.dev-container {
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 4;
  height: fit-content;
}
.figma-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: show;
}

.hide {
  overflow: hidden;
}
</style>
