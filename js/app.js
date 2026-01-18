// קונפיגורציית Firebase (השתמש ב-Config שלך)
const firebaseConfig = {
    apiKey: "AIzaSyB8rBuducW6nLHE2dHgPqYeWew7OuMB4YA",
    authDomain: "small-tools-for-a-big-life.firebaseapp.com",
    projectId: "small-tools-for-a-big-life",
    storageBucket: "small-tools-for-a-big-life.firebasestorage.app",
    messagingSenderId: "168356167339",
    appId: "1:168356167339:web:ab78cd22a33913d85481ee"
};

firebase.initializeApp(firebaseConfig);

// האזנה למצב המשתמש
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        State.currentUser = user;
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        UI.render();
    } else {
        document.getElementById('login-page').classList.remove('hidden');
        document.getElementById('app-content').classList.add('hidden');
    }
});
