const fs = require('fs');
let content = fs.readFileSync('styles.css', 'utf8');

// Replace #main-content grid definition with #view-new
content = content.replace(
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
  height: calc(100vh - 80px);
}`
);

// Fix the media queries I appended earlier
const mediaQueryFixTarget = `@media (max-width: 1024px) {
  #main-content {
    grid-template-columns: 1fr; /* Stack editor and preview vertically */`;

const mediaQueryFixReplacement = `@media (max-width: 1024px) {
  #view-new {
    grid-template-columns: 1fr; /* Stack editor and preview vertically */`;

content = content.replace(mediaQueryFixTarget, mediaQueryFixReplacement);

// Also fix the doc-type-tabs
const docTabsFixTarget = `#doc-type-nav {`;
const docTabsFixReplacement = `.doc-type-tabs {`;
content = content.replace(docTabsFixTarget, docTabsFixReplacement);

// Fix header layout
const headerFixTarget = `@media (max-width: 768px) {
  #app-header {
    flex-direction: column;
    height: auto;
    padding: 16px;
    gap: 16px;
    align-items: flex-start;
  }`;

const headerFixReplacement = `@media (max-width: 768px) {
  #app-header {
    flex-wrap: wrap;
    height: auto;
    padding: 12px 16px;
    gap: 12px;
    justify-content: space-between;
  }
  .header-brand {
    width: 100%;
    justify-content: center;
  }
  .main-nav {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  .header-user {
    width: 100%;
    justify-content: space-between;
    margin-top: 8px;
    border-top: 1px solid var(--border-color);
    padding-top: 12px;
  }`;
content = content.replace(headerFixTarget, headerFixReplacement);

fs.writeFileSync('styles.css', content);
console.log('styles.css fully patched for mobile!');
