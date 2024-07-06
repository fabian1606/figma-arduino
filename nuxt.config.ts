// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
  ],
  css: ['~/assets/css/main.scss'],
  runtimeConfig: {
    FIGMA_CLIENT_SECRET: process.env.FIGMA_CLIENT_SECRET,
    public: {
      FIGMA_CLIENT_ID: process.env.FIGMA_CLIENT_ID,
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
    }
  },
  routeRules: {
    '/api/figma/**': {  
      proxy: { to: "https://api.figma.com/**", },
    }
  },
})
