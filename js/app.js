import { AppState } from './state.js';
import { DB } from './db.js';
import { renderDashboard } from './dashboard.js';

// אתחול האפליקציה
function init() {
  DB.init();
  AppState.section = 'dashboard';
  render();
}

// ניווט בין מסכים
function showSection(sectionName) {
  AppState.section = sectionName;
  render();
}

// רינדור ראשי
function render() {
  const app = document.getElementById('app');
  if (!app) {
    console.error('App container not found');
    return;
  }

  app.innerHTML = '';

  switch (AppState.section) {
    case 'dashboard':
      renderDashboard(app);
      break;

    default:
      app.innerHTML = `<h2>מסך לא קיים</h2>`;
  }
}

// חשיפה ל־HTML (חובה ב־ES Modules)
window.showSection = showSection;

// הפעלת האפליקציה
init();
