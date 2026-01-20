const Payments = {
    async render(container) {
        const suppliers = await CloudDB.get('suppliers');

        container.innerHTML = `
            <div class="flex h-[calc(100vh-140px)] gap-6 overflow-hidden">
                <!-- Supplier List (Right Side) -->
                <div class="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div class="p-4 border-b bg-slate-50">
                        <input type="text" id="supp-search" oninput="Payments.filterList()" placeholder="חפש ספק..." class="w-full p-2 border rounded-lg">
                    </div>
                    <div id="supplier-list" class="flex-1 overflow-y-auto">
                        ${this.renderList(suppliers)}
                    </div>
                </div>

                <!-- Detail View (Left Side) -->
                <div id="payment-detail" class="w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 p-8 overflow-y-auto">
                    <div class="flex flex-col items-center justify-center h-full text-slate-400">
                        <i class="fas fa-arrow-right text-4xl mb-4"></i>
                        <p class="text-lg">בחר ספק מהרשימה כדי לראות פרטים ולבצע תשלום</p>
                    </div>
                </div>
            </div>`;
    },

    renderList(suppliers, filter = '') {
        return suppliers
            .filter(s => s.name.includes(filter))
            .map(s => `
            <div onclick="Payments.selectSupplier(${s.id})" class="p-4 border-b hover:bg-sky-50 cursor-pointer transition flex justify-between items-center group">
                <div>
                    <div class="font-bold text-slate-800 group-hover:text-sky-700">${s.name}</div>
                    <div class="text-xs text-slate-500">חוב: <span class="${s.balance > 0 ? 'text-red-500 font-bold' : 'text-green-600'}">₪${s.balance.toLocaleString()}</span></div>
                </div>
                <i class="fas fa-chevron-left text-slate-300 group-hover:text-sky-500"></i>
            </div>
        `).join('');
    },

    filterList() {
        const filter = document.getElementById('supp-search').value;
        CloudDB.get('suppliers').then(suppliers => {
            document.getElementById('supplier-list').innerHTML = this.renderList(suppliers, filter);
        });
    },

    async selectSupplier(id) {
        const suppliers = await CloudDB.get('suppliers');
        const s = suppliers.find(x => x.id === id);
        // Fetch history (assuming stored as separate collection or inside supplier array - let's use a separate collection 'payments' for better structure)
        const history = await CloudDB.getHistory(id);

        const detailContainer = document.getElementById('payment-detail');
        detailContainer.innerHTML = `
            <div class="flex justify-between items-start mb-8 border-b pb-6">
                <div>
                    <h2 class="text-3xl font-black text-slate-800 mb-2">${s.name}</h2>
                    <div class="text-sm text-slate-500">מזהה ספק: ${s.id}</div>
                </div>
                <div class="text-left">
                    <div class="text-sm text-slate-500">יתרה לתשלום</div>
                    <div class="text-4xl font-black ${s.balance > 0 ? 'text-red-600' : 'text-green-600'}">₪${s.balance.toLocaleString()}</div>
                </div>
            </div>

            <div class="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
                <h3 class="font-bold text-lg mb-4 text-slate-700"><i class="fas fa-credit-card ml-2"></i>ביצוע תשלום חדש</h3>
                <div class="flex gap-4">
                    <input type="number" id="new-pay-amount" placeholder="סכום לתשלום (₪)" class="flex-1 p-3 border rounded-lg font-bold text-lg">
                    <button onclick="Payments.makePayment(${s.id})" class="bg-sky-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-sky-700 shadow-lg transition">שלם</button>
                </div>
            </div>

            <h3 class="font-bold text-lg mb-4 text-slate-700">היסטוריית תשלומים</h3>
            <div class="overflow-hidden rounded-lg border border-slate-200">
                <table class="w-full text-right bg-white">
                    <thead class="bg-slate-50 text-slate-500 text-sm uppercase">
                        <tr>
                            <th class="p-3">תאריך</th>
                            <th class="p-3">סכום</th>
                            <th class="p-3">אסמכתא/הערה</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${history.length === 0 ? '<tr><td colspan="3" class="p-6 text-center text-slate-400">אין היסטורית תשלומים</td></tr>' :
                history.sort((a, b) => b.date - a.date).map(h => `
                            <tr class="hover:bg-slate-50">
                                <td class="p-3 font-mono text-slate-600">${new Date(h.date).toLocaleDateString()} ${new Date(h.date).toLocaleTimeString().slice(0, 5)}</td>
                                <td class="p-3 font-bold text-green-600">₪${h.amount.toLocaleString()}</td>
                                <td class="p-3 text-sm text-slate-500">${h.note || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    async makePayment(sid) {
        const amount = parseFloat(document.getElementById('new-pay-amount').value);
        if (!amount || amount <= 0) return alert('נא להזין סכום תקין');

        const note = prompt('הערה / מס׳ אסמכתא (אופציונלי):');

        // 1. Update Supplier Balance
        const suppliers = await CloudDB.get('suppliers');
        const sIdx = suppliers.findIndex(x => x.id === sid);
        suppliers[sIdx].balance -= amount;
        await CloudDB.set('suppliers', suppliers);

        // 2. Add to History
        await CloudDB.addHistory({
            supplierId: sid,
            amount: amount,
            date: Date.now(),
            note: note
        });

        alert('התשלום נקלט בהצלחה');
        this.selectSupplier(sid); // Refresh detail view
        // Optional: Refresh list debt preview without full render? For now simple re-render of list logic if needed, but selectSupplier updates the detail view. 
        // We should update the list item text too. Simplest is to reload search.
        this.filterList();
    }
};
