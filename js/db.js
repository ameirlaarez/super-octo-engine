const CloudDB = {
    async get(key) {
        if (!State.currentUser) return [];
        const doc = await firebase.firestore().collection('users').doc(State.currentUser.uid).collection('data').doc(key).get();
        if (key === 'stats') return doc.exists ? doc.data() : { revenue: 0, profit: 0 };
        return doc.exists ? doc.data().items : [];
    },
    async set(key, data) {
        document.getElementById('sync-status').innerText = 'מסנכרן...';
        const payload = (key === 'stats') ? data : { items: data };
        await firebase.firestore().collection('users').doc(State.currentUser.uid).collection('data').doc(key).set(payload);
        document.getElementById('sync-status').innerText = 'מעודכן לענן';
        UI.render();
    }
};
