const State = {
    currentUser: null,
    currentSection: 'dashboard',
    sections: {
        dashboard: { title: 'דשבורד', icon: 'fa-chart-line' },
        events: { title: 'ניהול מכירות', icon: 'fa-calendar-alt' },
        suppliers: { title: 'ספקים והתחשבנות', icon: 'fa-address-book' },
        products: { title: 'קטלוג מוצרים', icon: 'fa-boxes' },
        counting: { title: 'ספירת מלאי', icon: 'fa-list-check' },
        payments: { title: 'תשלומים', icon: 'fa-money-bill-transfer' },
        reports: { title: 'דוחות ורווח', icon: 'fa-chart-pie' }
    }
};
