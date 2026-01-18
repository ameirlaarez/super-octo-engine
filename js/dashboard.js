import { DB } from './db.js';

export function renderDashboard(container) {
  const stats = DB.getStats();

  container.innerHTML = `
    <h1 class="text-3xl font-bold mb-6">דשבורד</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white shadow rounded-lg p-6 border-l-4 border-sky-500">
        <p class="text-gray-500">מוצרים</p>
        <p class="text-2xl font-bold text-sky-700">${stats.products}</p>
      </div>
      
      <div class="bg-white shadow rounded-lg p-6 border-l-4 border-green-500">
        <p class="text-gray-500">ספקים</p>
        <p class="text-2xl font-bold text-green-700">${stats.suppliers}</p>
      </div>

      <div class="bg-white shadow rounded-lg p-6 border-l-4 border-purple-500">
        <p class="text-gray-500">הכנסות</p>
        <p class="text-2xl font-bold text-purple-700">₪${stats.revenue}</p>
      </div>
    </div>
  `;
}
