import { defineStore } from "pinia";
import axios from "axios";

imo


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
    async checkAuth(route) {
      return new Promise((resolve, reject) => {
        router.isReady().then(() => {
          // console.log(router.currentRoute.value.query);
          const query = route.currentRoute.value.query;
          // get the token from the cookie
          const cookie = document.cookie;

          if (this.loggedIn) {
            resolve(true);
          }
          else if (cookie.includes('figmaAuth')) {
            const figmaAuth = JSON.parse(cookie.split('figmaAuth=')[1].split(';')[0]);
            this.authInfo.id = figmaAuth.user_id;
            this.authInfo.token = figmaAuth.access_token;
            this.expires_in = figmaAuth.expires_in;
            console.log('figmaAuth', figmaAuth);
            this.loggedIn = true;
            resolve(true);
          }
          else if (query.code) {
            console.log('code', query.code);
            axios.post('https://www.figma.com/api/oauth/token',
              new URLSearchParams({
                client_id: 'bR686GSw85204e9wBbpErS',
                client_secret: 'JMkghdIOVvBR4EW1dJQCb3pZrH6GeG',
                redirect_uri: 'http://localhost:5173/',
                code: query.code,
                grant_type: 'authorization_code'

              }).toString(),
              {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                }
              }
            )
              .then((response) => {
                if (response.status === 200) {
                  console.log('response', response);
                  this.authInfo.id = response.data.user_id;
                  this.authInfo.token = response.data.access_token;
                  this.authInfo.expires_in = response.data.expires_in;
                  this.authInfo.refresh_token = response.data.refresh_token;
                  this.loggedIn = true;
                  document.cookie = `figmaAuth=${JSON.stringify(response.data)}; Secure; SameSite=Strict`;
                  this.loggedIn = true;
                  resolve(true);
                }
                else {
                  alert('Authentication failed');
                  resolve(false);
                }
              })
              .catch((error) => {
                console.error('Error fetching token:', error);
                reject(error);
              });
          } else {
            resolve(false);
          }
        }).catch(error => {
          console.error('Error checking auth:', error);
          reject(error);
        });
      });
    }
  },
});