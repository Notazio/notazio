const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// Find the mobile-view-tabs section in the mobile media query
css = css.replace(
`  .mobile-view-tabs {
    display: flex !important;
    width: 100vw !important;
    background: #fff !important;
    padding: 12px 16px !important;
    border-bottom: 1px solid var(--border-color) !important;
    gap: 8px !important;
    position: sticky !important;
    top: 64px !important;
    z-index: 99 !important;
    margin: 0 !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
    box-sizing: border-box !important;
  }`,
`  .mobile-view-tabs {
    display: flex !important;
    width: 100vw !important;
    background: #fff !important;
    padding: 16px !important;
    border-bottom: 1px solid var(--border-color) !important;
    gap: 8px !important;
    position: relative !important; /* REMOVED STICKY to prevent overlap */
    z-index: 99 !important;
    margin: 0 0 24px 0 !important; /* FORCED MARGIN BOTTOM */
    box-shadow: 0 4px 6px rgba(0,0,0,0.05) !important;
    box-sizing: border-box !important;
  }`
);

fs.writeFileSync('styles.css', css);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/href="styles\.css\?v=[0-9]+"/, 'href="styles.css?v=' + Date.now() + '"');
fs.writeFileSync('index.html', html);

console.log('Fixed sticky overlap!');
