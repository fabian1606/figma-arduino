<template>
  <div class="overlay-container">
    <div class="overlay">
      <h2>Enter Figma Embedded</h2>
      Please enter your embedded iframe URL (can be found in the share dialog under "get embedded code" in the prototype
      view in Figma)
      <br>
      <textarea ref="textarea" @input="extractFigmaId" :class="{'not-valid':notValidUrl}"></textarea>
      Project Name: {{name || "Unknown"}}
      
      <div class="input-container">
        <label>Frame Width</label>
        <input type="number" v-model="frameWidth">
      </div>
      <div class="input-container">
        <label>Frame Height</label>
        <input type="number" v-model="frameHeight">
      </div>
      <button @click="extractFigmaId" :disabled="notValidUrl || frameHeight < 1 || frameWidth < 1">Next</button>

      <h2>Or see your recent files and open one</h2>
      ! The Figma API does not allow direct access to a user's recent files. Therefore, you need to download the JSON file and upload it here. Please note that this might result in the files not being up-to-date. !
      <br>
      
      <div class="input-container">
        <a :href="`https://www.figma.com/api/recent_prototypes?is_global=true&include_repo=true&fuid=${userId}`" download="recent_prototypes.json">Download JSON</a> 
        <input type="file" @change="handleFileUpload">
      </div>
      <div class="recent-file-container">
        <div v-for="file in recent_prototypes" class="recent-file" @click="changeRoute(file.url)">
          <!-- {{ file.fig_file.name }} -->
          <img :src="file.thumbnail_url" alt="test">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { userStore } from '~/stores/auth.js';
import figmaService from '~/services/figmaService.js';

const router = useRouter()

const authStore = userStore();
const userId = ref(null);

onMounted(() => {
  if (authStore.loggedIn) {
    userId.value = authStore.authInfo.userId;
  }
});

const textarea = ref(null);
const notValidUrl = ref(true);
const figmaId = ref(null);
const name = ref("");
const frameWidth = ref("");
const frameHeight = ref("");

const recent_prototypes = ref([]);

const changeRoute = (url) => {
  url = url.replace("https://www.figma.com/proto/","");
  const encodedUrl = encodeURIComponent(url);
  console.log(encodedUrl);
  router.push(`/file/${encodedUrl}`);
};

const extractFigmaId = () => {
  const url = textarea.value.value;
  try {
    const fullUrl = url.match(/url=([^"&]+)/)[1];
    const figmaIdMatch = fullUrl.match(/node-id%3D([^%]+)%26t/);
    const nameMatch = fullUrl.match(/proto%2F[^%]+%2F([^%]+)/);
    name.value = nameMatch ? decodeURIComponent(nameMatch[1]) : 'Unknown';
    const src = url.match(/src="([^"]+)"/)[1];
    figmaId.value = fullUrl;
    notValidUrl.value = false;
    console.log(figmaId.value);
    return figmaId.value;
  } catch (error) {
    notValidUrl.value = true;
  }
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const jsonData = JSON.parse(e.target.result);
      recent_prototypes.value = jsonData.meta.recent_prototypes;
      console.log(jsonData);
      // Weitere Verarbeitung der JSON-Daten
    };
    reader.readAsText(file);
  }
};
</script>

<style lang="scss" scoped>
.overlay-container {
  position: fixed;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 4;
  display: flex;
  justify-content: center;
  align-items: center;
}

.input-container {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}

.not-valid {
  outline: 2px solid red !important;
}

.overlay {
  width: 100%;
  max-width: 50rem;
  margin: auto;
  background-color: #1b1b1b;
  border-radius: 1rem;
  padding: 1rem;

  textarea {
    resize: none;
    width: 100% !important;
    min-height: 6em;
    margin: 1rem 0;
    border-radius: 0.5rem;
    border: none;
    outline: none;
  }
}
.recent-file-container{
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  img{
    width: 10rem;
    aspect-ratio: 16/9;
    object-fit: cover;
  }
  .recent-file{
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background-color: #262626;
    padding: 0.5rem;
    border-radius: 0.5rem;
  }
}
</style>
