const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const target = `    if (amountStr) {
        let numeric = String(amountStr).replace(/[^0-9,.]/g, '').replace(',', '.');
        let val = parseFloat(numeric);`;

const replacement = `    if (amountStr) {
        let numeric = String(amountStr).replace(/R\\$\\s?/g, '').replace(/\\./g, '').replace(',', '.');
        let val = parseFloat(numeric);`;

code = code.replace(target, replacement);

fs.writeFileSync('app.js', code);
console.log("Fixed!");
