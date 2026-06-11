const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(
`    if (typeof html2pdf === 'undefined') {
        window.print();
        return;
    }
    
        originalText = btn.innerHTML;
        btn.innerHTML = 'Gerando...';`,
`    if (typeof html2pdf === 'undefined') {
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
        btn.innerHTML = 'Gerando...';`
);

fs.writeFileSync('app.js', code);
console.log('PDF config fixed');
