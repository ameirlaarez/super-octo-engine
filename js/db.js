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
        // Only re-render if we are not in a detailed flow that handles its own rendering (like Make Payment)
        // But for safety, we can leave it. However, Payments.makePayment calls selectSupplier manually.
        // Let's keep it simple.
        UI.render();
    },

    // New History Methods
    async getHistory(supplierId) {
        // We will store all payments in a 'payments' doc for simplicity
        const allPayments = await this.get('payments');
        if (!allPayments) return [];
        return allPayments.filter(p => p.supplierId === supplierId);
    },

    async addHistory(record) {
        const allPayments = await this.get('payments') || [];
        allPayments.push(record);
        // We use inner set logic but bypass the UI.render to prevent full refresh which kills the detail view state
        document.getElementById('sync-status').innerText = 'שומר היסטוריה...';
        await firebase.firestore().collection('users').doc(State.currentUser.uid).collection('data').doc('payments').set({ items: allPayments });
        document.getElementById('sync-status').innerText = 'עודכן לענן';
    }
};
