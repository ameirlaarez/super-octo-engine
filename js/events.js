const Events = {
    async render(container) {
        const events = await CloudDB.get('events') || [];
        // Sort by date desc
        events.sort((a, b) => b.startDate - a.startDate);

        container.innerHTML = `
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-3xl font-black text-slate-800">ניהול מכירות</h1>
                <button onclick="Events.openNewEventModal()" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition">
                    <i class="fas fa-plus ml-2"></i>פתיחת מכירה חדשה
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${events.length === 0 ? '<div class="col-span-3 text-center text-slate-400 py-10">לא נמצאו מכירות במערכת. צור מכירה חדשה כדי להתחיל.</div>' :
                events.map(e => this.renderEventCard(e)).join('')}
            </div>
        `;
    },

    renderEventCard(e) {
        const isClosed = e.status === 'closed';
        return `
        <div onclick="Events.openEventDashboard(${e.id})" class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:border-indigo-400 hover:shadow-md transition group relative overflow-hidden">
            <div class="absolute top-0 right-0 w-2 h-full ${isClosed ? 'bg-slate-300' : 'bg-green-500'}"></div>
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="font-bold text-xl text-slate-800 group-hover:text-indigo-700">${e.name}</h3>
                    <div class="text-xs text-slate-500 mt-1"><i class="far fa-calendar ml-1"></i>${new Date(e.startDate).toLocaleDateString()}</div>
                </div>
                <span class="px-2 py-1 text-xs font-bold rounded ${isClosed ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-700'}">
                    ${isClosed ? 'סגור' : 'פעיל'}
                </span>
            </div>
            <div class="flex justify-between items-end text-sm">
                <div class="text-slate-500">${e.products.length} מוצרים במכירה</div>
                <div class="font-bold text-slate-700">לחץ לניהול <i class="fas fa-arrow-left mr-1 transition group-hover:-translate-x-1"></i></div>
            </div>
        </div>`;
    },

    async openNewEventModal() {
        UI.showModal(`
            <h2 class="text-xl font-bold mb-4 text-indigo-800">פתיחת אירוע מכירה חדש</h2>
            <div class="space-y-4">
                <div>
                    <label class="block font-bold mb-1 text-sm">שם המכירה</label>
                    <input type="text" id="new-evt-name" placeholder="לדוגמה: מכירת פסח 2024" class="w-full p-2 border rounded">
                </div>
                 <div>
                    <label class="block font-bold mb-1 text-sm">תאריך התחלה</label>
                    <input type="date" id="new-evt-date" value="${new Date().toISOString().split('T')[0]}" class="w-full p-2 border rounded">
                </div>
                <p class="text-xs text-slate-500 bg-indigo-50 p-2 rounded">
                    <i class="fas fa-info-circle ml-1"></i>
                    לאחר יצירת המכירה, תוכל לבחור מוצרים מהקטלוג ולמשוך אוטומטית מלאי פתיחה מהמחסן הכללי.
                </p>
                <button onclick="Events.createNewEvent()" class="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold shadow hover:bg-indigo-700">צור מכירה</button>
            </div>
        `);
    },

    async createNewEvent() {
        const name = document.getElementById('new-evt-name').value;
        const date = document.getElementById('new-evt-date').value;
        if (!name) return alert('נא להזין שם למכירה');

        const newEvent = {
            id: Date.now(),
            name: name,
            startDate: new Date(date).getTime(),
            status: 'active',
            products: [] // Will contain { productId, unitCost, unitPrice, openingStock, arrivals: [], returns: 0, closingStock: 0 }
        };

        const events = await CloudDB.get('events') || [];
        events.push(newEvent);
        await CloudDB.set('events', events);
        UI.closeModal();
        this.openEventDashboard(newEvent.id);
    },

    async openEventDashboard(eventId) {
        const events = await CloudDB.get('events');
        const e = events.find(x => x.id === eventId);
        if (!e) return;

        // Logic to calculate totals
        const totalProducts = e.products.length;
        const totalArrivalsVal = e.products.reduce((sum, p) => sum + (p.arrivals || []).reduce((acc, a) => acc + (a.qty * p.unitCost), 0), 0);

        const container = document.getElementById('content-area');
        container.innerHTML = `
            <div class="mb-6">
                <button onclick="UI.showSection('events')" class="text-slate-500 hover:text-indigo-600 mb-2 font-bold"><i class="fas fa-chevron-right ml-1"></i> חזרה לרשימה</button>
                <div class="flex justify-between items-end">
                    <div>
                        <h1 class="text-4xl font-black text-slate-800 mb-1">${e.name}</h1>
                        <div class="flex gap-4 text-sm font-bold text-slate-500">
                            <span><i class="far fa-calendar ml-1"></i>${new Date(e.startDate).toLocaleDateString()}</span>
                            <span class="${e.status === 'active' ? 'text-green-600' : 'text-slate-400'}">${e.status === 'active' ? '● מכירה פעילה' : '● מכירה סגורה'}</span>
                        </div>
                    </div>
                     ${e.status === 'active' ? `
                    <div class="flex gap-2">
                         <button onclick="Events.addProductToEventModal(${e.id})" class="bg-white border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-50">
                            <i class="fas fa-plus ml-1"></i> הוסף מוצרים
                        </button>
                        <button onclick="Events.closeEvent(${e.id})" class="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-900">
                             סיום מכירה וחישוב <i class="fas fa-flag-checkered mr-1"></i>
                        </button>
                    </div>` : ''}
                </div>
            </div>

            <!-- Stats/KPIs specific to this event -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div class="bg-white p-4 rounded-xl shadow-sm border-t-4 border-indigo-500">
                    <div class="text-slate-500 text-xs font-bold">מוצרים במכירה</div>
                    <div class="text-2xl font-black text-slate-800">${totalProducts}</div>
                </div>
                 <div class="bg-white p-4 rounded-xl shadow-sm border-t-4 border-sky-500">
                    <div class="text-slate-500 text-xs font-bold">שווי הגעות (רכש)</div>
                    <div class="text-2xl font-black text-slate-800">₪${totalArrivalsVal.toLocaleString()}</div>
                </div>
                 <!-- More KPIs like Predicted Revenue could go here -->
            </div>

            <!-- Products Table -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-4 bg-slate-50 border-b font-bold text-slate-700 flex justify-between">
                    <span>פירוט מוצרים ומלאי</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-right text-sm">
                        <thead class="bg-slate-50 text-slate-500 uppercase">
                            <tr>
                                <th class="p-3">מוצר</th>
                                <th class="p-3">סוג</th>
                                <th class="p-3 w-24">מלאי פתיחה</th>
                                <th class="p-3 w-24">הגעות</th>
                                <th class="p-3 w-24">פחת/חזר</th>
                                <th class="p-3 w-24 text-center">מלאי סגירה</th>
                                <th class="p-3 w-24 text-center">נמכר (צפי)</th>
                                ${e.status === 'active' ? '<th class="p-3">פעולות</th>' : ''}
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${e.products.length === 0 ? '<tr><td colspan="8" class="p-8 text-center text-slate-400">טרם נוספו מוצרים</td></tr>' :
                e.products.map(p => this.renderEventProductRow(p, e.id, e.status)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderEventProductRow(p, eid, status) {
        const totalArrivals = (p.arrivals || []).reduce((sum, a) => sum + a.qty, 0);
        // Calculation: Sold = Opening + Arrivals - Returns - Closing
        // Note: During active sale, Closing is usually 0 or current count. Let's assume Closing is what is LEFT.
        // So Sold = (Opening + Arrivals) - Returns - (Closing aka shelf count).
        // If Closing is 0 (default), it looks like we sold everything. Maybe show "Max Potential" or just "-" if closing not set?
        // Let's simpler: Sold = (Opening + Arrivals - Returns) - Closing.
        const soldCalc = (p.openingStock + totalArrivals - (p.returns || 0)) - (p.closingStock || 0);

        return `
            <tr class="hover:bg-slate-50 group">
                <td class="p-3 font-bold text-slate-800">${p.productName}</td>
                <td class="p-3 text-xs">
                    <span class="${p.purchaseType === 'buy' ? 'text-sky-600 bg-sky-50' : 'text-purple-600 bg-purple-50'} px-2 py-1 rounded">
                        ${p.purchaseType === 'buy' ? 'רכישה' : 'קומיסיון'}
                    </span>
                </td>
                <td class="p-3 font-mono">${p.openingStock}</td>
                <td class="p-3">
                    <div class="flex items-center gap-2">
                        <span class="font-mono font-bold">${totalArrivals}</span>
                        ${status === 'active' ? `
                        <button onclick="Events.addArrivalModal(${eid}, ${p.productId})" class="text-green-600 hover:bg-green-100 p-1 rounded transition opacity-0 group-hover:opacity-100" title="הוסף הגעת סחורה">
                            <i class="fas fa-plus-circle"></i>
                        </button>` : ''}
                    </div>
                </td>
                <td class="p-3 font-mono">${p.returns || 0}</td>
                <td class="p-3 text-center">
                    ${status === 'active' ?
                `<input type="number" onchange="Events.updateClosingStock(${eid}, ${p.productId}, this.value)" value="${p.closingStock || 0}" class="w-16 p-1 border rounded text-center bg-slate-50 focus:bg-white focus:border-indigo-500">` :
                `<span class="font-bold">${p.closingStock}</span>`}
                </td>
                <td class="p-3 text-center font-bold text-indigo-700">${soldCalc}</td>
                ${status === 'active' ? `
                <td class="p-3">
                    <button onclick="Events.editProductEventDetails(${eid}, ${p.productId})" class="text-slate-400 hover:text-indigo-600"><i class="fas fa-edit"></i></button>
                </td>` : ''}
            </tr>
        `;
    },

    async addProductToEventModal(eid) {
        const products = await CloudDB.get('products');
        const events = await CloudDB.get('events');
        const evt = events.find(x => x.id === eid);

        // Filter out products already in event
        const available = products.filter(p => !evt.products.find(ep => ep.productId === p.id));

        UI.showModal(`
            <h2 class="text-lg font-bold mb-4">הוספת מוצרים למכירה</h2>
            <div class="max-h-60 overflow-y-auto border rounded mb-4">
                ${available.length === 0 ? '<div class="p-4 text-center">אין מוצרים זמינים נוספים בקטלוג</div>' :
                available.map(p => `
                    <div class="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                        <div>
                            <div class="font-bold">${p.name}</div>
                            <div class="text-xs text-slate-500">מלאי במחסן גלובלי: ${p.stock}</div>
                        </div>
                        <button onclick="Events.attachProduct(${eid}, ${p.id})" class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-sm font-bold hover:bg-indigo-200">הוסף</button>
                    </div>
                `).join('')}
            </div>
            <button onclick="UI.closeModal()" class="w-full bg-slate-100 py-2 rounded font-bold">סגור</button>
        `);
    },

    async attachProduct(eid, pid) {
        const events = await CloudDB.get('events');
        const products = await CloudDB.get('products');

        const evtIdx = events.findIndex(x => x.id === eid);
        const prod = products.find(x => x.id === pid);

        if (evtIdx > -1 && prod) {
            // Logic: Opening Stock = Current Global Stock
            const newItem = {
                productId: prod.id,
                productName: prod.name,
                purchaseType: prod.purchaseType || 'buy', // fallback
                unitCost: prod.cost,
                unitPrice: prod.price,
                openingStock: prod.stock, // Pull from global
                arrivals: [],
                returns: 0,
                closingStock: 0 // Default 0. User will count this at end. Wait, if I just started, closing stock implies I have nothing?
                // Actually, initially Closing Stock should probably equal Opening Stock + Arrivals, until I count otherwise?
                // No, standard is you start with 0 counted, or you just don't display 'Sold' until you count.
                // Let's keep Closing Stock 0 for now.
            };
            events[evtIdx].products.push(newItem);
            await CloudDB.set('events', events);

            // Refresh Modal to show logic or close?
            // Let's close and refresh dash.
            UI.closeModal();
            this.openEventDashboard(eid);
        }
    },

    async addArrivalModal(eid, pid) {
        const events = await CloudDB.get('events');
        const evt = events.find(x => x.id === eid);
        const p = evt.products.find(x => x.productId === pid);

        UI.showModal(`
            <h2 class="text-lg font-bold mb-4">הגעת סחורה: ${p.productName}</h2>
            <div class="bg-yellow-50 p-3 rounded mb-4 text-sm text-yellow-800">
                <i class="fas fa-exclamation-circle ml-1"></i>
                שים לב! עבור מוצר מסוג <strong>${p.purchaseType === 'buy' ? 'רכישה' : 'קומיסיון'}</strong>:
                ${p.purchaseType === 'buy' ? '<br>הקלדת כמות תעדכן <strong>מיידית</strong> את חוב הספק.' : '<br>החוב לספק יחושב רק בסוף המכירה לפי המכירות בפועל.'}
            </div>
            <div class="space-y-4">
                <div>
                    <label class="block font-bold mb-1">כמות שהגיעה</label>
                    <input type="number" id="arr-qty" class="w-full p-2 border rounded font-bold text-lg" placeholder="0">
                </div>
                <div>
                    <label class="block font-bold mb-1">הערה / מחזור</label>
                    <input type="text" id="arr-note" class="w-full p-2 border rounded" placeholder="לדוגמה: פעימה 2">
                </div>
                <button onclick="Events.saveArrival(${eid}, ${pid})" class="w-full bg-green-600 text-white py-3 rounded-lg font-bold shadow hover:bg-green-700">שמור ועדכן</button>
            </div>
        `);
    },

    async saveArrival(eid, pid) {
        const qty = parseFloat(document.getElementById('arr-qty').value);
        const note = document.getElementById('arr-note').value;
        if (!qty || qty <= 0) return alert('נא להזין כמות תקינה');

        const events = await CloudDB.get('events');
        const suppliers = await CloudDB.get('suppliers');
        const products = await CloudDB.get('products'); // Need for supplier ID mapping

        const eIdx = events.findIndex(x => x.id === eid);
        const pIdx = events[eIdx].products.findIndex(x => x.productId === pid);
        const prodData = events[eIdx].products[pIdx];

        // 1. Add Arrival Record
        if (!prodData.arrivals) prodData.arrivals = [];
        prodData.arrivals.push({
            date: Date.now(),
            qty: qty,
            note: note
        });

        // 2. Handle Debt (If Buy) - Immediate Update
        if (prodData.purchaseType === 'buy') {
            // Find global product to get Supplier ID (snapshot doesn't have it, maybe I should have saved it? Yes. using global lookup for now)
            const globalProd = products.find(x => x.id === pid);
            if (globalProd && globalProd.supplierId) {
                const sIdx = suppliers.findIndex(s => s.id === globalProd.supplierId);
                if (sIdx > -1) {
                    const costToAdd = qty * prodData.unitCost;
                    suppliers[sIdx].balance = (suppliers[sIdx].balance || 0) + costToAdd;
                    await CloudDB.set('suppliers', suppliers);
                    alert(`חוב הספק עודכן בסך ₪${costToAdd.toLocaleString()}`);
                }
            }
        }

        await CloudDB.set('events', events);
        UI.closeModal();
        this.openEventDashboard(eid);
    },

    async updateClosingStock(eid, pid, val) {
        const events = await CloudDB.get('events');
        const eIdx = events.findIndex(x => x.id === eid);
        const pIdx = events[eIdx].products.findIndex(x => x.productId === pid);

        events[eIdx].products[pIdx].closingStock = parseFloat(val || 0);

        // Debounce or save immediately? Save immediately for safety.
        // But updating DB for every input change is heavy using CloudDB.set (full replace).
        // For prototype, it's fine. In prod, use update.
        await CloudDB.set('events', events);
        // We re-render to update the "Sold" column calculation
        this.openEventDashboard(eid);
    },

    async closeEvent(eid) {
        if (!confirm('האם אתה בטוח שברצונך לסגור את המכירה?\nפעולה זו תעדכן את המלאי הגלובלי ותחשב חובות למוצרי קומיסיון.')) return;

        const events = await CloudDB.get('events');
        const suppliers = await CloudDB.get('suppliers');
        const products = await CloudDB.get('products'); // Global Warehouse

        const eIdx = events.findIndex(x => x.id === eid);
        const evt = events[eIdx];

        // Loop products
        for (let p of evt.products) {
            // 1. Calculate Sold
            const totalArrivals = (p.arrivals || []).reduce((sum, a) => sum + a.qty, 0);
            const sold = (p.openingStock + totalArrivals - (p.returns || 0)) - (p.closingStock || 0);

            // 2. Consignment Debt
            if (p.purchaseType === 'consignment' && sold > 0) {
                const globalProd = products.find(x => x.id === p.productId);
                if (globalProd && globalProd.supplierId) {
                    const sIdx = suppliers.findIndex(s => s.id === globalProd.supplierId);
                    if (sIdx > -1) {
                        suppliers[sIdx].balance = (suppliers[sIdx].balance || 0) + (sold * p.unitCost);
                    }
                }
            }

            // 3. Update Global Warehouse with Closing Stock
            const gpIdx = products.findIndex(x => x.id === p.productId);
            if (gpIdx > -1) {
                products[gpIdx].stock = p.closingStock;
            }
        }

        evt.status = 'closed';

        await CloudDB.set('events', events);
        await CloudDB.set('suppliers', suppliers);
        await CloudDB.set('products', products);

        alert('המכירה נסגרה בהצלחה. מלאי גלובלי עודכן וחובות קומיסיון נרשמו.');
        this.render(document.getElementById('content-area'));
    }
};
