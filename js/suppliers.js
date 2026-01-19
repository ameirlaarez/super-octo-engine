const Suppliers = {
    async render(container) {
        const suppliers = await CloudDB.get('suppliers');
        container.innerHTML = `
            <div class="mb-6 flex justify-between items-center">
                <button onclick="Suppliers.openModal()" class="bg-sky-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-sky-700 transition">ספק חדש +</button>
                <div class="text-sm font-bold text-slate-500">סה"כ ספקים: ${suppliers.length}</div>
            </div>
            <div class="card overflow-hidden bg-white rounded-xl shadow-sm border border-sky-100">
                <table class="w-full text-right">
                    <thead>
                        <tr class="bg-sky-50">
                            <th class="p-4">שם ספק</th>
                            <th class="p-4">סוג</th>
                            <th class="p-4">חוב נוכחי</th>
                            <th class="p-4 text-center">פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${suppliers.length === 0 ? '<tr><td colspan="4" class="p-10 text-center text-slate-400">אין ספקים במערכת. לחץ על "ספק חדש" כדי להתחיל.</td></tr>' : 
                        suppliers.map(s => `
                            <tr class="border-t border-slate-100 hover:bg-slate-50">
                                <td class="p-4 font-bold">${s.name}</td>
                                <td class="p-4">${s.type === 'commission' ? 'קומיסיון' : 'רגיל'}</td>
                                <td class="p-4 font-bold text-red-600">₪${(s.balance || 0).toLocaleString()}</td>
                                <td class="p-4 text-center">
                                    <button onclick="Suppliers.openModal(${s.id})" class="text-blue-600 hover:scale-110 transition mx-2"><i class="fas fa-edit"></i></button>
                                    <button onclick="Suppliers.delete(${s.id})" class="text-red-400 hover:text-red-600 transition mx-2"><i class="fas fa-trash"></i></button>
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
            <h2 class="text-2xl font-bold mb-6 text-sky-700 border-b pb-2 text-right">פרטי ספק</h2>
            <div class="space-y-4 text-right" dir="rtl">
                <div>
                    <label class="block mb-1 font-bold">שם הספק:</label>
                    <input type="text" id="s-name" value="${s.name}" class="w-full p-2 border rounded" placeholder="הכנס שם ספק">
                </div>
                <div>
                    <label class="block mb-1 font-bold">סוג התחשבנות:</label>
                    <select id="s-type" class="w-full p-2 border rounded font-bold">
                        <option value="regular" ${s.type === 'regular' ? 'selected' : ''}>רגיל (קנייה רגילה)</option>
                        <option value="commission" ${s.type === 'commission' ? 'selected' : ''}>קומיסיון (אחוזים מהמכירה)</option>
                    </select>
                </div>
                ${!id ? `<div><label class="block mb-1 font-bold">חוב פתיחה (₪):</label><input type="number" id="s-balance" value="0" class="w-full p-2 border rounded"></div>` : ''}
                <div class="flex gap-3 pt-6">
                    <button onclick="Suppliers.save(${id})" class="flex-1 bg-sky-600 text-white py-3 rounded-lg font-bold hover:bg-sky-700 transition">שמור לענן</button>
                    <button onclick="UI.closeModal()" class="flex-1 bg-slate-200 py-3 rounded-lg font-bold hover:bg-slate-300 transition">ביטול</button>
                </div>
            </div>
        `);
    },

    async save(id) {
        const suppliers = await CloudDB.get('suppliers');
        const name = document.getElementById('s-name').value;
        const type = document.getElementById('s-type').value;

        if (!name) return alert("חובה להזין שם ספק");

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
        if (confirm('האם למחוק ספק זה?')) {
            const suppliers = await CloudDB.get('suppliers');
            await CloudDB.set('suppliers', suppliers.filter(x => x.id !== id));
        }
    }
};
