const Reports = {
    async render(container) {
        const products = await CloudDB.get('products');
        const suppliers = await CloudDB.get('suppliers');
        const stats = await CloudDB.get('stats');
        
        const totalStockCost = products.reduce((a, b) => a + (b.cost * b.stock), 0);
        const totalDebt = suppliers.reduce((a, b) => a + b.balance, 0);

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="card p-6 border-r-8 border-sky-500">
                    <label>שווי מלאי (עלות):</label>
                    <h3 class="text-2xl font-bold">₪${totalStockCost.toLocaleString()}</h3>
                </div>
                <div class="card p-6 border-r-8 border-red-500">
                    <label>חובות לספקים:</label>
                    <h3 class="text-2xl font-bold text-red-600">₪${totalDebt.toLocaleString()}</h3>
                </div>
                <div class="card p-6 border-r-8 border-green-500 bg-green-50">
                    <label class="text-green-800">הכנסות מצטברות:</label>
                    <h3 class="text-2xl font-bold text-green-700">₪${stats.revenue.toLocaleString()}</h3>
                </div>
                <div class="card p-6 border-r-8 border-purple-500 bg-purple-50">
                    <label class="text-purple-800">רווח נקי מצטבר:</label>
                    <h3 class="text-2xl font-bold text-purple-700">₪${stats.profit.toLocaleString()}</h3>
                </div>
            </div>
            
            <div class="card p-8">
                <h3 class="font-bold mb-4">כלים נוספים</h3>
                <div class="flex gap-4">
                    <button onclick="Reports.exportCSV('inventory')" class="bg-slate-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 transition">ייצא דוח מלאי לאקסל</button>
                    <button onclick="Reports.exportCSV('suppliers')" class="bg-slate-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 transition">ייצא דוח ספקים לאקסל</button>
                </div>
            </div>`;
    },

    async exportCSV(type) {
        let csv = "\uFEFF"; // תמיכה בעברית באקסל
        if (type === 'inventory') {
            const data = await CloudDB.get('products');
            csv += "מוצר,מלאי,עלות יח,מכירה יח,סהכ עלות\n";
            data.forEach(p => csv += `${p.name},${p.stock},${p.cost},${p.price},${p.cost * p.stock}\n`);
        } else {
            const data = await CloudDB.get('suppliers');
            csv += "ספק,סוג,חוב\n";
            data.forEach(s => csv += `${s.name},${s.type === 'commission' ? 'קומיסיון' : 'רגיל'},${s.balance}\n`);
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `${type}_report_${new Date().toLocaleDateString()}.csv`);
        link.click();
    }
};
