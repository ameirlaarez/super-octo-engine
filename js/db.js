export const DB = {
  prefix: 'sk_v2_',

  get(key) {
    return JSON.parse(localStorage.getItem(this.prefix + key)) || [];
  },

  set(key, value) {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  },

  init() {
  if (!localStorage.getItem(this.prefix + 'products')) {
    this.set('products', [
      { id: 1, name: 'מוצר בדיקה', stock: 10, cost: 20, price: 40 }
    ]);
  }

  if (!localStorage.getItem(this.prefix + 'suppliers')) {
    this.set('suppliers', [
      { id: 1, name: 'ספק בדיקה', balance: 200 }
    ]);
  }

  if (!localStorage.getItem(this.prefix + 'stats')) {
    this.set('stats', { revenue: 500, profit: 300 });
  }
}
