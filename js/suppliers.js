const Suppliers = {
    async render(container) {
        const suppliers = await CloudDB.get('suppliers');
        container.innerHTML = `
            <div class="mb-6">
                <button onclick="Suppliers.openModal()" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md">ספק חדש +</button>
            </div>
            <div class="card overflow-hidden">
                <table class="w-full text-right">
                    <thead>
                        <tr>
                            <th>שם ספק</th>
                            <th>סוג התחשבנות</th>
                            <th>חוב נוכחי</th>
                            <th class="text-center">פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${suppliers.map(s => `
                            <tr>
                                <td class="p-4 font-bold">${s.name}</td>
                                <td class="p-4">${s.type === 'commission' ? 'קומיסיון' : 'רגיל'}</td>
                                <td class="p-4 font-bold text-lg text-red-600">₪${s.balance.toLocaleString()}</td>
                                <td class="p-4 text-center">
                                    <button onclick="Payments.viewHistory(${s.id})" class="ml-4 text-sky-600" title="היסטוריית תשלומים"><i class="fas fa-clock-rotate-left"></i></button>
                                    <button onclick="Suppliers.openModal(${s.id})" class="ml-4 text-blue-600"><i class="fas fa-edit"></i></button>
                                    <button onclick="Suppliers.delete(${s.id})" class="text-red-600"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    },

    async openModal(id = null) {
        const suppliers = await CloudDB.get('suppliers');
        const s = id ? suppliers.find(x => x.id === id) : { name: '', balance: 0, type: 'regular' };
        
        UI.showModal(`
            <h2 class="text-2xl font-bold mb-6 border-b pb-2">פרטי ספק</h2>
            <div class="space-y-4 text-right">
                <div>
                    <label>שם הספק:</label>
                    <input type="text" id="s-name" value="${s.name}" placeholder="שם הספק">
                </div>
                <div>
                    <label>סוג התחשבנות:</label>
                    <select id="s-type">
                        <option value="regular" ${s.type === 'regular' ? 'selected' : ''}>רגיל (חוב לפי קבלה)</option>
                        <option value="commission" ${s.type === 'commission' ? 'selected' : ''}>קומיסיון (חוב לפי מכירה)</option>
                    </select>
                </div>
                ${!id ? `<div><label>חוב פתיחה (₪):</label><input type="number" id="s-balance" value="0"></div>` : ''}
                <div class="flex gap-3 pt-4">
                    <button onclick="Suppliers.save(${id})" class="flex-1 bg-blue-600 text-white py-3 rounded font-bold">שמור לענן</button>
                    <button onclick="UI.closeModal()" class="flex-1 bg-gray-300 py-3 rounded font-bold">ביטול</button>
                </div>
            </div>
        `);
    },

    async save(id) {
        const suppliers = await CloudDB.get('suppliers');
        const name = document.getElementById('s-name').value;
        const type = document.getElementById('s-type').value;

        if (id) {
            const index = suppliers.findIndex(x => x.id === id);
            suppliers[index].name = name;
            suppliers[index].type = type;
        } else {
            const balance = parseFloat(document.getElementById('s-balance').value || 0);
            suppliers.push({ id: Date.now(), name, type, balance });
        }

        await CloudDB.set('suppliers', suppliers);
        UI.closeModal();
    },

    async delete(id) {
        if (confirm('האם למחוק ספק זה? פעולה זו לא תמחק את החוב שלו מהענן.')) {
            const suppliers = await CloudDB.get('suppliers');
            await CloudDB.set('suppliers', suppliers.filter(x => x.id !== id));
        }
    }
};
