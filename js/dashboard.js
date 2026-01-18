import { DB } from './db.js';

export function renderDashboard(container) {
  const stats = DB.getStats();

  container.innerHTML = `
    <h1>דשבורד</h1>

    <ul>
      <li>מוצרים: ${stats.products}</li>
      <li>ספקים: ${stats.suppliers}</li>
      <li>הכנסות: ₪${stats.revenue}</li>
    </ul>
  `;
}
