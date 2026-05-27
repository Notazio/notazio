const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/href="styles\.css\?v=[0-9]+"/, 'href="styles.css?v=' + Date.now() + '"');
fs.writeFileSync('index.html', html);
console.log('Cache version bumped');
