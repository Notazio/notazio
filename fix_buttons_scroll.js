const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// We want to replace the current #action-buttons block with the scrollable one
// and add the .preview-header cleanup.
const oldActionButtonsBlock = `  /* ACTION BUTTONS */
  #action-buttons {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 8px !important;
    margin: 16px 0 !important;
    padding: 0 !important;
    width: 100% !important;
  }
  
  #action-buttons button {
    flex: 1 1 calc(50% - 8px) !important;
    padding: 12px 8px !important;
    font-size: 0.9rem !important;
    margin: 0 !important;
  }`;

const newActionButtonsBlock = `  /* ACTION BUTTONS (SCROLLABLE ROW) */
  .preview-header {
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
    margin-bottom: 16px !important;
    position: static !important;
  }
  
  .preview-header > div:first-child {
    display: none !important; /* Hides title and badge */
  }

  #action-buttons {
    display: flex !important;
    flex-wrap: nowrap !important;
    gap: 8px !important;
    overflow-x: auto !important;
    padding: 4px !important;
    margin: 0 !important;
    scrollbar-width: none !important;
    -webkit-overflow-scrolling: touch !important;
    background: #fff !important;
    border-radius: 8px !important;
    border: 1px solid var(--border-color) !important;
    width: 100% !important;
  }
  
  #action-buttons::-webkit-scrollbar {
    display: none !important;
  }

  #action-buttons button {
    flex: 0 0 auto !important;
    width: max-content !important;
    padding: 10px 16px !important;
    font-size: 0.9rem !important;
    margin: 0 !important;
    border-radius: 6px !important;
    white-space: nowrap !important;
  }`;

if (css.includes(oldActionButtonsBlock)) {
    css = css.replace(oldActionButtonsBlock, newActionButtonsBlock);
} else {
    // Fallback if formatting is slightly different: just append it to the end of the mobile block
    // We can just append it before the final closing brace of the file
    css = css.replace(/}\s*$/, newActionButtonsBlock + '\n}\n');
}

fs.writeFileSync('styles.css', css);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/href="styles\.css\?v=[0-9]+"/, 'href="styles.css?v=' + Date.now() + '"');
fs.writeFileSync('index.html', html);

console.log('Action buttons transformed into a scrollable row!');
