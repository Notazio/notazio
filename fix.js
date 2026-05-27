const fs = require('fs');
const file = 'app.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /        paymentHtml \+\s*serviceHtml \+\s*dateLocationHtml \+/g;

const replacement = `        paymentHtml +
        serviceHtml +
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
      margin:       15,
      filename:     filename,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 4, useCORS: true, letterRendering: true },
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
}`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log("Fixed!");
