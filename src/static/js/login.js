class AuthManager {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', this.handleLogin.bind(this));
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
            NotificationManager.error('Usuario o contraseña incorrectos');
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
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});