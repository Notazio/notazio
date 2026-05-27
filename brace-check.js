const fs = require('fs');
const content = fs.readFileSync('app.js', 'utf8');

let lines = content.split('\n');
let stack = [];

for (let i = 0; i < lines.length; i++) {
    for (let char of lines[i]) {
        if (char === '{') {
            stack.push(i + 1);
        }
        else if (char === '}') {
            stack.pop();
        }
    }
}

console.log(`Unclosed braces at lines:`, stack);
