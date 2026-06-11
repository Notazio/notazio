const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// Add button binding
const bindRegex = /const btnPrint = document.getElementById\('btn-print'\);/;
code = code.replace(bindRegex, "const btnWhatsapp = document.getElementById('btn-whatsapp');\n    const btnPrint = document.getElementById('btn-print');");

const eventRegex = /if \(btnPrint\) btnPrint\.addEventListener\('click', printDocument\);/;
code = code.replace(eventRegex, "if (btnWhatsapp) btnWhatsapp.addEventListener('click', shareViaWhatsapp);\n    if (btnPrint) btnPrint.addEventListener('click', printDocument);");

// Add function
const waFunction = `
// ===================== WHATSAPP SHARE =====================
function shareViaWhatsapp() {
    let typeName = '';
    if (state.docType === 'recibo') typeName = 'Recibo de Pagamento';
    if (state.docType === 'servico') typeName = 'Recibo de Serviço';
    if (state.docType === 'orcamento') typeName = 'Orçamento';
    if (state.docType === 'ordem') typeName = 'Ordem de Serviço';

    let amount = (state.docType === 'recibo' || state.docType === 'servico') ? state.document.value : '';
    if (state.docType === 'orcamento' || state.docType === 'ordem') {
        let subtotal = 0;
        state.items.forEach(item => subtotal += (item.qty||0)*(item.price||0));
        let finalVal = Math.max(subtotal - (state.discount||0), 0);
        if (finalVal > 0) amount = formatCurrency(finalVal);
    } else {
        amount = state.document.value ? 'R$ ' + state.document.value : '';
    }

    let text = \`Olá\${state.recipient.name ? ' ' + state.recipient.name.split(' ')[0] : ''}!\\n\\nSegue o resumo do seu *\${typeName}* nº \${state.document.number}:\\n\\n\`;
    if (amount && amount !== 'R$ ') text += \`*Valor:* \${amount}\\n\`;
    text += \`*Data:* \${formatDateFull(state.document.date)}\\n\\n\`;
    
    if (state.emitter.pix && (state.document.paymentMethod === 'PIX' || !state.document.paymentMethod)) {
        text += \`Para facilitar, você pode pagar via PIX usando a chave: *\${state.emitter.pix}*\\n\\n\`;
    }
    
    text += \`Agradecemos a preferência! O PDF completo já está disponível, caso necessite.\\n\\n\`;
    if (state.emitter.name) text += \`Att, *\${state.emitter.name}*\`;

    const encodedText = encodeURIComponent(text);
    window.open(\`https://wa.me/?text=\${encodedText}\`, '_blank');
}

`;

if (!code.includes('shareViaWhatsapp')) {
    code = code.replace('// ===================== PRINT =====================', waFunction + '// ===================== PRINT =====================');
}

fs.writeFileSync('app.js', code);
console.log('whatsapp patched');
