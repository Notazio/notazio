const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

// 1. Fix #main-content
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
  height: calc(100vh - 64px);
  overflow: hidden;
}

/* Base utility for mobile only elements to hide on desktop */
.mobile-only {
  display: none !important;
}
.desktop-only {
  display: inline-flex !important;
}`);

fs.writeFileSync('styles.css', css);
console.log('Desktop layout patched');
