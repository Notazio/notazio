const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// 1. Replace the original #main-content declaration
css = css.replace(
`#main-content {
  display: grid;
  grid-template-columns: 460px 1fr;
  gap: 0;
}`,
`#main-content {
  display: block;
}
#view-new {
  display: grid;
  grid-template-columns: 460px 1fr;
  gap: 0;
}`
);

// 2. Replace #main-content with #view-new inside the 1200px media query
css = css.replace(
`@media (max-width: 1200px) {
  #main-content {`,
`@media (max-width: 1200px) {
  #view-new {`
);

// 3. Fix the header for 768px in my appended block
// It's currently replacing the header correctly if the append worked, but I'll add a strong one at the end
css += `
/* MASTER MOBILE OVERRIDES */
@media (max-width: 768px) {
  #app-header {
    flex-wrap: wrap !important;
    height: auto !important;
    padding: 12px 16px !important;
    gap: 12px !important;
    justify-content: space-between !important;
  }
  .header-brand {
    width: 100% !important;
    justify-content: center !important;
  }
  .main-nav {
    width: 100% !important;
    justify-content: center !important;
    flex-wrap: wrap !important;
  }
  .header-user {
    width: 100% !important;
    justify-content: space-between !important;
    margin-top: 8px !important;
    border-top: 1px solid var(--border-color) !important;
    padding-top: 12px !important;
  }
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
  }
  #preview-column {
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
  }
  #preview-wrapper {
    overflow-x: auto !important;
    padding-bottom: 24px !important;
  }
}
`;

fs.writeFileSync('styles.css', css);
console.log('Done!');
