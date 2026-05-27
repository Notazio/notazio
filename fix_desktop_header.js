const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

// The missing desktop CSS blocks
const missingCss = `
/* ==========================================================
   URGENT DESKTOP HEADER FIXES
   ========================================================== */
.mobile-logo { 
  display: none !important; 
}

.desktop-logo {
  max-height: 40px !important;
  width: auto !important;
  display: block !important;
}

.header-greeting-mobile {
  display: none !important;
}

#mobile-menu-btn {
  display: none !important;
}

.main-nav {
  display: flex !important;
  align-items: center !important;
  gap: 16px !important;
  margin-left: 32px !important;
  margin-right: auto !important;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--text-muted);
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
}

.nav-btn.active {
  color: var(--accent);
  background: var(--accent-light);
  border-radius: 4px;
}

.header-user {
  display: flex !important;
  align-items: center !important;
  gap: 16px !important;
  margin-left: auto !important;
}

.mobile-only {
  display: none !important;
}

.desktop-only {
  display: inline-flex !important;
}

#main-content {
  display: block !important;
}

#view-new {
  display: grid !important;
  grid-template-columns: 460px 1fr !important;
  gap: 0 !important;
  height: calc(100vh - 80px) !important;
  overflow: hidden !important;
}
`;

// Prepend to the file right after the charset/imports
css = css.replace(/(@import url.*?;)/, "$1\n" + missingCss);

fs.writeFileSync('styles.css', css);
console.log("Desktop header fixed");
