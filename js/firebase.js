import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB8rBuducW6nLHE2dHgPqYeWew7OuMB4YA",
  authDomain: "small-tools-for-a-big-life.firebaseapp.com",
  projectId: "small-tools-for-a-big-life",
  storageBucket: "small-tools-for-a-big-life.firebasestorage.app",
  messagingSenderId: "168356167339",
  appId: "1:168356167339:web:ab78cd22a33913d85481ee"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
