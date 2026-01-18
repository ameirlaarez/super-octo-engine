const Payments = {
    async render(container) {
        const suppliers = await CloudDB.get('suppliers');
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="card p-8">
                    <h3 class="text-xl font-bold mb-6 border-b pb-2">ביצוע תשלום לספק</h3>
                    <div class="space-y-4">
                        <div>
                            <label>בחר ספק:</label>
                            <select id="pay-id">
                                ${suppliers.map(s => `<option value="${s.id}">${s.name} (חוב: ₪${s.balance})</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label>סכום תשלום (₪):</label>
                            <input type="number" id="pay-amt" placeholder="הזן סכום">
                        </div>
                        <div>
                            <label>הערה / אמצעי תשלום:</label>
                            <input type="text" id="pay-note" placeholder="למשל: צ'ק 102, מזומן, העברה">
                        </div>
                        <button onclick="Payments.record()" class="w-full bg-sky-600 text-white py-4 rounded-lg font-bold shadow-lg mt-4">אשר תשלום ועדכן ענן</button>
                    </div>
                </div>
                <div class="card p-8 bg-slate-50">
                    <h3 class="text-xl font-bold mb-4 italic text-slate-500">פירוט יתרות חובה:</h3>
                    ${suppliers.map(s => `
                        <div class="flex justify-between font-bold border-b py-3 text-lg">
                            <span>${s.name}</span>
                            <span class="text-red-600">₪${s.balance.toLocaleString()}</span>
                        </div>
                    `).join('')}
                </div>
            </div>`;
    },

    async record() {
        const sid = parseInt(document.getElementById('pay-id').value);
        const amt = parseFloat(document.getElementById('pay-amt').value);
        const note = document.getElementById('pay-note').value || "ללא הערה";
        
        if (!sid || isNaN(amt) || amt <= 0) return alert("נא להזין סכום תקין");

        const suppliers = await CloudDB.get('suppliers');
        const history = await CloudDB.get('history');
        const s = suppliers.find(x => x.id === sid);

        if (s) {
            s.balance -= amt;
            history.push({
                id: Date.now(),
                supplierId: sid,
                amount: amt,
                note: note,
                date: new Date().toLocaleString('he-IL')
            });

            await CloudDB.set('suppliers', suppliers);
            await CloudDB.set('history', history);
            alert(`תשלום על סך ₪${amt} עודכן בהצלחה.`);
        }
    },

    async viewHistory(supplierId) {
        const suppliers = await CloudDB.get('suppliers');
        const history = await CloudDB.get('history');
        const s = suppliers.find(x => x.id === supplierId);
        const sHistory = history.filter(h => h.supplierId === supplierId);

        UI.showModal(`
            <h2 class="text-xl font-bold mb-4 border-b pb-2">היסטוריית תשלומים: ${s.name}</h2>
            <div class="max-h-80 overflow-y-auto mb-4">
                <table class="w-full text-right text-sm">
                    <thead class="bg-sky-50">
                        <tr><th class="p-2">תאריך</th><th class="p-2">סכום</th><th class="p-2">הערה</th></tr>
                    </thead>
                    <tbody>
                        ${sHistory.reverse().map(h => `
                            <tr class="border-b">
                                <td class="p-2">${h.date}</td>
                                <td class="p-2 font-bold text-green-700">₪${h.amount.toLocaleString()}</td>
                                <td class="p-2 italic text-gray-600">${h.note}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>
            <button onclick="UI.closeModal()" class="w-full bg-slate-800 text-white py-2 rounded font-bold">סגור</button>
        `);
    }
};
