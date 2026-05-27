// ===================== SUPABASE CONFIG =====================
const SUPABASE_URL = 'https://myckyedoiglkxytyjyqa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WSdJEFExwxIOkGv60FQFzg_0OMOBXe5';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===================== DOM ELEMENTS =====================
const form = document.getElementById('auth-form');
const nameInput = document.getElementById('name');
const nameGroup = document.getElementById('name-group');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const toggleBtn = document.getElementById('toggle-btn');
const toggleText = document.getElementById('toggle-text');
const formTitle = document.getElementById('form-title');
const formSubtitle = document.getElementById('form-subtitle');
const errorDiv = document.getElementById('login-error');
const successDiv = document.getElementById('login-success');

let isLoginMode = true;

// ===================== CHECK AUTH =====================
async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        window.location.href = 'index.html'; // Already logged in
    }
}
checkSession();

// ===================== TOGGLE MODE =====================
toggleBtn.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    if (isLoginMode) {
        nameGroup.style.display = 'none';
        nameInput.required = false;
        formTitle.textContent = 'Entrar';
        formSubtitle.textContent = 'Acesse sua conta para continuar';
        submitBtn.textContent = 'Entrar na Conta';
        toggleText.textContent = 'Ainda não tem conta?';
        toggleBtn.textContent = 'Criar conta';
    } else {
        nameGroup.style.display = 'block';
        nameInput.required = true;
        formTitle.textContent = 'Criar Conta';
        formSubtitle.textContent = 'Comece a gerar recibos profissionais';
        submitBtn.textContent = 'Cadastrar';
        toggleText.textContent = 'Já possui uma conta?';
        toggleBtn.textContent = 'Fazer login';
    }
});

function showError(msg) {
    successDiv.style.display = 'none';
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
}

function showSuccess(msg) {
    errorDiv.style.display = 'none';
    successDiv.textContent = msg;
    successDiv.style.display = 'block';
}

// ===================== FORM SUBMIT =====================
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if ((!isLoginMode && !name) || !email || !password) {
        showError('Preencha todos os campos.');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Aguarde...';
    
    try {
        if (isLoginMode) {
            // Login
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            // Redirect
            window.location.href = 'index.html';
        } else {
            // Register
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            });
            
            if (error) throw error;
            
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                showError('Este e-mail já está cadastrado.');
            } else {
                // Sucesso no cadastro
                showSuccess('Cadastro realizado com sucesso! Redirecionando...');
                
                // Aguarda 2 segundos para o usuário ver a mensagem antes de redirecionar
                setTimeout(() => {
                    if (data.session) {
                        window.location.href = 'index.html';
                    } else {
                        // Se por acaso precisar confirmar email
                        showSuccess('Conta criada! Por favor, confirme seu e-mail.');
                        toggleBtn.click();
                        emailInput.value = email;
                        passwordInput.value = '';
                    }
                }, 2000);
            }
        }
    } catch (err) {
        console.error(err);
        if (err.message.includes('Invalid login credentials')) {
            showError('E-mail ou senha incorretos.');
        } else if (err.message.includes('Password should be at least')) {
            showError('A senha deve ter pelo menos 6 caracteres.');
        } else {
            showError('Ocorreu um erro. Tente novamente mais tarde.');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = isLoginMode ? 'Entrar na Conta' : 'Cadastrar';
    }
});
