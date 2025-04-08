class AuthManager {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('loginForm');
        const togglePasswordBtn = document.querySelector('.toggle-password');

        if (form) {
            form.addEventListener('submit', this.handleLogin.bind(this));
        }

        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', this.togglePasswordVisibility.bind(this));
        }
    }

    togglePasswordVisibility(e) {
        const button = e.currentTarget;
        const input = document.getElementById('password');
        const icon = button.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!this.validateInput(username, password)) {
            return;
        }

        this.authenticateUser(username, password);
    }

    validateInput(username, password) {
        if (!username || !password) {
            NotificationManager.error('Por favor complete todos los campos');
            return false;
        }
        return true;
    }

    authenticateUser(username, password) {
        // Simulación de autenticación - En producción esto sería una llamada al backend
        const validUser = {
            username: 'c.llanos',
            password: '3525913',
            role: 'admin'
        };

        if (username === validUser.username && password === validUser.password) {
            this.handleSuccessfulLogin(validUser);
        } else {
            this.handleFailedLogin();
        }
    }

    handleSuccessfulLogin(user) {
        sessionStorage.setItem('userRole', user.role);
        sessionStorage.setItem('username', user.username);
        sessionStorage.setItem('loginTime', new Date().toISOString());
        
        NotificationManager.success('¡Bienvenido!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    handleFailedLogin() {
        NotificationManager.error('Usuario o contraseña incorrectos');
        const passwordInput = document.getElementById('password');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});