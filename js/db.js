export const DB = {
  prefix: 'sk_v2_',

  get(key) {
    return JSON.parse(localStorage.getItem(this.prefix + key)) || [];
  },

  set(key, value) {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  },

  init() {
    ['products','suppliers','history'].forEach(k=>{
      if(!localStorage.getItem(this.prefix+k)) this.set(k,[]);
    });
    if(!localStorage.getItem(this.prefix+'stats')) {
      this.set('stats',{ revenue:0, profit:0 });
    }
  }
};

