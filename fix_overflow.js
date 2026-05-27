const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// Fix flex child truncation issue
css = css.replace(
    'text-overflow: ellipsis !important;',
    'text-overflow: ellipsis !important;\n    min-width: 0 !important;'
);

// Add global overflow protection for mobile
const globalFix = `
  /* PREVENT GLOBAL HORIZONTAL SCROLL */
  html, body {
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }
  
  #app {
    width: 100% !important;
    overflow-x: hidden !important;
  }
  
  #view-new {
    width: 100% !important;
    max-width: 100vw !important;
  }
  
  #items-table-container {
    width: 100% !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }
`;

css = css.replace('/* GLOBAL LAYOUT */', '/* GLOBAL LAYOUT */' + globalFix);

fs.writeFileSync('styles.css', css);

// Also bump index.html to v=6
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('href="styles.css?v=5"', 'href="styles.css?v=6"');
fs.writeFileSync('index.html', html);

console.log('Flex truncation and overflow fixes applied!');
