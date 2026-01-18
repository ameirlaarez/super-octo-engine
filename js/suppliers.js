import { DB } from './db.js';

export function renderSuppliers(container) {
  const suppliers = DB.get('suppliers');
  container.innerHTML = suppliers.map(s=>`
    <div class="card mb-2">${s.name} – חוב ₪${s.balance}</div>
  `).join('');
}

