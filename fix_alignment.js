const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const universalReset = `
  /* UNIVERSAL MOBILE RESET FOR ALIGNMENT */
  *, *::before, *::after {
    box-sizing: border-box !important;
  }
  
  html, body {
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  #app, #main-content, #view-new {
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
  }
`;

css = css.replace('/* GLOBAL LAYOUT */', '/* GLOBAL LAYOUT */\n' + universalReset);

fs.writeFileSync('styles.css', css);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('href="styles.css?v=7"', 'href="styles.css?v=8"');
fs.writeFileSync('index.html', html);

console.log('Universal mobile reset applied!');
