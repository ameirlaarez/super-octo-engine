import { DB } from './db.js';

export function renderProducts(container) {
  const products = DB.get('products');
  container.innerHTML = `
    <button onclick="addProduct()" class="mb-4 bg-blue-600 text-white px-4 py-2 rounded">מוצר חדש</button>
    ${products.map(p=>`<div class="card mb-2">${p.name} – מלאי: ${p.stock}</div>`).join('')}
  `;
}

window.addProduct = () => {
  const products = DB.get('products');
  products.push({ id:Date.now(), name:'מוצר חדש', stock:0, cost:0, price:0 });
  DB.set('products',products);
  showSection('products');
};

