export function renderDashboard(container) {
  const products = DB.get('products');
  const suppliers = DB.get('suppliers');
  const stats = DB.get('stats');

  const stockValue = products.reduce((a,b)=>a+(b.cost*b.stock),0);
  const debt = suppliers.reduce((a,b)=>a+b.balance,0);

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card p-6">
        <label>שווי מלאי</label>
        <h3 class="text-2xl font-bold">₪${stockValue.toLocaleString()}</h3>
      </div>
      <div class="card p-6">
        <label>חובות</label>
        <h3 class="text-2xl font-bold text-red-600">₪${debt.toLocaleString()}</h3>
      </div>
      <div class="card p-6">
        <label>הכנסות</label>
        <h3 class="text-2xl font-bold text-green-600">₪${stats.revenue.toLocaleString()}</h3>
      </div>
      <div class="card p-6">
        <label>רווח</label>
        <h3 class="text-2xl font-bold text-purple-600">₪${stats.profit.toLocaleString()}</h3>
      </div>
    </div>
  `;
}

