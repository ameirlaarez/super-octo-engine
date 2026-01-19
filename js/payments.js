const Payments = {
    async render(container) {
        const suppliers = await CloudDB.get('suppliers');
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="card p-8 bg-white rounded-xl shadow-sm border border-sky-100">
                    <h3 class="text-xl font-bold mb-6 text-sky-700 border-b pb-2">רישום תשלום לספק</h3>
                    <div class="space-y-4 text-right" dir="rtl">
                        <div>
                            <label class="font-bold">בחר ספק:</label>
                            <select id="pay-id" class="w-full p-3 border rounded-lg bg-slate-50 font-bold mt-1">
                                ${suppliers.length === 0 ? '<option>אין ספקים במערכת</option>' : 
                                suppliers.map(s => `<option value="${s.id}">${s.name} (יתרה: ₪${s.balance})</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="font-bold">סכום ששולם (₪):</label>
                            <input type="number" id="pay-amt" class="w-full p-3 border rounded-lg mt-1" placeholder="0.00">
                        </div>
                        <button onclick="Payments.record()" class="w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-green-700 transition mt-4">בצע תשלום ועדכן יתרה</button>
                    </div>
                </div>
                <div class="card p-8 bg-slate-900 text-white rounded-xl shadow-inner">
                    <h3 class="text-xl font-bold mb-6 text-sky-400">סיכום יתרות חובה</h3>
                    <div class="space-y-4">
                        ${suppliers.map(s => `
                            <div class="flex justify-between items-center border-b border-slate-700 py-3">
                                <span class="text-slate-300 font-bold">${s.name}</span>
                                <span class="text-xl font-black text-red-400">₪${s.balance.toLocaleString()}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
    },

    async record() {
        const sid = parseInt(document.getElementById('pay-id').value);
        const amt = parseFloat(document.getElementById('pay-amt').value);
        
        if (!sid || isNaN(amt) || amt <= 0) return alert("נא להזין סכום תקין");

        const suppliers = await CloudDB.get('suppliers');
        const s = suppliers.find(x => x.id === sid);

        if (s) {
            s.balance -= amt;
            await CloudDB.set('suppliers', suppliers);
            alert(`התשלום על סך ₪${amt} עודכן בהצלחה.`);
        }
    }
};
