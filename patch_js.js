const fs = require('fs');

let js = fs.readFileSync('app.js', 'utf8');

// Replace standard greeting with dynamic greeting
const dynamicGreetingFn = `
function getDynamicGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
}

function updateGreetingUI(firstName) {
    const greetingStr = \`\${getDynamicGreeting()}, \${firstName}.\`;
    const greetingEl = document.getElementById('user-greeting');
    if (greetingEl) greetingEl.textContent = greetingStr;
    const mobileGreetingEl = document.getElementById('user-greeting-mobile');
    if (mobileGreetingEl) mobileGreetingEl.textContent = greetingStr;
}
`;

// Inject dynamicGreetingFn before loadFromStorage (or just at the top after imports)
js = js.replace('// ===================== STATE =====================', dynamicGreetingFn + '\n// ===================== STATE =====================');

// Replace the actual 'Olá' logic
js = js.replace(/greetingEl\.textContent = \`Ol., \$\{firstName\}\`;/g, 'updateGreetingUI(firstName);');

// Add the event listener for the mobile menu at the end
const mobileMenuLogic = `
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
`;

// Append mobile menu logic to the end of app.js
if (!js.includes('MOBILE MENU')) {
    js += '\n' + mobileMenuLogic;
}

fs.writeFileSync('app.js', js);
console.log('JavaScript updated with dynamic greeting and hamburger menu!');
