import { DB } from './db.js';

export function renderDashboard(container) {
  const products = DB.get('products');
  const suppliers = DB.get('suppliers');
  const stats = DB.get('stats');

  const stock = products.reduce((a,b)=>a+(b.cost*b.stock),0);
  const debt = suppliers.reduce((a,b)=>a+b.balance,0);

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">שווי מלאי<br><b>₪${stock}</b></div>
      <div class="card">חובות<br><b class="text-red-600">₪${debt}</b></div>
      <div class="card">הכנסות<br><b class="text-green-600">₪${stats.revenue}</b></div>
      <div class="card">רווח<br><b class="text-purple-600">₪${stats.profit}</b></div>
    </div>
  `;
}
