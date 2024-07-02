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
          console.log('cookie', cookie.value);
          if (this.loggedIn) {
            resolve(true);
          }
          else if (cookie.value) {
            console.log('cookie', cookie.value);
            const figmaAuth = cookie.value;
            this.authInfo.id = figmaAuth.user_id;
            this.authInfo.token = figmaAuth.access_token;
            this.expires_in = figmaAuth.expires_in;
            console.log('figmaAuth', figmaAuth);
            this.loggedIn = true;
            resolve(true);
          }
          else if (code) {
            console.log('code', code);
            useFetch('/api/figmaAuth/' + code)
              .then((res) => {
                console.log('figmaAuth', res);
                  resolve(true);
                  this.authInfo.id = response.user_id;
                  this.authInfo.token = response.access_token;
                  this.authInfo.expires_in = response.expires_in;
                  this.authInfo.refresh_token = response.refresh_token;
                  this.loggedIn = true;
                  this.loggedIn = true;
              })
              .catch((error) => {
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