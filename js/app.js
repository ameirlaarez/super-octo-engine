import { AppState } from './state.js';
import { DB } from './db.js';
import { renderDashboard } from './dashboard.js';

function init() {
  DB.init();
  render();
}

function showSection(section) {
  AppState.section = section;
  render();
}

function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  if (AppState.section === 'dashboard') {
    renderDashboard(app);
  }
}

// חשיפה ל־HTML
window.showSection = showSection;

init();
