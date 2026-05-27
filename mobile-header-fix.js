const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// We will replace the entire mobile block again
const marker = '/* MASTER MOBILE OVERRIDES */';
let baseCss = css;
if (css.includes(marker)) {
    baseCss = css.split(marker)[0];
}

// Add desktop styles for new header elements
const newDesktopStyles = `
/* DESKTOP HEADER SPECIFICS */
.mobile-logo { display: none; }
.desktop-logo { height: 55px; width: auto; object-fit: contain; margin-top: 4px; }
.header-greeting-mobile { display: none; }
#mobile-menu-btn { display: none; }
.mobile-only { display: none !important; }
.main-nav { margin: 0 auto; display: flex; gap: 8px; }
.header-user { display: flex; align-items: center; }
#user-greeting { font-size: 0.9rem; font-weight: 500; margin-right: 16px; color: var(--text-main); }
#btn-logout { padding: 8px 16px; font-size: 0.8rem; }
`;

baseCss += newDesktopStyles;

const mobileCss = `
${marker}
@media (max-width: 768px) {
  /* GLOBAL LAYOUT */
  body {
    background-color: var(--bg-body);
  }
  
  /* HEADER REDESIGN WITH HAMBURGER */
  #app-header {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 12px 20px !important;
    background: #fff !important;
    height: 70px !important;
    border-bottom: 1px solid var(--border-color) !important;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05) !important;
    position: sticky !important;
    top: 0 !important;
    z-index: 1000 !important;
  }
  
  .desktop-logo { display: none !important; }
  .mobile-logo { 
    display: block !important; 
    height: 36px !important; 
    width: auto !important; 
  }
  
  .header-brand {
    width: auto !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
  }
  
  .header-greeting-mobile {
    display: block !important;
    flex: 1 !important;
    text-align: left !important;
    margin-left: 16px !important;
    font-size: 0.95rem !important;
    font-weight: 600 !important;
    color: var(--text-main) !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
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
    padding: 8px !important;
    margin-right: -8px !important;
  }
  
  /* HAMBURGER MENU DROPDOWN */
  .main-nav {
    display: none !important; /* Hidden by default */
    position: absolute !important;
    top: 70px !important;
    left: 0 !important;
    width: 100% !important;
    background: #ffffff !important;
    flex-direction: column !important;
    padding: 20px 24px !important;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
    border-bottom: 1px solid var(--border-color) !important;
    z-index: 999 !important;
  }
  
  .main-nav.menu-open {
    display: flex !important;
    animation: slideDown 0.2s ease-out forwards !important;
  }
  
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .nav-btn {
    width: 100% !important;
    text-align: left !important;
    padding: 16px 20px !important;
    font-size: 1.05rem !important;
    border-radius: 12px !important;
    background: var(--bg-body) !important;
    border: 1px solid transparent !important;
    margin-bottom: 8px !important;
    justify-content: flex-start !important;
  }
  
  .nav-btn.active {
    background: var(--accent-light) !important;
    color: var(--accent) !important;
    border: 1px solid var(--accent-light) !important;
  }
  
  .mobile-only {
    display: block !important;
    width: 100% !important;
    padding: 16px 20px !important;
    margin-top: 12px !important;
    font-size: 1.05rem !important;
    text-align: center !important;
    justify-content: center !important;
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
    padding: 20px 16px !important;
    background: var(--bg-body) !important;
  }
  
  #preview-column {
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
    padding: 24px 16px !important;
    background: #eef2f6 !important;
  }
  
  /* DOC TYPE TABS */
  .doc-type-tabs {
    display: flex !important;
    gap: 8px !important;
    overflow-x: auto !important;
    padding: 4px !important;
    margin-bottom: 24px !important;
    scrollbar-width: none !important;
    -webkit-overflow-scrolling: touch !important;
    background: #fff !important;
    border-radius: 12px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04) !important;
  }
  .doc-type-tabs::-webkit-scrollbar {
    display: none !important;
  }
  
  .tab-btn {
    flex: 0 0 auto !important;
    padding: 14px 20px !important;
    font-size: 0.95rem !important;
    border: none !important;
    background: transparent !important;
    border-radius: 8px !important;
  }
  .tab-btn.active {
    background: var(--accent) !important;
    color: white !important;
  }

  /* CARDS & INPUTS */
  .card {
    padding: 24px 20px !important;
    border-radius: 16px !important;
    box-shadow: 0 4px 16px rgba(0,0,0,0.04) !important;
    margin-bottom: 24px !important;
    border: none !important;
  }
  
  .section-title {
    font-size: 0.95rem !important;
    margin-bottom: 20px !important;
  }
  
  .form-group input, 
  .form-group select, 
  .form-group textarea {
    font-size: 1rem !important; /* Prevents iOS zoom */
    padding: 16px 14px !important;
    border-radius: 12px !important;
  }
  
  /* COLOR PICKERS */
  .color-pickers {
    grid-template-columns: 1fr 1fr !important;
    gap: 16px !important;
  }
  .color-picker-group input[type='color'] {
    height: 56px !important;
    border-radius: 14px !important;
  }

  /* ACTION BUTTONS */
  .action-buttons {
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
    margin-top: 32px !important;
    padding: 20px 0 !important;
  }
  .action-buttons button {
    width: 100% !important;
    padding: 18px !important;
    font-size: 1.1rem !important;
    border-radius: 14px !important;
    justify-content: center !important;
  }

  /* PREVIEW WRAPPER */
  #preview-wrapper {
    width: 100% !important;
    overflow-x: auto !important;
    padding: 16px !important;
    background: transparent !important;
    -webkit-overflow-scrolling: touch !important;
  }
  
  #document-preview {
    margin: 0 auto !important;
    box-shadow: 0 8px 30px rgba(0,0,0,0.1) !important;
    transform-origin: top left !important;
  }
}
`;

fs.writeFileSync('styles.css', baseCss + mobileCss);
console.log('Hamburger header and new mobile alignment injected!');
