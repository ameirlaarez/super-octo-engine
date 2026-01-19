const Products = {
    async render(container) {
        const products = await CloudDB.get('products');
        container.innerHTML = `
            <div class="mb-6 flex justify-between items-center">
                <button onclick="Products.openModal()" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition">מוצר חדש +</button>
            </div>
            <div class="card overflow-hidden bg-white rounded-xl shadow-sm border border-blue-100">
                <table class="w-full text-right">
                    <thead>
                        <tr class="bg-blue-50">
                            <th class="p-4">ברקוד/מזהה</th>
                            <th class="p-4">שם מוצר</th>
                            <th class="p-4">מלאי</th>
                            <th class="p-4">עלות</th>
                            <th class="p-4">מחיר מכירה</th>
                            <th class="p-4 text-center">פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.length === 0 ? '<tr><td colspan="6" class="p-10 text-center text-slate-400">אין מוצרים במלאי. הוסף מוצר כדי להתחיל.</td></tr>' : 
                        products.map(p => `
                            <tr class="border-t border-slate-100 hover:bg-slate-50">
                                <td class="p-4 text-slate-500 text-sm">#${p.id.toString().slice(-6)}</td>
                                <td class="p-4 font-bold">${p.name}</td>
                                <td class="p-4 font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-blue-700'}">${p.stock}</td>
                                <td class="p-4 text-slate-600">₪${p.cost}</td>
                                <td class="p-4 text-green-700 font-bold">₪${p.price}</td>
                                <td class="p-4 text-center">
                                    <button onclick="Products.openModal(${p.id})" class="text-blue-600 mx-2"><i class="fas fa-edit"></i></button>
                                    <button onclick="Products.delete(${p.id})" class="text-red-400 mx-2"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    },

    async renderCounting(container) {
        const products = await CloudDB.get('products');
        container.innerHTML = `
            <div class="card p-6 mb-6 bg-yellow-50 border-r-4 border-yellow-400">
                <h3 class="font-bold text-yellow-800"><i class="fas fa-exclamation-triangle ml-2"></i>מצב ספירת מלאי</h3>
                <p class="text-sm text-yellow-700">עדכן את הכמויות שקיימות פיזית על המדף. המערכת תעדכן את הענן אוטומטית.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${products.map(p => `
                    <div class="card p-4 flex justify-between items-center bg-white shadow-sm border">
                        <div>
                            <div class="font-bold text-slate-800">${p.name}</div>
                            <div class="text-xs text-slate-500">נוכחי בענן: ${p.stock}</div>
                        </div>
                        <div class="flex items-center gap-2">
                            <input type="number" id="count-${p.id}" value="${p.stock}" class="w-20 p-1 border rounded text-center font-bold">
                            <button onclick="Products.updateStock(${p.id})" class="bg-green-600 text-white p-2 rounded hover:bg-green-700"><i class="fas fa-check"></i></button>
                        </div>
                    </div>
                `).join('')}
            </div>`;
    },

    async openModal(id = null) {
        const products = await CloudDB.get('products');
        const suppliers = await CloudDB.get('suppliers');
        const p = id ? products.find(x => x.id === id) : { name: '', supplierId: '', cost: 0, price: 0, stock: 0 };
        
        UI.showModal(`
            <h2 class="text-xl font-bold mb-4 text-blue-800">עריכת מוצר במלאי</h2>
            <div class="space-y-3 text-right" dir="rtl">
                <input type="text" id="p-name" value="${p.name}" placeholder="שם מוצר" class="w-full p-2 border rounded">
                <select id="p-supplier" class="w-full p-2 border rounded font-bold text-right">
                    <option value="">בחר ספק...</option>
                    ${suppliers.map(s => `<option value="${s.id}" ${p.supplierId == s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                </select>
                <div class="grid grid-cols-2 gap-2">
                    <input type="number" id="p-cost" value="${p.cost}" placeholder="עלות" class="p-2 border rounded">
                    <input type="number" id="p-price" value="${p.price}" placeholder="מחיר מכירה" class="p-2 border rounded">
                </div>
                <input type="number" id="p-stock" value="${p.stock}" placeholder="כמות במלאי" class="w-full p-2 border rounded">
                <button onclick="Products.save(${id})" class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold mt-4">שמור לענן</button>
            </div>
        `);
    },

    async save(id) {
        const products = await CloudDB.get('products');
        const data = {
            id: id || Date.now(),
            name: document.getElementById('p-name').value,
            supplierId: document.getElementById('p-supplier').value,
            cost: parseFloat(document.getElementById('p-cost').value || 0),
            price: parseFloat(document.getElementById('p-price').value || 0),
            stock: parseFloat(document.getElementById('p-stock').value || 0)
        };
        if (id) {
            const idx = products.findIndex(x => x.id === id);
            products[idx] = data;
        } else {
            products.push(data);
        }
        await CloudDB.set('products', products);
        UI.closeModal();
    },

    async updateStock(id) {
        const products = await CloudDB.get('products');
        const newStock = parseFloat(document.getElementById(`count-${id}`).value);
        const idx = products.findIndex(x => x.id === id);
        products[idx].stock = newStock;
        await CloudDB.set('products', products);
        alert('המלאי עודכן בהצלחה');
    },

    async delete(id) {
        if (confirm('למחוק מוצר?')) {
            const p = await CloudDB.get('products');
            await CloudDB.set('products', p.filter(x => x.id !== id));
        }
    }
};
