const Auth = {
    async handleAuth(type) {
        const email = document.getElementById('user-email').value;
        const pass = document.getElementById('user-pass').value;
        try {
            if (type === 'login') await firebase.auth().signInWithEmailAndPassword(email, pass);
            else await firebase.auth().createUserWithEmailAndPassword(email, pass);
        } catch (e) {
            const err = document.getElementById('auth-error');
            err.innerText = e.message;
            err.classList.remove('hidden');
        }
    },
    logout() { firebase.auth().signOut(); }
};
