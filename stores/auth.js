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
          const redirectUrl = useRequestURL().protocol + "//" + useRequestURL().host;
            useFetch('/api/figmaAuth/' + code,{method: 'POST', body: {redirect: redirectUrl}})
              .then((res) => {
                console.log('figmaAuth', res);
                this.authInfo.id = res.user_id;
                this.authInfo.token = res.access_token;
                this.authInfo.expires_in = res.expires_in;
                this.authInfo.refresh_token = res.refresh_token;
                this.loggedIn = true;
                this.loggedIn = true;
                this.json = JSON.stringify(res);
                console.log('this.loggedIn', this.loggedIn);
                resolve(this.json);
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