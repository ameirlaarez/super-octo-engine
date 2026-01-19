const Reports = {
    async render(container) {
        const products = await CloudDB.get('products');
        const suppliers = await CloudDB.get('suppliers');
        
        // חישובים
        const totalStockCost = products.reduce((a, b) => a + (b.cost * b.stock), 0);
        const totalStockValue = products.reduce((a, b) => a + (b.price * b.stock), 0);
        const totalDebt = suppliers.reduce((a, b) => a + (b.balance || 0), 0);
        const potentialProfit = totalStockValue - totalStockCost;

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="card p-6 border-r-8 border-sky-500 bg-white">
                    <div class="text-sm font-bold text-slate-500 uppercase">שווי מלאי (עלות)</div>
                    <div class="text-2xl font-black">₪${totalStockCost.toLocaleString()}</div>
                </div>
                <div class="card p-6 border-r-8 border-red-500 bg-white">
                    <div class="text-sm font-bold text-slate-500 uppercase">חובות לספקים</div>
                    <div class="text-2xl font-black text-red-600">₪${totalDebt.toLocaleString()}</div>
                </div>
                <div class="card p-6 border-r-8 border-green-500 bg-green-50">
                    <div class="text-sm font-bold text-green-800 uppercase">פוטנציאל רווח מהמלאי</div>
                    <div class="text-2xl font-black text-green-700">₪${potentialProfit.toLocaleString()}</div>
                </div>
                <div class="card p-6 border-r-8 border-purple-500 bg-purple-50">
                    <div class="text-sm font-bold text-purple-800 uppercase">כמות פריטים כוללת</div>
                    <div class="text-2xl font-black text-purple-700">${products.reduce((a,b) => a + b.stock, 0)}</div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="card p-8 bg-white shadow-sm border">
                    <h3 class="font-bold text-lg mb-4 border-b pb-2">ייצוא נתונים</h3>
                    <div class="flex flex-col gap-3">
                        <button onclick="Reports.exportCSV('products')" class="flex items-center justify-center gap-2 bg-slate-800 text-white p-3 rounded-lg font-bold hover:bg-slate-700 transition">
                            <i class="fas fa-file-excel"></i> הורד דוח מלאי (CSV)
                        </button>
                        <button onclick="Reports.exportCSV('suppliers')" class="flex items-center justify-center gap-2 bg-slate-800 text-white p-3 rounded-lg font-bold hover:bg-slate-700 transition">
                            <i class="fas fa-file-invoice-dollar"></i> הורד דוח ספקים (CSV)
                        </button>
                    </div>
                </div>
                <div class="card p-8 bg-sky-900 text-white shadow-lg">
                    <h3 class="font-bold text-lg mb-4 text-sky-300">טיפ עסקי</h3>
                    <p class="text-sky-100 italic">"ניהול מלאי הדוק מפחית הפסדים ב-15% בשנה בממוצע. הקפד על ספירת מלאי פעם בחודש."</p>
                </div>
            </div>`;
    },

    async exportCSV(type) {
        const data = await CloudDB.get(type);
        if (!data || data.length === 0) return alert("אין נתונים לייצוא");

        let csv = "\uFEFF"; // BOM לעברית
        if (type === 'products') {
            csv += "שם מוצר,כמות,עלות,מחיר מכירה\n";
            data.forEach(p => csv += `${p.name},${p.stock},${p.cost},${p.price}\n`);
        } else {
            csv += "שם ספק,סוג,יתרת חוב\n";
            data.forEach(s => csv += `${s.name},${s.type},${s.balance}\n`);
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `${type}_${new Date().toLocaleDateString()}.csv`);
        link.click();
    }
};
