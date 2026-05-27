const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// We will replace everything after /* MASTER MOBILE OVERRIDES */
const marker = '/* MASTER MOBILE OVERRIDES */';
let baseCss = css;
if (css.includes(marker)) {
    baseCss = css.split(marker)[0];
}

const mobileCss = `
${marker}
@media (max-width: 768px) {
  /* GLOBAL LAYOUT */
  body {
    background-color: var(--bg-body);
  }
  
  /* HEADER REDESIGN */
  #app-header {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    padding: 16px 12px !important;
    gap: 16px !important;
    background: #fff !important;
    height: auto !important;
    border-bottom: 1px solid var(--border-color) !important;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05) !important;
  }
  
  .header-brand {
    width: 100% !important;
    justify-content: center !important;
    margin-bottom: 4px !important;
  }
  
  .header-brand img {
    height: 48px !important;
  }
  
  .main-nav {
    width: 100% !important;
    display: flex !important;
    gap: 8px !important;
    overflow-x: auto !important;
    padding-bottom: 4px !important;
    justify-content: flex-start !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
  }
  .main-nav::-webkit-scrollbar {
    display: none !important;
  }
  
  .nav-btn {
    flex: 0 0 auto !important;
    padding: 10px 16px !important;
    font-size: 0.9rem !important;
    border-radius: 20px !important;
    background: var(--bg-body) !important;
    border: 1px solid transparent !important;
  }
  .nav-btn.active {
    background: var(--accent-light) !important;
    color: var(--accent) !important;
    border: 1px solid var(--accent-light) !important;
  }

  .header-user {
    width: 100% !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    background: var(--bg-body) !important;
    padding: 10px 16px !important;
    border-radius: 12px !important;
    margin-top: 4px !important;
  }
  
  #user-greeting {
    font-size: 0.95rem !important;
    font-weight: 600 !important;
    margin: 0 !important;
  }
  
  #btn-logout {
    padding: 6px 16px !important;
    font-size: 0.8rem !important;
    border-radius: 16px !important;
    background: white !important;
    border: 1px solid var(--border-color) !important;
  }

  /* EDITOR & PREVIEW GRID */
  #view-new {
    grid-template-columns: 1fr !important;
    display: flex !important;
    flex-direction: column !important;
    height: auto !important;
  }
  
  #editor-column {
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
    border-right: none !important;
    padding: 16px 12px !important;
    background: var(--bg-body) !important;
  }
  
  #preview-column {
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
    padding: 24px 12px !important;
    background: #eef2f6 !important;
  }
  
  /* DOC TYPE TABS */
  .doc-type-tabs {
    display: flex !important;
    gap: 8px !important;
    overflow-x: auto !important;
    padding: 4px !important;
    margin-bottom: 20px !important;
    scrollbar-width: none !important;
    -webkit-overflow-scrolling: touch !important;
    background: #fff !important;
    border-radius: 12px !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
  }
  .doc-type-tabs::-webkit-scrollbar {
    display: none !important;
  }
  
  .tab-btn {
    flex: 0 0 auto !important;
    padding: 12px 20px !important;
    font-size: 0.95rem !important;
    border: none !important;
    background: transparent !important;
    border-radius: 8px !important;
  }
  .tab-btn.active {
    background: var(--accent) !important;
    color: white !important;
  }
  .tab-btn.active svg {
    color: white !important;
  }

  /* CARDS & INPUTS */
  .card {
    padding: 20px 16px !important;
    border-radius: 16px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03) !important;
    margin-bottom: 20px !important;
    border: none !important;
  }
  
  .section-title {
    font-size: 0.9rem !important;
    margin-bottom: 16px !important;
    border-bottom: 1px solid #f0f0f0 !important;
  }
  
  .form-group label {
    font-size: 0.9rem !important;
    margin-bottom: 6px !important;
  }
  
  .form-group input, 
  .form-group select, 
  .form-group textarea {
    font-size: 1rem !important; /* Prevents iOS zoom */
    padding: 14px 12px !important;
    border-radius: 10px !important;
    background: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
  }
  
  /* COLOR PICKERS */
  .color-pickers {
    grid-template-columns: 1fr 1fr !important;
    gap: 12px !important;
  }
  .color-picker-group input[type='color'] {
    height: 50px !important;
    border-radius: 12px !important;
    border: 2px solid #e2e8f0 !important;
    padding: 2px !important;
  }
  .color-picker-group input[type='color']::-webkit-color-swatch {
    border-radius: 8px !important;
  }

  /* ITEMS TABLE */
  #items-table th, #items-table td {
    padding: 10px 4px !important;
  }
  #items-table input {
    font-size: 0.95rem !important;
    padding: 10px 6px !important;
    border-radius: 8px !important;
  }
  .btn-remove-item {
    width: 32px !important;
    height: 32px !important;
  }
  
  /* ACTION BUTTONS */
  .action-buttons {
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
    margin-top: 24px !important;
    padding: 20px 0 !important;
  }
  .action-buttons button {
    width: 100% !important;
    padding: 16px !important;
    font-size: 1.05rem !important;
    border-radius: 12px !important;
    justify-content: center !important;
  }

  /* PREVIEW WRAPPER */
  #preview-wrapper {
    width: 100% !important;
    overflow-x: auto !important;
    padding: 16px !important;
    background: #eef2f6 !important;
    border-radius: 16px !important;
    -webkit-overflow-scrolling: touch !important;
    box-shadow: inset 0 2px 10px rgba(0,0,0,0.05) !important;
  }
  
  #document-preview {
    margin: 0 auto !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important;
    transform-origin: top left !important;
  }
}
`;

fs.writeFileSync('styles.css', baseCss + mobileCss);
console.log('Mobile perfection injected!');
