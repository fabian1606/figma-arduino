// plugins/firebase.js
import { getDatabase, ref as dbRef, onValue, set, get,push } from 'firebase/database';
import { initializeApp } from 'firebase/app';

// Function to initialize Firebase and export the database instance
export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig();

  const config = {
    apiKey: runtimeConfig.public.FIREBASE_API_KEY,
    authDomain: runtimeConfig.public.FIREBASE_AUTH_DOMAIN,
    projectId: runtimeConfig.public.FIREBASE_PROJECT_ID,
    storageBucket: runtimeConfig.public.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: runtimeConfig.public.FIREBASE_MESSAGING_SENDER_ID,
    appId: runtimeConfig.public.FIREBASE_APP_ID,
    databaseURL: runtimeConfig.public.FIREBASE_DATABASE_URL,
  };

  // Initialize Firebase
  const app = initializeApp(config);
  const db = getDatabase(app);

  class ContentDataService {
    lastTimestamp = 0;
    getAll() {
      const dbRefInstance = dbRef(db, 'test');
      onValue(dbRefInstance, (snapshot) => {
        if (snapshot.exists()) {
          const rawData = snapshot.val();
          // get image with the object key from getImage()
        } else {
          console.warn("No data available");
        }
      });
      return dbRefInstance;
    }

    async setScreenDistortion(id, corners) {
      return new Promise((resolve, reject) => {
        // console.log("id", id);
        set(dbRef(db, `${id}/ScreenDistortion`), corners)
          .then(() => {
            resolve("Data successfully written!");
          })
          .catch((error) => {
            reject(error);
          });
      });
    }

    
    async getScreenDistortion(newId) {
      const id = newId;
      return new Promise((resolve, reject) => {
        if (!id) {
          reject("NO_UUID_PROVIDED");
        }
        get(dbRef(db, `${id}/ScreenDistortion`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              resolve(snapshot.val());
            } else {
              reject("NO_DATA_FOUND");
            }
          })
          .catch((error) => {
            reject(error);
          });
        });
      }
      async setConfig(id, config) {
        return new Promise((resolve, reject) => {
          set(dbRef(db, `${id}/config`), config)
            .then(() => {
              resolve("Data successfully written!");
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
      async getConfig(newId) {
        const id = newId;
        return new Promise((resolve, reject) => {
          if (!id) {
            reject("NO_UUID_PROVIDED");
          }
          get(dbRef(db, `${id}/config`))
            .then((snapshot) => {
              if (snapshot.exists()) {
                resolve(snapshot.val());
              } else {
                reject("NO_DATA_FOUND");
              }
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
      async triggerEvent(id,event){
        return new Promise((resolve, reject) => {
          set(dbRef(db, `${id}/events`), {...event, timestamp: Date.now()})
            .then(() => {
              // delete all events that are expired
              resolve("Data successfully written!");
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
      //add callback on Event
      async onEvent(id,callback){
        const dbRefInstance = dbRef(db, `${id}/events`);
        console.log("set event listener");
        onValue(dbRefInstance, (snapshot) => {
          if (snapshot.exists()) {
            const rawData = snapshot.val();
            const keys = Object.keys(rawData);
            if(snapshot.val().timestamp <= this.lastTimestamp){
              return;
            }
            else{
              this.lastTimestamp = snapshot.val().timestamp;
              callback(rawData);
            }
          } else {
            console.warn("No data available");
          }
        });
        return dbRefInstance;
      }
    }
    
  return {
    provide: {
      contentDataService: new ContentDataService()
    }
  };
});
