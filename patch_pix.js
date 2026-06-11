const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// 1. Add pix to state.emitter
code = code.replace(
  "emitter: { name: '', doc: '', phone: '', email: '', address: '' },",
  "emitter: { name: '', doc: '', phone: '', email: '', address: '', pix: '' },"
);

// 2. Add emitter-pix to fieldMap
code = code.replace(
  "'emitter-address': { group: 'emitter',   key: 'address' },",
  "'emitter-address': { group: 'emitter',   key: 'address' },\n        'emitter-pix':     { group: 'emitter',   key: 'pix' },"
);

// 3. Add to loadFromStorage
code = code.replace(
  "if (data.emitter_address) state.emitter.address = data.emitter_address;",
  "if (data.emitter_address) state.emitter.address = data.emitter_address;\n            if (data.emitter_pix) state.emitter.pix = data.emitter_pix;"
);

// 4. Add to saveToStorage
code = code.replace(
  "emitter_address: state.emitter.address",
  "emitter_address: state.emitter.address,\n                emitter_pix: state.emitter.pix"
);

// 5. Add pix payload function
const pixFunction = `
// ===================== PIX PAYLOAD =====================
function generatePixPayload(key, amountStr, name, city) {
    if (!key) return '';
    let amount = '';
    if (amountStr) {
        let numeric = String(amountStr).replace(/[^0-9,.]/g, '').replace(',', '.');
        let val = parseFloat(numeric);
        if (!isNaN(val) && val > 0) {
            amount = val.toFixed(2);
        }
    }
    
    function formatStr(id, value) {
        if (!value) return '';
        let strVal = String(value).substring(0, 99);
        let len = String(strVal.length).padStart(2, '0');
        return id + len + strVal;
    }
    
    name = (name || 'EMITENTE').substring(0, 25).normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toUpperCase();
    city = (city || 'CIDADE').substring(0, 15).normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toUpperCase();
    
    let pixKey = formatStr('01', key);
    let merchantAccount = formatStr('26', '0014br.gov.bcb.pix' + pixKey);
    
    let payload = formatStr('00', '01') +
                  formatStr('01', '11') +
                  merchantAccount +
                  formatStr('52', '0000') +
                  formatStr('53', '0986');
    
    if (amount) {
        payload += formatStr('54', amount);
    }
    
    payload += formatStr('58', 'BR') +
               formatStr('59', name) +
               formatStr('60', city) +
               formatStr('62', formatStr('05', '***'));
               
    payload += '6304';
    
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
        crc ^= payload.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = crc << 1;
            }
        }
    }
    let crcHex = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    return payload + crcHex;
}

`;

if (!code.includes('generatePixPayload')) {
    code = code.replace('// ===================== UPDATE PREVIEW =====================', pixFunction + '// ===================== UPDATE PREVIEW =====================');
}

// 6. Update HTML in updatePreview
const htmlInjection = `
    let pixHtml = '';
    if (state.emitter.pix && (state.document.paymentMethod === 'PIX' || state.document.paymentMethod === '')) {
        let amount = (state.docType === 'recibo' || state.docType === 'servico') ? state.document.value : '';
        if (state.docType === 'orcamento' || state.docType === 'ordem') {
            let subtotal = 0;
            state.items.forEach(item => subtotal += (item.qty||0)*(item.price||0));
            let finalVal = Math.max(subtotal - (state.discount||0), 0);
            if (finalVal > 0) amount = finalVal.toFixed(2);
        }
        const payload = generatePixPayload(state.emitter.pix, amount, state.emitter.name, state.document.city);
        pixHtml = \\\`
            <div style="margin-top: 32px; padding: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; gap: 24px;">
                <div id="pix-qrcode" data-payload="\\\${payload}" style="width:120px;height:120px;background:#fff;padding:8px;border-radius:4px;border:1px solid #cbd5e1;"></div>
                <div>
                    <h4 style="margin: 0 0 8px 0; color: var(--doc-primary); font-size: 1rem;">Pagamento via PIX</h4>
                    <p style="margin: 0 0 4px 0; font-size: 0.85rem; color: #475569;">Chave PIX: <strong>\\\${state.emitter.pix}</strong></p>
                    <p style="margin: 0; font-size: 0.75rem; color: #64748b;">Escaneie o QR Code ao lado pelo aplicativo do seu banco para pagar.</p>
                </div>
            </div>
        \\\`;
    }
`;

code = code.replace(
    /let html = `[\s\S]*?`;/,
    function(match) {
        if (match.includes('pixHtml')) return match;
        return htmlInjection + '\\n' + match.replace('<!-- Notes -->', '${pixHtml}\\n    <!-- Notes -->');
    }
);

// 7. Generate QR Code after rendering HTML
code = code.replace(
    "preview.innerHTML = html;",
    `preview.innerHTML = html;\n\n    const qrContainer = document.getElementById('pix-qrcode');\n    if (qrContainer && typeof QRCode !== 'undefined') {\n        qrContainer.innerHTML = '';\n        new QRCode(qrContainer, {\n            text: qrContainer.dataset.payload,\n            width: 104,\n            height: 104,\n            colorDark : "#0f172a",\n            colorLight : "#ffffff",\n            correctLevel : QRCode.CorrectLevel.M\n        });\n    }`
);

fs.writeFileSync('app.js', code);
console.log('patched');
