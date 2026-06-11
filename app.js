// ============================================================
// Notázio — Professional Receipt & Budget Generator
// Complete Application Logic (PT-BR)
// ============================================================

// ===================== PWA REGISTRATION =====================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      console.log('ServiceWorker registered:', reg.scope);
    }).catch(err => {
      console.log('ServiceWorker registration failed:', err);
    });
  });
}

// ===================== SUPABASE CONFIG =====================
const SUPABASE_URL = 'https://myckyedoiglkxytyjyqa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WSdJEFExwxIOkGv60FQFzg_0OMOBXe5';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentUser = null;


function getDynamicGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
}

function updateGreetingUI(firstName) {
    const greetingStr = `${getDynamicGreeting()}, ${firstName}.`;
    const greetingEl = document.getElementById('user-greeting');
    if (greetingEl) greetingEl.textContent = greetingStr;
    const mobileGreetingEl = document.getElementById('user-greeting-mobile');
    if (mobileGreetingEl) mobileGreetingEl.textContent = greetingStr;
}

// ===================== STATE =====================
const state = {
    docType: 'recibo',
    logo: null,
    colors: { primary: '#2563eb', secondary: '#0f172a' },
    emitter: { name: '', doc: '', phone: '', email: '', address: '', pix: '' },
    recipient: { name: '', doc: '', address: '' },
    document: { number: '001', date: '', time: '', city: '', value: '', valueText: '', description: '', paymentMethod: '', notes: '' },
    service: { period: '', warranty: '' },
    items: [{ desc: '', qty: 1, price: 0 }],
    discount: 0
};

// ===================== DEBOUNCE =====================
function debounce(fn, delay = 150) {
    let timer = null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// ===================== INIT =====================
async function init() {
    try {
        // Check Auth
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error || !session) {
            window.location.href = 'login.html';
            return;
        }
        currentUser = session.user;
        
        // Define initial greeting from user metadata or email
        const fallbackName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || (currentUser.email ? currentUser.email.split('@')[0] : 'Usuário');
        updateGreetingUI(fallbackName.split(' ')[0]);
    } catch (err) {
        console.error("Auth error:", err);
        window.location.href = 'login.html';
        return;
    }

    // Logout binding
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            try {
                btnLogout.textContent = 'Saindo...';
                await supabaseClient.auth.signOut();
                // Force clear localStorage just in case
                for (let key in localStorage) {
                    if (key.startsWith('sb-')) {
                        localStorage.removeItem(key);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                window.location.href = 'login.html';
            }
        });
    }

    // Default date & time
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');

    state.document.date = `${yyyy}-${mm}-${dd}`;
    state.document.time = `${hh}:${min}`;
    state.document.number = String(Date.now()).slice(-6);

    const dateInput = document.getElementById('doc-date');
    const timeInput = document.getElementById('doc-time');
    const numberInput = document.getElementById('doc-number');

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

    if (logoInput) {
        logoInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleLogoUpload(e.target.files[0]);
            }
        });
    }
    if (logoUploadArea) {
        logoUploadArea.addEventListener('click', () => {
            if (logoInput) logoInput.click();
        });
    }
    if (removeLogoBtn) {
        removeLogoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeLogo();
        });
    }

    // Color pickers
    const colorPrimary = document.getElementById('color-primary');
    const colorSecondary = document.getElementById('color-secondary');
    if (colorPrimary) {
        colorPrimary.value = state.colors.primary;
        colorPrimary.addEventListener('input', (e) => {
            state.colors.primary = e.target.value;
            updatePreview();
        });
    }
    if (colorSecondary) {
        colorSecondary.value = state.colors.secondary;
        colorSecondary.addEventListener('input', (e) => {
            state.colors.secondary = e.target.value;
            updatePreview();
        });
    }

    // Form field bindings
    const fieldMap = {
        'emitter-name':    { group: 'emitter',   key: 'name' },
        'emitter-doc':     { group: 'emitter',   key: 'doc',   mask: 'cpfcnpj' },
        'emitter-phone':   { group: 'emitter',   key: 'phone', mask: 'phone' },
        'emitter-email':   { group: 'emitter',   key: 'email' },
        'emitter-address': { group: 'emitter',   key: 'address' },
        'emitter-pix':     { group: 'emitter',   key: 'pix' },
        'recipient-name':  { group: 'recipient', key: 'name' },
        'recipient-doc':   { group: 'recipient', key: 'doc',   mask: 'cpfcnpj' },
        'recipient-address': { group: 'recipient', key: 'address' },
        'doc-number':      { group: 'document',  key: 'number' },
        'doc-date':        { group: 'document',  key: 'date' },
        'doc-time':        { group: 'document',  key: 'time' },
        'doc-city':        { group: 'document',  key: 'city' },
        'doc-description': { group: 'document',  key: 'description' },
        'payment-method':  { group: 'document',  key: 'paymentMethod' },
        'doc-notes':       { group: 'document',  key: 'notes' },
        'service-period':  { group: 'service',   key: 'period' },
        'service-warranty': { group: 'service',  key: 'warranty' }
    };

    const debouncedPreview = debounce(updatePreview, 150);

    Object.keys(fieldMap).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const mapping = fieldMap[id];

        const eventType = (el.tagName === 'SELECT') ? 'change' : 'input';
        el.addEventListener(eventType, (e) => {
            let val = e.target.value;
            if (mapping.mask === 'cpfcnpj') {
                val = maskCPFCNPJ(val);
                e.target.value = val;
            } else if (mapping.mask === 'phone') {
                val = maskPhone(val);
                e.target.value = val;
            }
            state[mapping.group][mapping.key] = val;
            debouncedPreview();
        });
    });

    // Value field with currency mask
    const docValue = document.getElementById('doc-value');
    const docValueText = document.getElementById('doc-value-text');
    if (docValue) {
        docValue.addEventListener('input', (e) => {
            const masked = maskCurrency(e.target.value);
            e.target.value = masked;
            state.document.value = masked;
            const num = parseCurrency(masked);
            const words = valueInWords(num);
            state.document.valueText = words;
            if (docValueText) docValueText.value = words;
            debouncedPreview();
        });
    }

    // Discount
    const discountInput = document.getElementById('items-discount');
    if (discountInput) {
        discountInput.addEventListener('input', (e) => {
            const masked = maskCurrency(e.target.value);
            e.target.value = masked;
            state.discount = parseCurrency(masked);
            calculateTotals();
        });
    }

    // Add item
    const addItemBtn = document.getElementById('add-item-btn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', addItem);
    }

    // Action buttons
    const btnWhatsapp = document.getElementById('btn-whatsapp');
    const btnPrint = document.getElementById('btn-print');
    const btnSave = document.getElementById('btn-save');
    const btnClear = document.getElementById('btn-clear');
    const btnRegisterDoc = document.getElementById('btn-register-doc');

    if (btnWhatsapp) btnWhatsapp.addEventListener('click', shareViaWhatsapp);
    if (btnPrint) btnPrint.addEventListener('click', printDocument);
    if (btnSave) btnSave.addEventListener('click', saveToStorage);
    if (btnClear) btnClear.addEventListener('click', clearAll);
    if (btnRegisterDoc) btnRegisterDoc.addEventListener('click', registerDocument);

    // Initial render
    switchDocType(state.docType);
    renderItemsTable();
    updatePreview();
}

// ===================== TOAST STYLES =====================
function injectToastStyles() {
    if (document.getElementById('toast-dynamic-styles')) return;
    const style = document.createElement('style');
    style.id = 'toast-dynamic-styles';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translateX(0); }
            to   { opacity: 0; transform: translateX(60px); }
        }
        #toast-container {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 8px;
            pointer-events: none;
        }
        #toast-container .toast {
            position: relative;
            padding: 14px 20px;
            border-radius: 10px;
            color: #fff;
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            margin-top: 8px;
            animation: slideInRight 0.3s ease;
            backdrop-filter: blur(8px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.25);
            pointer-events: auto;
            max-width: 340px;
        }
        #toast-container .toast-success { background: rgba(34,197,94,0.92); }
        #toast-container .toast-error   { background: rgba(239,68,68,0.92); }
        #toast-container .toast-info    { background: rgba(99,102,241,0.92); }
        #toast-container .toast-fadeout {
            animation: fadeOut 0.35s ease forwards;
        }
    `;
    document.head.appendChild(style);
}

// ===================== SWITCH DOC TYPE =====================
function switchDocType(type) {
    state.docType = type;

    document.querySelectorAll('.tab-btn[data-type]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });

    const sectionService = document.getElementById('section-service');
    const sectionItems = document.getElementById('section-items');
    const valueFields = document.getElementById('value-fields');

    if (sectionService) {
        sectionService.style.display = (type === 'servico' || type === 'ordem') ? 'block' : 'none';
    }
    if (sectionItems) {
        sectionItems.style.display = (type === 'orcamento' || type === 'ordem') ? 'block' : 'none';
    }
    if (valueFields) {
        valueFields.style.display = (type === 'recibo' || type === 'servico') ? 'block' : 'none';
    }

    updatePreview();
}

// ===================== LOGO UPLOAD =====================
function handleLogoUpload(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('Por favor, envie apenas arquivos de imagem.', 'error');
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        showToast('A imagem deve ter no máximo 2MB.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        state.logo = e.target.result;

        const previewImg = document.getElementById('logo-preview-img');
        const uploadContent = document.getElementById('logo-upload-content');
        const removeBtn = document.getElementById('remove-logo-btn');

        if (previewImg) {
            previewImg.src = state.logo;
            previewImg.style.display = 'block';
        }
        if (uploadContent) uploadContent.style.display = 'none';
        if (removeBtn) removeBtn.style.display = 'flex';

        showToast('Logo carregado com sucesso!', 'success');
        updatePreview();
    };
    reader.onerror = () => {
        showToast('Erro ao carregar a imagem.', 'error');
    };
    reader.readAsDataURL(file);
}

function removeLogo() {
    state.logo = null;

    const previewImg = document.getElementById('logo-preview-img');
    const uploadContent = document.getElementById('logo-upload-content');
    const removeBtn = document.getElementById('remove-logo-btn');
    const logoInput = document.getElementById('logo-input');

    if (previewImg) {
        previewImg.src = '';
        previewImg.style.display = 'none';
    }
    if (uploadContent) uploadContent.style.display = '';
    if (removeBtn) removeBtn.style.display = 'none';
    if (logoInput) logoInput.value = '';

    showToast('Logo removido.', 'info');
    updatePreview();
}

// ===================== DRAG & DROP =====================
function setupDragDrop() {
    const area = document.getElementById('logo-upload-area');
    if (!area) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
        area.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    area.addEventListener('dragenter', () => area.classList.add('dragover'));
    area.addEventListener('dragover', () => area.classList.add('dragover'));
    area.addEventListener('dragleave', () => area.classList.remove('dragover'));
    area.addEventListener('drop', (e) => {
        area.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleLogoUpload(files[0]);
        }
    });
}

// ===================== FORMAT CURRENCY =====================
function formatCurrency(value) {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'R$ 0,00';
    return 'R$ ' + num.toFixed(2)
        .replace('.', ',')
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ===================== PARSE CURRENCY =====================
function parseCurrency(str) {
    if (!str) return 0;
    let cleaned = String(str).replace(/R\$\s?/g, '').trim();
    // Remove thousand separators (dots), replace decimal comma with dot
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

// ===================== VALUE IN WORDS (PT-BR) =====================
function valueInWords(number) {
    if (typeof number !== 'number' || isNaN(number)) return 'zero reais';
    if (number < 0) number = Math.abs(number);
    if (number === 0) return 'zero reais';

    const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

    function groupToWords(n) {
        // n is 0..999
        if (n === 0) return '';
        if (n === 100) return 'cem';

        const parts = [];
        const h = Math.floor(n / 100);
        const remainder = n % 100;
        const t = Math.floor(remainder / 10);
        const u = remainder % 10;

        if (h > 0) {
            parts.push(hundreds[h]);
        }

        if (remainder >= 10 && remainder <= 19) {
            parts.push(teens[remainder - 10]);
        } else {
            if (t >= 2) {
                parts.push(tens[t]);
            }
            if (u > 0) {
                parts.push(units[u]);
            }
        }

        return parts.join(' e ');
    }

    // Split integer and decimal
    const rounded = Math.round(number * 100) / 100;
    const intPart = Math.floor(rounded);
    const centavos = Math.round((rounded - intPart) * 100);

    let intWords = '';

    if (intPart === 0) {
        intWords = '';
    } else {
        const millions = Math.floor(intPart / 1000000);
        const thousands = Math.floor((intPart % 1000000) / 1000);
        const remainder = intPart % 1000;

        const groups = [];

        if (millions > 0) {
            const mw = groupToWords(millions);
            if (millions === 1) {
                groups.push('um milhão');
            } else {
                groups.push(mw + ' milhões');
            }
        }

        if (thousands > 0) {
            if (thousands === 1) {
                groups.push('mil');
            } else {
                groups.push(groupToWords(thousands) + ' mil');
            }
        }

        if (remainder > 0) {
            groups.push(groupToWords(remainder));
        }

        // Join groups with ' e ' or ', '
        if (groups.length === 1) {
            intWords = groups[0];
        } else if (groups.length === 2) {
            // Use 'e' if the last group is < 100, or the last group complements (like mil e duzentos)
            const lastGroup = groups[groups.length - 1];
            // Use 'e' when last group is small or when joining naturally
            if (remainder > 0 && remainder < 100) {
                intWords = groups.join(' e ');
            } else {
                intWords = groups.join(' e ');
            }
        } else if (groups.length === 3) {
            // millions, thousands, remainder
            // e.g. "um milhão, duzentos e trinta mil e quinhentos"
            if (remainder > 0 && remainder < 100) {
                intWords = groups[0] + ', ' + groups[1] + ' e ' + groups[2];
            } else {
                intWords = groups[0] + ', ' + groups[1] + ' e ' + groups[2];
            }
        }
    }

    // Build final string
    const result = [];

    if (intPart > 0) {
        // "de reais" is used after milhão/milhões when there are no thousands/hundreds
        const needsDe = intPart >= 1000000 && (intPart % 1000000 === 0);
        if (intPart === 1) {
            result.push(intWords + ' real');
        } else if (needsDe) {
            result.push(intWords + ' de reais');
        } else {
            result.push(intWords + ' reais');
        }
    }

    if (centavos > 0) {
        const centWords = groupToWords(centavos);
        if (centavos === 1) {
            result.push(centWords + ' centavo');
        } else {
            result.push(centWords + ' centavos');
        }
    }

    if (result.length === 0) return 'zero reais';

    return result.join(' e ');
}

// ===================== MASKS =====================
function maskCPFCNPJ(value) {
    let digits = value.replace(/\D/g, '');
    if (digits.length > 14) digits = digits.slice(0, 14);

    if (digits.length <= 11) {
        // CPF: 000.000.000-00
        return digits
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        // CNPJ: 00.000.000/0001-00
        return digits
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
}

function maskPhone(value) {
    let digits = value.replace(/\D/g, '');
    if (digits.length > 11) digits = digits.slice(0, 11);

    if (digits.length <= 10) {
        // (00) 0000-0000
        return digits
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    } else {
        // (00) 00000-0000
        return digits
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    }
}

function maskCurrency(value) {
    let digits = String(value).replace(/\D/g, '');
    if (digits === '') return '';

    // Remove leading zeros but keep at least one
    digits = digits.replace(/^0+/, '') || '0';

    // Pad to at least 3 digits for cents
    while (digits.length < 3) {
        digits = '0' + digits;
    }

    const intPart = digits.slice(0, digits.length - 2);
    const decPart = digits.slice(digits.length - 2);

    // Add thousand separators
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return intFormatted + ',' + decPart;
}

// ===================== ITEMS TABLE =====================
function addItem() {
    state.items.push({ desc: '', qty: 1, price: 0 });
    renderItemsTable();
    showToast('Item adicionado.', 'info');
}

function removeItem(index) {
    if (state.items.length <= 1) {
        showToast('É necessário ter pelo menos um item.', 'error');
        return;
    }
    state.items.splice(index, 1);
    renderItemsTable();
    calculateTotals();
    showToast('Item removido.', 'info');
}

function renderItemsTable() {
    const tbody = document.getElementById('items-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    state.items.forEach((item, i) => {
        const tr = document.createElement('tr');

        // Row number
        const tdNum = document.createElement('td');
        tdNum.textContent = i + 1;
        tdNum.style.textAlign = 'center';
        tdNum.style.fontWeight = '600';
        tdNum.style.color = 'var(--text-muted, #94a3b8)';
        tr.appendChild(tdNum);

        // Description
        const tdDesc = document.createElement('td');
        const inputDesc = document.createElement('input');
        inputDesc.type = 'text';
        inputDesc.className = 'item-input';
        inputDesc.dataset.index = i;
        inputDesc.dataset.field = 'desc';
        inputDesc.placeholder = 'Descrição do item';
        inputDesc.value = item.desc;
        inputDesc.addEventListener('input', (e) => {
            state.items[i].desc = e.target.value;
            debounce(updatePreview, 150)();
        });
        tdDesc.appendChild(inputDesc);
        tr.appendChild(tdDesc);

        // Quantity
        const tdQty = document.createElement('td');
        const inputQty = document.createElement('input');
        inputQty.type = 'number';
        inputQty.className = 'item-input qty';
        inputQty.dataset.index = i;
        inputQty.dataset.field = 'qty';
        inputQty.min = '1';
        inputQty.value = item.qty;
        inputQty.addEventListener('input', (e) => {
            const val = parseInt(e.target.value) || 1;
            state.items[i].qty = val;
            calculateTotals();
        });
        tdQty.appendChild(inputQty);
        tr.appendChild(tdQty);

        // Price
        const tdPrice = document.createElement('td');
        const inputPrice = document.createElement('input');
        inputPrice.type = 'text';
        inputPrice.className = 'item-input price';
        inputPrice.dataset.index = i;
        inputPrice.dataset.field = 'price';
        inputPrice.placeholder = '0,00';
        inputPrice.value = item.price > 0 ? maskCurrency(String(Math.round(item.price * 100))) : '';
        inputPrice.addEventListener('input', (e) => {
            const masked = maskCurrency(e.target.value);
            e.target.value = masked;
            state.items[i].price = parseCurrency(masked);
            calculateTotals();
        });
        tdPrice.appendChild(inputPrice);
        tr.appendChild(tdPrice);

        // Item total
        const tdTotal = document.createElement('td');
        const spanTotal = document.createElement('span');
        spanTotal.className = 'item-total';
        spanTotal.textContent = formatCurrency(item.qty * item.price);
        tdTotal.appendChild(spanTotal);
        tr.appendChild(tdTotal);

        // Remove button
        const tdAction = document.createElement('td');
        if (state.items.length > 1) {
            const btnRemove = document.createElement('button');
            btnRemove.className = 'btn-remove-item';
            btnRemove.dataset.index = i;
            btnRemove.textContent = '✕';
            btnRemove.title = 'Remover item';
            btnRemove.addEventListener('click', () => removeItem(i));
            tdAction.appendChild(btnRemove);
        }
        tr.appendChild(tdAction);

        tbody.appendChild(tr);
    });

    calculateTotals();
}

function calculateTotals() {
    let subtotal = 0;
    state.items.forEach(item => {
        subtotal += (item.qty || 0) * (item.price || 0);
    });

    const discount = state.discount || 0;
    const total = Math.max(subtotal - discount, 0);

    const subtotalEl = document.getElementById('items-subtotal');
    const totalEl = document.getElementById('items-total');

    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    if (totalEl) totalEl.textContent = formatCurrency(total);

    // Update item totals in the table
    const tbody = document.getElementById('items-tbody');
    if (tbody) {
        const rows = tbody.querySelectorAll('tr');
        rows.forEach((row, i) => {
            if (state.items[i]) {
                const span = row.querySelector('.item-total');
                if (span) {
                    span.textContent = formatCurrency(state.items[i].qty * state.items[i].price);
                }
            }
        });
    }

    updatePreview();
}

// ===================== DATE FORMAT =====================
function formatDateFull(dateStr) {
    if (!dateStr) return '';
    const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];

    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;

    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;
    if (month < 0 || month > 11) return dateStr;

    return `${day} de ${months[month]} de ${year}`;
}


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
    
    name = (name || 'EMITENTE').substring(0, 25).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    city = (city || 'CIDADE').substring(0, 15).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    
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

// ===================== UPDATE PREVIEW =====================
function updatePreview() {
    const preview = document.getElementById('document-preview');
    if (!preview) return;

    // Set CSS custom properties
    preview.style.setProperty('--doc-primary', state.colors.primary);
    preview.style.setProperty('--doc-secondary', state.colors.secondary);

    const docTitles = {
        'recibo': 'Recibo de Pagamento',
        'servico': 'Recibo de Prestação de Serviço',
        'orcamento': 'Orçamento',
        'ordem': 'Ordem de Serviço'
    };

    const em = state.emitter;
    const rec = state.recipient;
    const doc = state.document;
    const srv = state.service;

    // ---- Header ----
    let logoHtml = '';
    if (state.logo) {
        logoHtml = `<img class="doc-logo" src="${state.logo}" alt="Logo">`;
    }

    let companyDetails = '';
    if (em.doc) companyDetails += `CPF/CNPJ: ${em.doc}<br>`;
    if (em.address) companyDetails += `${em.address}<br>`;
    const contactParts = [];
    if (em.phone) contactParts.push(em.phone);
    if (em.email) contactParts.push(em.email);
    if (contactParts.length) companyDetails += contactParts.join(' • ');

    const headerHtml = `
        <div class="doc-header">
            ${logoHtml}
            <div class="doc-company-info">
                <h2 class="doc-company-name">${em.name || 'Sua Empresa'}</h2>
                <p class="doc-company-details">${companyDetails || '&nbsp;'}</p>
            </div>
        </div>
    `;

    // ---- Title bar ----
    const titleBarHtml = `
        <div class="doc-title-bar">
            <span class="doc-title">${docTitles[state.docType] || 'Documento'}</span>
            <span class="doc-number">Nº ${doc.number || '---'}</span>
        </div>
    `;

    // ---- Recipient ----
    let recipientAddressHtml = '';
    if (rec.address) {
        recipientAddressHtml = `
            <div class="doc-field">
                <span class="doc-field-label">Endereço:</span>
                <span class="doc-field-value">${rec.address}</span>
            </div>`;
    }
    const recipientHtml = `
        <div class="doc-section">
            <div class="doc-section-title">Dados do Cliente</div>
            <div class="doc-field">
                <span class="doc-field-label">Nome:</span>
                <span class="doc-field-value">${rec.name || '—'}</span>
            </div>
            <div class="doc-field">
                <span class="doc-field-label">CPF/CNPJ:</span>
                <span class="doc-field-value">${rec.doc || '—'}</span>
            </div>
            ${recipientAddressHtml}
        </div>
    `;

    // ---- Value section (recibo / servico) ----
    let valueHtml = '';
    if (state.docType === 'recibo' || state.docType === 'servico') {
        const numVal = parseCurrency(doc.value);
        const formattedVal = numVal > 0 ? formatCurrency(numVal) : 'R$ 0,00';
        const wordsVal = numVal > 0 ? valueInWords(numVal) : 'zero reais';

        valueHtml = `
            <div class="doc-value-highlight">
                <p class="doc-value-amount">${formattedVal}</p>
                <p class="doc-value-extenso">(${wordsVal})</p>
            </div>
        `;
    }

    // ---- Items table (orcamento / ordem) ----
    let itemsHtml = '';
    if (state.docType === 'orcamento' || state.docType === 'ordem') {
        let subtotal = 0;
        let rowsHtml = '';
        state.items.forEach((item, i) => {
            const lineTotal = (item.qty || 0) * (item.price || 0);
            subtotal += lineTotal;
            rowsHtml += `
                <tr>
                    <td style="text-align:center;">${i + 1}</td>
                    <td>${item.desc || '—'}</td>
                    <td style="text-align:center;">${item.qty || 0}</td>
                    <td style="text-align:right;">${formatCurrency(item.price || 0)}</td>
                    <td style="text-align:right;">${formatCurrency(lineTotal)}</td>
                </tr>`;
        });

        const discount = state.discount || 0;
        const total = Math.max(subtotal - discount, 0);

        let discountRow = '';
        if (discount > 0) {
            discountRow = `
                <div class="doc-summary-row">
                    <span>Desconto:</span>
                    <span>- ${formatCurrency(discount)}</span>
                </div>`;
        }

        itemsHtml = `
            <table class="doc-items-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Descrição</th>
                        <th>Qtd</th>
                        <th>Valor Unit.</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
            </table>
            <div class="doc-items-summary">
                <div class="doc-summary-row">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(subtotal)}</span>
                </div>
                ${discountRow}
                <div class="doc-summary-row doc-total">
                    <span>Total:</span>
                    <span>${formatCurrency(total)}</span>
                </div>
            </div>
        `;
    }

    // ---- Description ----
    let descriptionHtml = '';
    if (doc.description) {
        descriptionHtml = `
            <div class="doc-section">
                <div class="doc-section-title">Descrição</div>
                <div class="doc-description-box">${doc.description.replace(/\n/g, '<br>')}</div>
            </div>
        `;
    }

    // ---- Payment method ----
    let paymentHtml = '';
    if (doc.paymentMethod) {
        paymentHtml = `
            <div class="doc-field" style="margin-top:12px;">
                <span class="doc-field-label">Forma de Pagamento:</span>
                <span class="doc-field-value">${doc.paymentMethod}</span>
            </div>
        `;
    }

    // ---- Service info (servico / ordem) ----
    let serviceHtml = '';
    if (state.docType === 'servico' || state.docType === 'ordem') {
        const serviceFields = [];
        if (srv.period) {
            serviceFields.push(`
                <div class="doc-field">
                    <span class="doc-field-label">Período:</span>
                    <span class="doc-field-value">${srv.period}</span>
                </div>`);
        }
        if (srv.warranty) {
            serviceFields.push(`
                <div class="doc-field">
                    <span class="doc-field-label">Garantia:</span>
                    <span class="doc-field-value">${srv.warranty}</span>
                </div>`);
        }
        if (serviceFields.length > 0) {
            serviceHtml = `
                <div class="doc-section">
                    <div class="doc-section-title">Dados do Serviço</div>
                    ${serviceFields.join('')}
                </div>
            `;
        }
    }

    // ---- Date & Location ----
    let dateLocationHtml = '';
    const formattedDate = formatDateFull(doc.date);
    if (doc.city || formattedDate) {
        const locationParts = [];
        if (doc.city) locationParts.push(doc.city);
        if (formattedDate) locationParts.push(formattedDate);
        dateLocationHtml = `
            <div class="doc-date-location">
                ${locationParts.join(', ')}
            </div>
        `;
    }

    // ---- Signature ----
    const signatureHtml = `
        <div class="doc-signature">
            <div class="doc-signature-line">
                <p class="doc-signature-name">${em.name || '________________________'}</p>
                <p class="doc-signature-doc">${em.doc || ''}</p>
            </div>
        </div>
    `;

    // ---- Notes ----
    let notesHtml = '';
    if (doc.notes) {
        notesHtml = `
            <div class="doc-notes">
                <strong>Observações:</strong> ${doc.notes.replace(/\n/g, '<br>')}
            </div>
        `;
    }

    // ---- Footer ----
    const nowStr = new Date().toLocaleString('pt-BR');
    const footerHtml = `
        <div class="doc-footer">
            <span>Documento gerado em ${nowStr}</span>
            <span>Nº ${doc.number || '---'}</span>
        </div>
    `;

    // ---- Assemble ----
    preview.innerHTML =
        headerHtml +
        titleBarHtml +
        recipientHtml +
        valueHtml +
        itemsHtml +
        descriptionHtml +
        paymentHtml +
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

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-fadeout');
        toast.addEventListener('animationend', () => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        });
    }, 3000);
}

// ===================== CUSTOM CONFIRM MODAL =====================
function confirmModal(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        const msgEl = document.getElementById('confirm-message');
        const btnYes = document.getElementById('btn-confirm-yes');
        const btnNo = document.getElementById('btn-confirm-no');
        
        if (!modal) {
            resolve(confirm(message));
            return;
        }

        msgEl.textContent = message;
        modal.style.display = 'flex';
        
        const cleanup = () => {
            btnYes.removeEventListener('click', onYes);
            btnNo.removeEventListener('click', onNo);
            modal.style.display = 'none';
        };
        
        const onYes = () => { cleanup(); resolve(true); };
        const onNo = () => { cleanup(); resolve(false); };
        
        btnYes.addEventListener('click', onYes);
        btnNo.addEventListener('click', onNo);
    });
}

// ===================== CLOUD STORAGE (SUPABASE) =====================
async function saveToStorage() {
    try {
        const payload = {
            logo: state.logo,
            color_primary: state.colors.primary,
            color_secondary: state.colors.secondary,
            emitter_name: state.emitter.name,
            emitter_doc: state.emitter.doc,
            emitter_phone: state.emitter.phone,
            emitter_email: state.emitter.email,
            emitter_address: state.emitter.address,
                emitter_pix: state.emitter.pix
        };

        const { error } = await supabaseClient
            .from('user_profiles')
            .update(payload)
            .eq('id', currentUser.id);

        if (error) throw error;

        // Save local draft for the rest of the document (items, document details)
        localStorage.setItem('notazio-draft-data', JSON.stringify({
            document: state.document,
            service: state.service,
            items: state.items,
            discount: state.discount,
            docType: state.docType
        }));

        showToast('Dados salvos na nuvem com sucesso!', 'success');
    } catch (err) {
        console.error(err);
        showToast('Erro ao salvar os dados na nuvem.', 'error');
    }
}

async function loadFromStorage() {
    try {
        // 1. Load from Supabase (Profile Data)
        const { data, error } = await supabaseClient
            .from('user_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (data && !error) {
            if (data.name) {
                const greetingEl = document.getElementById('user-greeting');
                if (greetingEl) {
                    const firstName = data.name.split(' ')[0];
                    updateGreetingUI(firstName);
                }
            }
            if (data.logo) state.logo = data.logo;
            if (data.color_primary) state.colors.primary = data.color_primary;
            if (data.color_secondary) state.colors.secondary = data.color_secondary;
            if (data.emitter_name) state.emitter.name = data.emitter_name;
            if (data.emitter_doc) state.emitter.doc = data.emitter_doc;
            if (data.emitter_phone) state.emitter.phone = data.emitter_phone;
            if (data.emitter_email) state.emitter.email = data.emitter_email;
            if (data.emitter_address) state.emitter.address = data.emitter_address;
            if (data.emitter_pix) state.emitter.pix = data.emitter_pix;
        }

        // 2. Load Draft from LocalStorage (Session Data)
        const savedDraft = localStorage.getItem('notazio-draft-data');
        if (savedDraft) {
            const draft = JSON.parse(savedDraft);
            if (draft.docType) state.docType = draft.docType;
            if (draft.document) Object.assign(state.document, draft.document);
            if (draft.service) Object.assign(state.service, draft.service);
            if (draft.items && Array.isArray(draft.items) && draft.items.length > 0) {
                state.items = draft.items;
            }
            if (typeof draft.discount === 'number') state.discount = draft.discount;
        }

        // Populate form fields
        populateFormFromState();
    } catch (err) {
        // Silently fail – corrupted data
    }

// ===================== TOAST =====================
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-fadeout');
        toast.addEventListener('animationend', () => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        });
    }, 3000);
}



// ===================== CLOUD STORAGE (SUPABASE) =====================
async function saveToStorage() {
    try {
        const payload = {
            logo: state.logo,
            color_primary: state.colors.primary,
            color_secondary: state.colors.secondary,
            emitter_name: state.emitter.name,
            emitter_doc: state.emitter.doc,
            emitter_phone: state.emitter.phone,
            emitter_email: state.emitter.email,
            emitter_address: state.emitter.address
        };

        const { error } = await supabaseClient
            .from('user_profiles')
            .update(payload)
            .eq('id', currentUser.id);

        if (error) throw error;

        // Save local draft for the rest of the document (items, document details)
        localStorage.setItem('notazio-draft-data', JSON.stringify({
            document: state.document,
            service: state.service,
            items: state.items,
            discount: state.discount,
            docType: state.docType
        }));

        showToast('Dados salvos na nuvem com sucesso!', 'success');
    } catch (err) {
        console.error(err);
        showToast('Erro ao salvar os dados na nuvem.', 'error');
    }
}

async function loadFromStorage() {
    try {
        // 1. Load from Supabase (Profile Data)
        const { data, error } = await supabaseClient
            .from('user_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (data && !error) {
            if (data.name) {
                const greetingEl = document.getElementById('user-greeting');
                if (greetingEl) {
                    const firstName = data.name.split(' ')[0];
                    updateGreetingUI(firstName);
                }
            }
            if (data.logo) state.logo = data.logo;
            if (data.color_primary) state.colors.primary = data.color_primary;
            if (data.color_secondary) state.colors.secondary = data.color_secondary;
            if (data.emitter_name) state.emitter.name = data.emitter_name;
            if (data.emitter_doc) state.emitter.doc = data.emitter_doc;
            if (data.emitter_phone) state.emitter.phone = data.emitter_phone;
            if (data.emitter_email) state.emitter.email = data.emitter_email;
            if (data.emitter_address) state.emitter.address = data.emitter_address;
        }

        // 2. Load Draft from LocalStorage (Session Data)
        const savedDraft = localStorage.getItem('notazio-draft-data');
        if (savedDraft) {
            const draft = JSON.parse(savedDraft);
            if (draft.docType) state.docType = draft.docType;
            if (draft.document) Object.assign(state.document, draft.document);
            if (draft.service) Object.assign(state.service, draft.service);
            if (draft.items && Array.isArray(draft.items) && draft.items.length > 0) {
                state.items = draft.items;
            }
            if (typeof draft.discount === 'number') state.discount = draft.discount;
        }

        // Populate form fields
        populateFormFromState();
    } catch (err) {
        // Silently fail – corrupted data
    }
}
}

function populateFormFromState() {
    // Helper to set value if element exists
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el && val !== undefined && val !== null) el.value = val;
    };

    // Emitter
    setVal('emitter-name', state.emitter.name);
    setVal('emitter-doc', state.emitter.doc);
    setVal('emitter-phone', state.emitter.phone);
    setVal('emitter-email', state.emitter.email);
    setVal('emitter-address', state.emitter.address);

    // Recipient
    setVal('recipient-name', state.recipient.name);
    setVal('recipient-doc', state.recipient.doc);
    setVal('recipient-address', state.recipient.address);

    // Document
    setVal('doc-number', state.document.number);
    setVal('doc-date', state.document.date);
    setVal('doc-time', state.document.time);
    setVal('doc-city', state.document.city);
    setVal('doc-value', state.document.value);
    setVal('doc-value-text', state.document.valueText);
    setVal('payment-method', state.document.paymentMethod);
    setVal('doc-notes', state.document.notes);

    // Service
    setVal('service-period', state.service.period);
    setVal('service-warranty', state.service.warranty);

    // Colors
    setVal('color-primary', state.colors.primary);
    setVal('color-secondary', state.colors.secondary);

    // Discount
    if (state.discount > 0) {
        const discountEl = document.getElementById('items-discount');
        if (discountEl) discountEl.value = maskCurrency(String(Math.round(state.discount * 100)));
    }

    // Logo
    if (state.logo) {
        const previewImg = document.getElementById('logo-preview-img');
        const uploadContent = document.getElementById('logo-upload-content');
        const removeBtn = document.getElementById('remove-logo-btn');

        if (previewImg) {
            previewImg.src = state.logo;
            previewImg.style.display = 'block';
        }
        if (uploadContent) uploadContent.style.display = 'none';
        if (removeBtn) removeBtn.style.display = 'flex';
    }

    // Items table
    renderItemsTable();

    // Doc type tabs
    switchDocType(state.docType);
}

// ===================== CLEAR ALL =====================
async function clearAll() {
    if (!(await confirmModal('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.'))) {
        return;
    }

    // Reset state
    state.docType = 'recibo';
    state.logo = null;
    state.colors.primary = '#2563eb';
    state.colors.secondary = '#0f172a';
    state.emitter = { name: '', doc: '', phone: '', email: '', address: '' };
    state.recipient = { name: '', doc: '', address: '' };

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');

    state.document = {
        number: String(Date.now()).slice(-6),
        date: `${yyyy}-${mm}-${dd}`,
        time: `${hh}:${min}`,
        city: '',
        value: '',
        valueText: '',
        description: '',
        paymentMethod: '',
        notes: ''
    };
    state.service = { period: '', warranty: '' };
    state.items = [{ desc: '', qty: 1, price: 0 }];
    state.discount = 0;

    // Clear localStorage
    localStorage.removeItem('notazio-data');

    // Clear all form fields
    document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(el => {
        if (el.type === 'color') return;
        el.value = '';
    });

    // Re-populate defaults
    populateFormFromState();

    // Reset logo
    removeLogo();

    // Reset colors
    const cp = document.getElementById('color-primary');
    const cs = document.getElementById('color-secondary');
    if (cp) cp.value = state.colors.primary;
    if (cs) cs.value = state.colors.secondary;

    updatePreview();
    showToast('Todos os dados foram limpos.', 'success');
}

// ===================== BOOTSTRAP =====================
document.addEventListener('DOMContentLoaded', init);

// ===================== CLIENTS MANAGEMENT =====================
async function loadClientsList() {
    const list = document.getElementById('clients-list');
    if (!list) return;

    try {
        const { data, error } = await supabaseClient
            .from('clients')
            .select('*')
            .order('name');
            
        if (error) throw error;
        
        if (data.length === 0) {
            list.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 40px;">Você ainda não tem clientes salvos.</div>';
            return;
        }

        list.innerHTML = '';
        data.forEach(client => {
            const card = document.createElement('div');
            card.style.background = '#fff';
            card.style.padding = '16px';
            card.style.borderRadius = '8px';
            card.style.border = '1px solid var(--border-color)';
            card.style.display = 'flex';
            card.style.justifyContent = 'space-between';
            card.style.alignItems = 'center';

            card.innerHTML = `
                <div>
                    <h3 style="margin-bottom: 4px; font-size: 1.1rem; color: var(--text-main);">${client.name}</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">${client.document ? 'CPF/CNPJ: ' + client.document : ''} ${client.email ? '| ' + client.email : ''}</p>
                </div>
                <div>
                    <button class="btn-secondary btn-use-client" data-id="${client.id}" style="padding: 6px 12px; font-size: 0.85rem;">Usar no Documento</button>
                    <button class="btn-danger btn-del-client" data-id="${client.id}" style="padding: 6px 12px; font-size: 0.85rem; margin-left: 8px;">Excluir</button>
                </div>
            `;
            list.appendChild(card);
        });

        document.querySelectorAll('.btn-use-client').forEach(btn => {
            btn.addEventListener('click', () => {
                const client = data.find(c => c.id === btn.dataset.id);
                if (client) {
                    document.getElementById('recipient-name').value = client.name;
                    document.getElementById('recipient-doc').value = client.document || '';
                    document.getElementById('recipient-address').value = client.address || '';
                    state.recipient.name = client.name;
                    state.recipient.doc = client.document || '';
                    state.recipient.address = client.address || '';
                    updatePreview();
                    showToast('Cliente inserido no documento!', 'success');
                    document.querySelector('.nav-btn[data-target="view-new"]').click();
                }
            });
        });

        document.querySelectorAll('.btn-del-client').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (await confirmModal('Excluir este cliente?')) {
                    await supabaseClient.from('clients').delete().eq('id', btn.dataset.id);
                    loadClientsList();
                    showToast('Cliente excluído.', 'info');
                }
            });
        });

    } catch (err) {
        console.error(err);
        showToast('Erro ao carregar clientes', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('client-modal');
    const btnNewClient = document.getElementById('btn-new-client');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelClient = document.getElementById('btn-cancel-client');
    const clientForm = document.getElementById('client-form');

    function openModal() {
        if (modal) {
            modal.style.display = 'flex';
            document.getElementById('new-client-name').focus();
        }
    }

    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            if (clientForm) clientForm.reset();
        }
    }

    if (btnNewClient) btnNewClient.addEventListener('click', openModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancelClient) btnCancelClient.addEventListener('click', closeModal);

    // Close on overlay click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    if (clientForm) {
        clientForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('new-client-name').value.trim();
            const doc = document.getElementById('new-client-doc').value.trim();
            const email = document.getElementById('new-client-email').value.trim();
            const address = document.getElementById('new-client-address').value.trim();
            
            const submitBtn = document.getElementById('btn-save-client');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Salvando...';
            }

            try {
                const { error } = await supabaseClient.from('clients').insert([{
                    user_id: currentUser.id,
                    name,
                    document: doc,
                    email,
                    address
                }]);
                if (error) throw error;
                showToast('Cliente salvo com sucesso!', 'success');
                closeModal();
                loadClientsList();
            } catch (err) {
                console.error(err);
                showToast('Erro ao salvar cliente', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Salvar Cliente';
                }
            }
        });
    }
});

// ===================== HISTORY & DOCUMENTS MANAGEMENT =====================
async function registerDocument() {
    try {
        const type = state.docType;
        const number = state.document.number || '000';
        const date = state.document.date || new Date().toISOString().split('T')[0];
        const clientName = state.recipient.name || 'Cliente Não Informado';
        const clientDocument = state.recipient.doc || '';
        
        let value = 0;
        if (type === 'recibo' || type === 'servico') {
            value = parseCurrency(state.document.value) || 0;
        } else {
            let subtotal = 0;
            state.items.forEach(item => {
                subtotal += (item.qty || 0) * (item.price || 0);
            });
            const discount = state.discount || 0;
            value = Math.max(subtotal - discount, 0);
        }

        const { error } = await supabaseClient.from('documents').insert([{
            user_id: currentUser.id,
            type,
            number,
            date,
            client_name: clientName,
            client_document: clientDocument,
            value,
            description: state.document.description || '',
            items: state // Save the entire state object so we can reconstruct the document
        }]);

        if (error) throw error;
        showToast('Documento registrado no histórico com sucesso!', 'success');
        
        if (clientName && clientName !== 'Cliente Não Informado') {
            const { data: existing } = await supabaseClient.from('clients').select('id').eq('name', clientName).eq('user_id', currentUser.id);
            if (!existing || existing.length === 0) {
                if (await confirmModal(`Deseja salvar ${clientName} na sua lista de clientes?`)) {
                    await supabaseClient.from('clients').insert([{
                        user_id: currentUser.id,
                        name: clientName,
                        document: clientDocument,
                        address: state.recipient.address || ''
                    }]);
                    showToast('Cliente salvo!', 'success');
                }
            }
        }
    } catch (err) {
        console.error(err);
        showToast('Erro ao registrar documento.', 'error');
    }
}

async function loadHistoryList() {
    const list = document.getElementById('history-list');
    if (!list) return;

    try {
        const { data, error } = await supabaseClient
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        if (data.length === 0) {
            list.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 40px;">Você ainda não tem documentos salvos.</div>';
            return;
        }

        list.innerHTML = '';
        data.forEach(doc => {
            const card = document.createElement('div');
            card.style.background = '#fff';
            card.style.padding = '16px';
            card.style.borderRadius = '8px';
            card.style.border = '1px solid var(--border-color)';
            card.style.display = 'flex';
            card.style.justifyContent = 'space-between';
            card.style.alignItems = 'center';

            const docTypeNames = { 'recibo': 'Recibo', 'servico': 'Serviço', 'orcamento': 'Orçamento', 'ordem': 'OS' };
            const typeName = docTypeNames[doc.type] || doc.type;

            card.innerHTML = `
                <div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span style="background: var(--accent-light); color: var(--accent); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">${typeName} #${doc.number}</span>
                        <span style="color: var(--text-muted); font-size: 0.85rem;">${formatDateFull(doc.date)}</span>
                    </div>
                    <h3 style="margin-bottom: 4px; font-size: 1.1rem; color: var(--text-main);">${doc.client_name}</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem; font-weight: 600;">${formatCurrency(doc.value)}</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-secondary btn-view-doc" data-id="${doc.id}" style="padding: 6px 12px; font-size: 0.85rem;">Ver Documento</button>
                    <button class="btn-danger btn-del-doc" data-id="${doc.id}" style="padding: 6px 12px; font-size: 0.85rem;">Excluir</button>
                </div>
            `;
            list.appendChild(card);
        });

        document.querySelectorAll('.btn-view-doc').forEach(btn => {
            btn.addEventListener('click', () => {
                const docId = btn.dataset.id;
                const docData = data.find(d => d.id === docId);
                if (docData && docData.items && docData.items.document) {
                    // This is a new format document where the entire state is saved in the items column!
                    Object.assign(state, docData.items);
                    updatePreview();
                    populateFormFromState();
                    document.querySelector('.nav-btn[data-target="view-new"]').click();
                    showToast('Documento carregado para visualização.', 'success');
                } else {
                    // Old format: We can't fully restore it, but we can do our best
                    showToast('Este documento antigo não possui todos os dados para ser recarregado.', 'info');
                }
            });
        });

        document.querySelectorAll('.btn-del-doc').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (await confirmModal('Excluir este documento do histórico?')) {
                    await supabaseClient.from('documents').delete().eq('id', btn.dataset.id);
                    loadHistoryList();
                    showToast('Documento excluído.', 'info');
                }
            });
        });

    } catch (err) {
        console.error(err);
        showToast('Erro ao carregar histórico', 'error');
    }
}


// ===================== MOBILE MENU =====================
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNavMenu = document.getElementById('main-nav-menu');
    const logoutMobileBtn = document.getElementById('btn-logout-mobile');
    const desktopLogoutBtn = document.getElementById('btn-logout');

    if (mobileMenuBtn && mainNavMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mainNavMenu.classList.toggle('menu-open');
        });

        // Close menu when clicking a nav link
        const navLinks = mainNavMenu.querySelectorAll('.nav-btn');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNavMenu.classList.remove('menu-open');
            });
        });
    }

    if (logoutMobileBtn && desktopLogoutBtn) {
        logoutMobileBtn.addEventListener('click', () => {
            desktopLogoutBtn.click(); // Trigger the actual logout logic
        });
    }
});


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
