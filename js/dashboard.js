// DB is global in this architecture
// This also needs to go if we are not modules!
// Actually DB is likely not defined as a module either.
// Let's assume DB, CloudDB are globals.

async function renderDashboard(container) {
  // Fetch real-time data
  const products = await CloudDB.get('products');
  const suppliers = await CloudDB.get('suppliers');

  // Calculate KPIs
  const totalStockValue = products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
  const totalPotentialRevenue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const totalDebt = suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);

  container.innerHTML = `
    <h1 class="text-3xl font-black mb-8 text-slate-800">דשבורד ניהולי</h1>

    <!-- KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-sm p-6 border-r-4 border-sky-500 relative overflow-hidden">
        <div class="text-slate-500 font-bold mb-1">שווי מלאי כולל</div>
        <div class="text-3xl font-black text-slate-800">₪${totalStockValue.toLocaleString()}</div>
        <div class="text-xs text-sky-600 font-bold mt-2">פוטנציאל מכירה: ₪${totalPotentialRevenue.toLocaleString()}</div>
        <i class="fas fa-boxes absolute top-6 left-6 text-sky-100 text-6xl -z-0"></i>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm p-6 border-r-4 border-red-500 relative overflow-hidden">
        <div class="text-slate-500 font-bold mb-1">חוב פתוח לספקים</div>
        <div class="text-3xl font-black text-red-600">₪${totalDebt.toLocaleString()}</div>
        <div class="text-xs text-red-400 font-bold mt-2">${suppliers.filter(s => s.balance > 0).length} ספקים עם יתרה</div>
        <i class="fas fa-hand-holding-usd absolute top-6 left-6 text-red-50 text-6xl -z-0"></i>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-6 border-r-4 border-emerald-500 relative overflow-hidden">
        <div class="text-slate-500 font-bold mb-1">פריטים במערכת</div>
        <div class="text-3xl font-black text-emerald-600">${products.length}</div>
        <div class="text-xs text-emerald-500 font-bold mt-2">${suppliers.length} ספקים רשומים</div>
        <i class="fas fa-barcode absolute top-6 left-6 text-emerald-50 text-6xl -z-0"></i>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 class="font-bold text-lg mb-6 text-slate-700">התפלגות שווי מלאי (קניה / קומיסיון)</h3>
        <div class="h-64">
           <canvas id="chartStockType"></canvas>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 class="font-bold text-lg mb-6 text-slate-700">5 הספקים בעלי החוב הגדול ביותר</h3>
        <div class="h-64">
           <canvas id="chartDebt"></canvas>
        </div>
      </div>

    </div>
  `;

  // Render Charts
  setTimeout(() => {
    renderStockChart(products);
    renderDebtChart(suppliers);
  }, 100);
}

function renderStockChart(products) {
  const buyValue = products.filter(p => p.purchaseType === 'buy').reduce((sum, p) => sum + (p.cost * p.stock), 0);
  const consignValue = products.filter(p => p.purchaseType === 'consignment').reduce((sum, p) => sum + (p.cost * p.stock), 0);

  new Chart(document.getElementById('chartStockType'), {
    type: 'doughnut',
    data: {
      labels: ['סחורה קנויה', 'קומיסיון'],
      datasets: [{
        data: [buyValue, consignValue],
        backgroundColor: ['#0ea5e9', '#a855f7'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', rtl: true, labels: { font: { family: 'sans-serif' } } }
      }
    }
  });
}

function renderDebtChart(suppliers) {
  const topSuppliers = [...suppliers].sort((a, b) => b.balance - a.balance).slice(0, 5);

  new Chart(document.getElementById('chartDebt'), {
    type: 'bar',
    data: {
      labels: topSuppliers.map(s => s.name),
      datasets: [{
        label: 'חוב בש"ח',
        data: topSuppliers.map(s => s.balance),
        backgroundColor: '#f87171',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: { beginAtZero: true, grid: { display: false } },
        y: { grid: { display: false }, ticks: { font: { weight: 'bold' } } }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}
