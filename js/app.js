import { AppState } from './state.js';
import { DB } from './db.js';
import './auth.js';

import { renderDashboard } from './dashboard.js';
import { renderSuppliers } from './suppliers.js';
import { renderProducts } from './products.js';
import { renderPayments } from './payments.js';
import { renderReports } from './reports.js';

DB.init();

window.showSection = function(section) {
  AppState.section = section;
  render();
};

function render() {
  const c = document.getElementById('content-area');
  document.getElementById('section-title').innerText = AppState.section;

  if(AppState.section==='dashboard') renderDashboard(c);
  if(AppState.section==='suppliers') renderSuppliers(c);
  if(AppState.section==='products') renderProducts(c);
  if(AppState.section==='payments') renderPayments(c);
  if(AppState.section==='reports') renderReports(c);
}

document.getElementById('current-date').innerText =
  new Date().toLocaleDateString('he-IL');

showSection('dashboard');
