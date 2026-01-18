const Products = {
    async render(container) {
        const products = await CloudDB.get('products');
        container.innerHTML = `
            <div class="mb-6"><button onclick="Products.openModal()" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md">מוצר חדש +</button></div>
            <div class="card overflow-hidden">
                <table class="w-full text-right">
                    <thead><tr><th>שם מוצר</th><th>מלאי</th><th>עלות</th><th>מכירה</th><th>פעולות</th></tr></thead>
                    <tbody>${products.map(p => `
                        <tr>
                            <td>${p.name}</td><td class="font-bold text-sky-700">${p.stock}</td>
                            <td>₪${p.cost}</td><td class="text-green-700">₪${p.price}</td>
                            <td>
                                <button onclick="Products.openModal(${p.id})" class="ml-4 text-blue-600"><i class="fas fa-edit"></i></button>
                                <button onclick="Products.delete(${p.id})" class="text-red-600"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>`).join('')}</tbody>
                </table>
            </div>`;
    },
    async openModal(id = null) {
        const products = await CloudDB.get('products');
        const suppliers = await CloudDB.get('suppliers');
        const p = id ? products.find(x => x.id === id) : { name: '', supplierId: '', cost: 0, price: 0, stock: 0 };
        UI.showModal(`
            <h2 class="text-xl font-bold mb-4">עריכת מוצר</h2>
            <input type="text" id="p-name" value="${p.name}" placeholder="שם מוצר" class="mb-2">
            <select id="p-supplier" class="mb-2">${suppliers.map(s => `<option value="${s.id}" ${p.supplierId == s.id ? 'selected' : ''}>${s.name}</option>`).join('')}</select>
            <input type="number" id="p-cost" value="${p.cost}" placeholder="עלות" class="mb-2">
            <input type="number" id="p-price" value="${p.price}" placeholder="מחיר מכירה" class="mb-2">
            <input type="number" id="p-stock" value="${p.stock}" placeholder="מלאי" class="mb-4">
            <button onclick="Products.save(${id})" class="w-full bg-blue-600 text-white py-3 rounded font-bold">שמור לענן</button>
        `);
    },
    async save(id) {
        const products = await CloudDB.get('products');
        const data = {
            id: id || Date.now(),
            name: document.getElementById('p-name').value,
            supplierId: parseInt(document.getElementById('p-supplier').value),
            cost: parseFloat(document.getElementById('p-cost').value || 0),
            price: parseFloat(document.getElementById('p-price').value || 0),
            stock: parseFloat(document.getElementById('p-stock').value || 0)
        };
        if (id) products[products.findIndex(x => x.id === id)] = data;
        else products.push(data);
        await CloudDB.set('products', products);
        UI.closeModal();
    },
    async delete(id) {
        if (confirm('למחוק מוצר מהענן?')) {
            const p = await CloudDB.get('products');
            await CloudDB.set('products', p.filter(x => x.id !== id));
        }
    }
};
