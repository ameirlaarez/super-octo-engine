const PREFIX = 'stbl_';

export const DB = {
  init() {
    if (!localStorage.getItem(PREFIX + 'stats')) {
      localStorage.setItem(
        PREFIX + 'stats',
        JSON.stringify({
          products: 3,
          suppliers: 2,
          revenue: 1200
        })
      );
    }
  },

  getStats() {
    return JSON.parse(
      localStorage.getItem(PREFIX + 'stats')
    );
  }
};
