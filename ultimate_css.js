const fs = require('fs');

// --- 1. CLEAN UP STYLES.CSS ---
let css = fs.readFileSync('styles.css', 'utf8');

// Remove everything after the first mobile media query block or MASTER MOBILE OVERRIDES
// We will wipe the end of the file and build it perfectly.
const marker1 = '/* MASTER MOBILE OVERRIDES */';
const marker2 = '/* UNIVERSAL MOBILE RESET FOR ALIGNMENT */';

let baseCss = css;
if (css.includes(marker2)) {
    baseCss = css.split(marker2)[0];
} else if (css.includes(marker1)) {
    baseCss = css.split(marker1)[0];
}

const perfectMobileCss = `
/* ==========================================================
   PERFECT MOBILE OVERRIDES (max-width: 768px)
   ========================================================== */
@media (max-width: 768px) {
  /* GLOBAL FIXES */
  *, *::before, *::after {
    box-sizing: border-box !important;
  }
  
  html, body {
    width: 100% !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
    background-color: var(--bg-body) !important;
  }

  #app, #main-content, #view-new {
    width: 100% !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
  }

  /* HEADER */
  #app-header {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 12px 16px !important;
    height: 64px !important;
    background: #fff !important;
    border-bottom: 1px solid var(--border-color) !important;
    position: sticky !important;
    top: 0 !important;
    z-index: 1000 !important;
    width: 100% !important;
  }

  .desktop-logo { display: none !important; }
  .mobile-logo { 
    display: block !important; 
    height: 32px !important; 
    width: auto !important; 
  }

  .header-brand {
    width: auto !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    flex-shrink: 0 !important;
  }

  .header-greeting-mobile {
    display: block !important;
    flex: 1 1 auto !important;
    margin-left: 12px !important;
    margin-right: 12px !important;
    font-size: 0.9rem !important;
    font-weight: 600 !important;
    color: var(--text-main) !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    min-width: 0 !important;
  }

  .header-user { display: none !important; }

  #mobile-menu-btn {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: transparent !important;
    border: none !important;
    color: var(--text-main) !important;
    cursor: pointer !important;
    padding: 4px !important;
    margin: 0 !important;
    flex-shrink: 0 !important;
  }

  /* HAMBURGER MENU */
  .main-nav {
    display: none !important;
    position: absolute !important;
    top: 64px !important;
    left: 0 !important;
    width: 100vw !important;
    background: #ffffff !important;
    flex-direction: column !important;
    padding: 16px !important;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
    border-bottom: 1px solid var(--border-color) !important;
    z-index: 999 !important;
    margin: 0 !important;
  }
  
  .main-nav.menu-open {
    display: flex !important;
  }
  
  .nav-btn, .mobile-only {
    width: 100% !important;
    text-align: left !important;
    padding: 14px 16px !important;
    font-size: 1rem !important;
    border-radius: 8px !important;
    background: var(--bg-body) !important;
    border: none !important;
    margin-bottom: 8px !important;
  }
  
  .nav-btn.active {
    background: var(--accent-light) !important;
    color: var(--accent) !important;
  }

  #btn-logout-mobile {
    margin-top: 16px !important;
    margin-bottom: 0 !important;
    text-align: center !important;
  }

  /* VIEW NEW CONTAINER */
  #view-new {
    display: flex !important;
    flex-direction: column !important;
    height: auto !important;
    min-height: calc(100vh - 64px) !important;
  }

  /* MOBILE TABS */
  .mobile-view-tabs {
    display: flex !important;
    width: 100% !important;
    background: #fff !important;
    padding: 12px 16px !important;
    border-bottom: 1px solid var(--border-color) !important;
    gap: 8px !important;
    position: sticky !important;
    top: 64px !important;
    z-index: 99 !important;
    margin: 0 !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
  }
  
  .view-tab-btn {
    flex: 1 !important;
    padding: 10px !important;
    font-size: 0.9rem !important;
    font-weight: 600 !important;
    border-radius: 6px !important;
    background: var(--bg-body) !important;
    border: 1px solid var(--border-color) !important;
    color: var(--text-muted) !important;
    margin: 0 !important;
  }
  
  .view-tab-btn.active {
    background: var(--accent) !important;
    color: white !important;
    border-color: var(--accent) !important;
  }

  /* COLUMNS */
  #editor-column, #preview-column {
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
    border-right: none !important;
    padding: 16px !important;
    background: transparent !important;
    margin: 0 !important;
  }
  
  #editor-column.mobile-hidden, #preview-column.mobile-hidden {
    display: none !important;
  }

  /* DOC TYPE TABS */
  .doc-type-tabs {
    display: flex !important;
    width: 100% !important;
    gap: 8px !important;
    overflow-x: auto !important;
    padding: 4px !important;
    margin: 0 0 16px 0 !important;
    scrollbar-width: none !important;
    -webkit-overflow-scrolling: touch !important;
    background: #fff !important;
    border-radius: 8px !important;
    border: 1px solid var(--border-color) !important;
  }
  
  .tab-btn {
    flex: 0 0 auto !important;
    padding: 10px 16px !important;
    font-size: 0.9rem !important;
    border: none !important;
    background: transparent !important;
    border-radius: 6px !important;
    margin: 0 !important;
  }
  
  .tab-btn.active {
    background: var(--accent) !important;
    color: white !important;
  }

  /* CARDS */
  .card {
    width: 100% !important;
    padding: 16px !important;
    border-radius: 12px !important;
    margin: 0 0 16px 0 !important;
    border: 1px solid var(--border-color) !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.02) !important;
  }

  /* COLOR PICKERS */
  .color-pickers {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 12px !important;
    margin-top: 12px !important;
  }

  .color-picker-group input[type='color'] {
    height: 44px !important;
    width: 100% !important;
  }

  /* FORM INPUTS */
  .form-group input, 
  .form-group select, 
  .form-group textarea {
    font-size: 16px !important; /* Critical to prevent iOS zoom */
    padding: 12px !important;
    width: 100% !important;
    margin: 0 !important;
  }

  /* ITEMS TABLE */
  #items-table-container {
    width: 100% !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 8px !important;
  }

  #items-table {
    width: 100% !important;
    min-width: 500px !important; /* Force table to be wide inside the scroll container */
  }
  
  #items-table th, #items-table td {
    padding: 8px 12px !important;
    font-size: 0.9rem !important;
  }

  /* ACTION BUTTONS */
  .action-buttons {
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
    margin: 16px 0 32px 0 !important;
    padding: 0 !important;
    width: 100% !important;
  }
  
  .action-buttons button {
    width: 100% !important;
    padding: 14px !important;
    font-size: 1rem !important;
    margin: 0 !important;
  }

  /* PREVIEW WRAPPER */
  #preview-wrapper {
    width: 100% !important;
    overflow-x: auto !important;
    padding: 16px !important;
    margin: 0 !important;
    -webkit-overflow-scrolling: touch !important;
    background: transparent !important;
  }
  
  #document-preview {
    margin: 0 auto !important;
    transform-origin: top center !important; /* Better for mobile viewing */
  }
}
`;

fs.writeFileSync('styles.css', baseCss + '\n' + perfectMobileCss);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/href="styles\.css\?v=[0-9]+"/, 'href="styles.css?v=' + Date.now() + '"');
fs.writeFileSync('index.html', html);

console.log('Ultimate mobile reset applied!');
