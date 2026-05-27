const fs = require('fs');

let js = fs.readFileSync('app.js', 'utf8');

const jsTabLogic = `

// ===================== MOBILE VIEW TABS (Editor/Preview) =====================
document.addEventListener('DOMContentLoaded', () => {
    const viewTabBtns = document.querySelectorAll('.view-tab-btn');
    const editorColumn = document.getElementById('editor-column');
    const previewColumn = document.getElementById('preview-column');

    // Default state for mobile: preview is hidden
    if (window.innerWidth <= 768) {
        if (previewColumn) previewColumn.classList.add('mobile-hidden');
    }

    viewTabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active from all
            viewTabBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            e.currentTarget.classList.add('active');

            const viewTarget = e.currentTarget.getAttribute('data-view');
            
            if (viewTarget === 'editor') {
                if (editorColumn) editorColumn.classList.remove('mobile-hidden');
                if (previewColumn) previewColumn.classList.add('mobile-hidden');
            } else if (viewTarget === 'preview') {
                if (previewColumn) previewColumn.classList.remove('mobile-hidden');
                if (editorColumn) editorColumn.classList.add('mobile-hidden');
            }
        });
    });
});
`;

fs.appendFileSync('app.js', jsTabLogic);
console.log('Appended tab logic to app.js');

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('href="styles.css?v=6"', 'href="styles.css?v=7"');
fs.writeFileSync('index.html', html);

