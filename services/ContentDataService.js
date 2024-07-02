import { getDatabase, ref as dbRef, onValue, set, get } from 'firebase/database';
import { initializeApp } from 'firebase/app';

// Your web app's Firebase configuration
const config = {
  apiKey: "AIzaSyCQheLP694ykHyall-AeDrzpFQoK4qAs2Q",
  authDomain: "iks-digitaleexponate.firebaseapp.com",
  projectId: "iks-digitaleexponate",
  storageBucket: "iks-digitaleexponate.appspot.com",
  messagingSenderId: "933056814795",
  appId: "1:933056814795:web:3d1a8f23438e896838054e",
  databaseURL: "https://iks-digitaleexponate-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Initialize Firebase
const app = initializeApp(config);
const db = getDatabase();
let id = null;


class ContentDataService {
  getAll() {
    const dbRefInstance = dbRef(getDatabase(), 'test')
    onValue(dbRefInstance, (snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot;
        console.log(rawData);
        // get image with the object key f  rom getImage()
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
        reject("NO_UUID_PROVIDED")
      }
      get(dbRef(db, `${id}/ScreenDistortion`)).then((snapshot) => {
        if (snapshot.exists()) {
          resolve(snapshot.val());
        } else {
          reject("NO_DATA_FOUND");
        }
      }).catch((error) => {
        reject(error);
      });
    });

  }
}

export default new ContentDataService();