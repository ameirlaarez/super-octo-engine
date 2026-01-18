import { auth } from './firebase.js';
import { AppState } from './state.js';
import { showModal, closeModal } from './ui.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from
"https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

onAuthStateChanged(auth, user => {
  if (!user) showLogin();
  else AppState.user = user;
});

function showLogin() {
  showModal(`
    <h2 class="text-xl font-bold mb-4">התחברות</h2>
    <input id="email" class="w-full mb-2 border p-2" placeholder="אימייל">
    <input id="password" type="password" class="w-full mb-4 border p-2" placeholder="סיסמה">
    <button onclick="login()" class="w-full bg-sky-600 text-white py-2 rounded">כניסה</button>
  `);
}

window.login = async () => {
  await signInWithEmailAndPassword(auth, email.value, password.value);
  closeModal();
};

window.logout = async () => {
  await signOut(auth);
  location.reload();
};

