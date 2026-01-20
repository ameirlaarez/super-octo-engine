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
                            <th class="p-4">סוג רכש</th>
                            <th class="p-4">מלאי</th>
                            <th class="p-4">עלות</th>
                            <th class="p-4">מחיר מכירה</th>
                            <th class="p-4 text-center">פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.length === 0 ? '<tr><td colspan="7" class="p-10 text-center text-slate-400">אין מוצרים במלאי. הוסף מוצר כדי להתחיל.</td></tr>' :
                products.map(p => `
                            <tr class="border-t border-slate-100 hover:bg-slate-50">
                                <td class="p-4 text-slate-500 text-sm">#${p.id.toString().slice(-6)}</td>
                                <td class="p-4 font-bold">${p.name}</td>
                                <td class="p-4 text-xs font-bold ${p.purchaseType === 'consignment' ? 'text-purple-600' : 'text-slate-600'}">
                                    ${p.purchaseType === 'consignment' ? 'קומיסיון' : 'רכישה'}
                                </td>
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
                            <div class="text-xs text-slate-500 mb-1">כמות הגעה: <strong>${p.arrivalQuantity || '-'}</strong></div>
                            <div class="text-xs text-slate-500">נוכחי בענן: ${p.stock}</div>
                            <div class="text-xs ${p.purchaseType === 'consignment' ? 'text-purple-600' : 'text-slate-400'}">
                                ${p.purchaseType === 'consignment' ? 'קומיסיון (חיוב במכירה)' : 'רכישה מלאה'}
                            </div>
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
        const p = id ? products.find(x => x.id === id) : { name: '', supplierId: '', cost: 0, price: 0, stock: 0, arrivalQuantity: 0, purchaseType: 'buy' };

        UI.showModal(`
            <h2 class="text-xl font-bold mb-4 text-blue-800">עריכת מוצר במלאי</h2>
            <div class="space-y-4 text-right" dir="rtl">
                
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">שם המוצר</label>
                    <input type="text" id="p-name" value="${p.name}" placeholder="לדוגמה: חולצת טי-שירט" class="w-full p-2 border rounded">
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                     <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">ספק</label>
                        <select id="p-supplier" class="w-full p-2 border rounded font-bold text-right bg-white">
                            <option value="">בחר ספק...</option>
                            ${suppliers.map(s => `<option value="${s.id}" ${p.supplierId == s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                        </select>
                     </div>
                     <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">סוג רכש</label>
                        <select id="p-type" class="w-full p-2 border rounded font-bold text-right bg-white">
                            <option value="buy" ${p.purchaseType === 'buy' ? 'selected' : ''}>רכישה (חיוב בקניה)</option>
                            <option value="consignment" ${p.purchaseType === 'consignment' ? 'selected' : ''}>קומיסיון (חיוב במכירה)</option>
                        </select>
                     </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">עלות (₪)</label>
                        <input type="number" id="p-cost" value="${p.cost}" placeholder="0.00" class="w-full p-2 border rounded">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">מחיר מכירה (₪)</label>
                        <input type="number" id="p-price" value="${p.price}" placeholder="0.00" class="w-full p-2 border rounded">
                    </div>
                </div>

                <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-blue-800 mb-1">כמות בפועל (משפיע על חוב)</label>
                        <input type="number" id="p-stock" value="${p.stock}" class="w-full p-2 border border-blue-300 rounded font-bold text-blue-900">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-600 mb-1">כמות הגעה (לתיעוד בלבד)</label>
                        <input type="number" id="p-arrival" value="${p.arrivalQuantity || 0}" class="w-full p-2 border border-slate-300 rounded text-slate-600">
                    </div>
                </div>
                
                <div class="text-xs text-slate-500 mt-1">* עדכון "כמות בפועל" עבור מוצר 'רכישה' יעדכן את חוב הספק אוטומטית. "כמות הגעה" אינה משפיעה על החוב.</div>
                <button onclick="Products.save(${id})" class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold mt-4 shadow-lg hover:bg-blue-700 transition">שמור לענן</button>
            </div>
        `);
    },

    async save(id) {
        const products = await CloudDB.get('products');
        const suppliers = await CloudDB.get('suppliers');

        const oldProduct = id ? products.find(x => x.id === id) : null;
        const oldStock = oldProduct ? oldProduct.stock : 0;

        const data = {
            id: id || Date.now(),
            name: document.getElementById('p-name').value,
            supplierId: parseInt(document.getElementById('p-supplier').value),
            purchaseType: document.getElementById('p-type').value,
            cost: parseFloat(document.getElementById('p-cost').value || 0),
            price: parseFloat(document.getElementById('p-price').value || 0),
            stock: parseFloat(document.getElementById('p-stock').value || 0),
            arrivalQuantity: parseFloat(document.getElementById('p-arrival').value || 0)
        };

        // Debt Logic
        const supplierIdx = suppliers.findIndex(s => s.id === data.supplierId);
        if (supplierIdx !== -1) {
            const stockDiff = data.stock - oldStock;

            // 1. Buy: Add/Remove debt based on stock CHANGE (Bought more = more debt, Returned/Deleted = less debt? Maybe just positive changes)
            // Simplified: If stock increased, we assume purchase.
            if (data.purchaseType === 'buy' && stockDiff > 0) {
                suppliers[supplierIdx].balance = (suppliers[supplierIdx].balance || 0) + (stockDiff * data.cost);
            }
            // 2. Consignment: We pay only when sold. Since this is "Edit/Add", we don't register sales here usually.
            // UNLESS stock DECREASED manually, interpreting as sale/loss? 
            // Let's stick to user request: "Consignment added ONLY after sale". 
            // So if I edit stock DOWN on consignment, it implies sale -> Add Debt.
            if (data.purchaseType === 'consignment' && stockDiff < 0) {
                const soldAmount = Math.abs(stockDiff);
                suppliers[supplierIdx].balance = (suppliers[supplierIdx].balance || 0) + (soldAmount * data.cost);
            }

            await CloudDB.set('suppliers', suppliers);
        }

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
        const suppliers = await CloudDB.get('suppliers');

        const idx = products.findIndex(x => x.id === id);
        const p = products[idx];
        const oldStock = p.stock;
        const newStock = parseFloat(document.getElementById(`count-${id}`).value);

        // Debt Logic for Counting
        const stockDiff = newStock - oldStock;
        const supplierIdx = suppliers.findIndex(s => s.id === p.supplierId);

        if (supplierIdx !== -1) {
            // If Consignment and stock decreased -> SALE -> Increase Debt
            if (p.purchaseType === 'consignment' && stockDiff < 0) {
                const soldQty = Math.abs(stockDiff);
                suppliers[supplierIdx].balance = (suppliers[supplierIdx].balance || 0) + (soldQty * p.cost);
                await CloudDB.set('suppliers', suppliers);
                alert(`נרשמה מכירה של ${soldQty} יח' קומיסיון. חוב לספק עודכן.`);
            }
            // If Buy and stock increased -> FOUND STOCK? 
            // Maybe we don't assume finding stock means we owe money (could be counting error).
            // But if we stick to strict logic: Stock Up = Purchase? 
            // In "Counting", usually we just correct numbers. 
            // User request: "Product bought adds direct debt". 
            // Safe bet: For counting, only handle Consignment Sales.
            // Ignoring 'Buy' changes in counting to avoid accidental debt spikes on recount.
        }

        products[idx].stock = newStock;
        await CloudDB.set('products', products);
        if (!(p.purchaseType === 'consignment' && stockDiff < 0)) {
            alert('המלאי עודכן בהצלחה');
        }
    },

    async delete(id) {
        if (confirm('למחוק מוצר? פעולה זו לא ניתנת לביטול.')) {
            const p = await CloudDB.get('products');
            await CloudDB.set('products', p.filter(x => x.id !== id));
            alert('המוצר נמחק בהצלחה');
        }
    }
};
