const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

// The broken section starts right after "const numberInput = document.getElementById('doc-number');"
// and should end before "if (logoInput) {"
// Currently it goes directly from numberInput to "if (logoInput) {" with no code in between.
// We need to insert the missing blocks.

const oldBlock = `    const numberInput = document.getElementById('doc-number');\r\n    if (logoInput) {`;

const newBlock = `    const numberInput = document.getElementById('doc-number');

    if (dateInput) dateInput.value = state.document.date;
    if (timeInput) timeInput.value = state.document.time;
    if (numberInput) numberInput.value = state.document.number;

    // Inject toast styles
    injectToastStyles();

    // Load saved data
    await loadFromStorage();

    // Setup drag & drop
    setupDragDrop();

    // Main navigation tabs
    const views = document.querySelectorAll('.app-view');
    document.querySelectorAll('.nav-btn[data-target]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn[data-target]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const targetId = btn.dataset.target;
            views.forEach(v => {
                if (v.id === targetId) {
                    v.classList.remove('view-hidden');
                } else {
                    v.classList.add('view-hidden');
                }
            });
            
            if (targetId === 'view-clients') loadClientsList();
            if (targetId === 'view-history') loadHistoryList();
        });
    });

    // Tab buttons for doc type
    document.querySelectorAll('.tab-btn[data-type]').forEach(btn => {
        btn.addEventListener('click', () => switchDocType(btn.dataset.type));
    });

    // Logo
    const logoInput = document.getElementById('logo-input');
    const logoUploadArea = document.getElementById('logo-upload-area');
    const removeLogoBtn = document.getElementById('remove-logo-btn');

    if (logoInput) {`;

if (js.includes(oldBlock)) {
    js = js.replace(oldBlock, newBlock);
    fs.writeFileSync('app.js', js);
    console.log('SUCCESS: app.js patched correctly');
} else {
    console.log('ERROR: Could not find the target block');
    // Let's try with just \n
    const oldBlockLF = oldBlock.replace(/\r\n/g, '\n');
    if (js.includes(oldBlockLF)) {
        js = js.replace(oldBlockLF, newBlock);
        fs.writeFileSync('app.js', js);
        console.log('SUCCESS (LF): app.js patched correctly');
    } else {
        console.log('FATAL: Neither CRLF nor LF matched');
    }
}
