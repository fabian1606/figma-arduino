import { defineStore } from "pinia";
import axios from "axios";

// const runtimeConfig = useRuntimeConfig()

export const userStore = defineStore("auth", {
  state: () => {
    return {
      loggedIn: false,
      authInfo: {
        id: null,
        token: null,
        expires_in: null,
        refresh_token: null,
        json: null,
      },
    };
  },
  actions: {
    async logout() {
    },
    async checkAuth(code) {
      console.log('checkAuth');
      return new Promise((resolve, reject) => {
        const cookie =  useCookie('figmaAuth');
        console.log('cookie Value', cookie);
        if (this.loggedIn) {
          resolve(cookie.value);
        }
        else if (cookie.value) {
          const figmaAuth = cookie.value;
          this.authInfo.id = figmaAuth.user_id;
          this.authInfo.token = figmaAuth.access_token;
          this.expires_in = figmaAuth.expires_in;
          console.log('figmaAuth', figmaAuth);
          this.loggedIn = cookie.value;
          resolve(true);
        }
        else if (code) {
          console.log('code', code);
          const redirectUrl = useRequestURL().protocol + "//" + useRequestURL().host;
          useFetch('/api/figmaAuth/' + code, {
            method: 'POST',
            body: { redirect: redirectUrl },
            onResponse: ({ response }) => {
              console.log('response', response._data);
              const res = response._data;
              this.authInfo.id = res.user_id;
              this.authInfo.token = res.access_token;
              this.authInfo.expires_in = res.expires_in;
              this.authInfo.refresh_token = res.refresh_token;
              this.loggedIn = true;
              this.authInfo.json = JSON.stringify(res);
              resolve(this.authInfo.json);
            },
          }).catch((error) => {
            console.error('Error fetching token:', error);
            reject(false);
          });

          } else {
            resolve(false);
          }
      });
    }
  },
});