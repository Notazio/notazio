const fs = require('fs');

let code = fs.readFileSync('app.js', 'utf8');

const targetStart = `        serviceHtml +\\n        dateLocationHtml +`;
const targetEnd = `    const toast = document.createElement('div');`;

const startIndex = code.indexOf('        serviceHtml +');
const endIndex = code.indexOf("    const toast = document.createElement('div');");

if (startIndex === -1 || endIndex === -1) {
    console.log("Could not find targets", startIndex, endIndex);
    process.exit(1);
}

const newCode = `        serviceHtml +
        dateLocationHtml +
        signatureHtml +
        notesHtml +
        footerHtml;
}

// ===================== PRINT / PDF GENERATION =====================
function printDocument() {
    const element = document.getElementById('document-preview');
    if (!element) return;
    
    // Fallback to print dialog if html2pdf is not loaded
    if (typeof html2pdf === 'undefined') {
        window.print();
        return;
    }
    
    const docNumber = state.document.number || '000';
    const docTypeNames = { 'recibo': 'Recibo', 'servico': 'Servico', 'orcamento': 'Orcamento', 'ordem': 'OS' };
    const typeName = docTypeNames[state.docType] || 'Documento';
    const filename = \`\${typeName}_\${docNumber}.pdf\`;

    const opt = {
      margin:       0,
      filename:     filename,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 4, useCORS: true, letterRendering: true, windowWidth: 800 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    const btn = document.getElementById('btn-print');
    let originalText = 'Gerar PDF';
    if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = 'Gerando...';
        btn.disabled = true;
    }

    html2pdf().set(opt).from(element).save().then(() => {
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
        showToast('PDF gerado com sucesso!', 'success');
    }).catch(err => {
        console.error(err);
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
        showToast('Erro ao gerar PDF', 'error');
        window.print(); // fallback
    });
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');`;

code = code.substring(0, startIndex) + newCode + code.substring(endIndex + "    const toast = document.createElement('div');".length);

fs.writeFileSync('app.js', code);
console.log('Fixed');
