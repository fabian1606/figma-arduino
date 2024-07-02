// plugins/firebase.js
import { getDatabase, ref as dbRef, onValue, set, get } from 'firebase/database';
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
    getAll() {
      const dbRefInstance = dbRef(db, 'test');
      onValue(dbRefInstance, (snapshot) => {
        if (snapshot.exists()) {
          const rawData = snapshot.val();
          console.log(rawData);
          // get image with the object key from getImage()
        } else {
          console.log("No data available");
        }
      });
      return dbRefInstance;
    }

    async setScreenDistortion(corners) {
      return new Promise((resolve, reject) => {
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
      // find id
      id = newId;
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
  }

  return {
    provide: {
      contentDataService: new ContentDataService()
    }
  };
});
