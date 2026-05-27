const fs = require('fs');

// 1. UPDATE HTML
let html = fs.readFileSync('index.html', 'utf8');

const htmlTabInjection = `
            <!-- VIEW: NEW DOCUMENT -->
            <div id="view-new" class="app-view active">
                
                <!-- MOBILE VIEW TABS (Editor vs Preview) -->
                <div class="mobile-view-tabs mobile-only" id="mobile-view-tabs">
                    <button class="view-tab-btn active" data-view="editor">Preenchimento</button>
                    <button class="view-tab-btn" data-view="preview">Preview</button>
                </div>

            <!-- LEFT: EDITOR COLUMN -->
`;

html = html.replace(
`            <!-- VIEW: NEW DOCUMENT -->
            <div id="view-new" class="app-view active">
            <!-- LEFT: EDITOR COLUMN -->`, htmlTabInjection);

// Bump version
html = html.replace('href="styles.css?v=4"', 'href="styles.css?v=5"');

fs.writeFileSync('index.html', html);


// 2. UPDATE CSS
let css = fs.readFileSync('styles.css', 'utf8');

const cssTabStyles = `
  /* TABS SYSTEM FOR EDITOR/PREVIEW */
  .mobile-view-tabs {
    display: flex !important;
    width: 100% !important;
    background: white !important;
    padding: 8px 16px !important;
    border-bottom: 1px solid var(--border-color) !important;
    gap: 12px !important;
    position: sticky !important;
    top: 70px !important; /* Height of the header */
    z-index: 99 !important;
  }
  
  .view-tab-btn {
    flex: 1 !important;
    padding: 12px !important;
    font-size: 0.95rem !important;
    font-weight: 600 !important;
    border-radius: 8px !important;
    background: var(--bg-body) !important;
    border: 1px solid var(--border-color) !important;
    color: var(--text-muted) !important;
  }
  
  .view-tab-btn.active {
    background: var(--accent) !important;
    color: white !important;
    border-color: var(--accent) !important;
  }

  /* We need to control visibility based on active tab */
  #editor-column.mobile-hidden {
    display: none !important;
  }
  
  #preview-column.mobile-hidden {
    display: none !important;
  }
`;

// Insert the CSS inside the max-width: 768px block
css = css.replace('/* EDITOR & PREVIEW GRID */', cssTabStyles + '\n\n  /* EDITOR & PREVIEW GRID */');
fs.writeFileSync('styles.css', css);


// 3. UPDATE JS
let js = fs.readFileSync('app.js', 'utf8');

const jsTabLogic = `
    // ===================== MOBILE VIEW TABS (Editor/Preview) =====================
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
                editorColumn.classList.remove('mobile-hidden');
                previewColumn.classList.add('mobile-hidden');
            } else if (viewTarget === 'preview') {
                previewColumn.classList.remove('mobile-hidden');
                editorColumn.classList.add('mobile-hidden');
            }
        });
    });
`;

// Inject JS at the end of the DOMContentLoaded block
js = js.replace('});\n// ===================== EXPORT', jsTabLogic + '\n});\n// ===================== EXPORT');

fs.writeFileSync('app.js', js);

console.log('Mobile tabs implemented successfully!');
