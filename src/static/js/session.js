class SessionManager {
    static checkAuth() {
        const userRole = sessionStorage.getItem('userRole');
        const loginTime = sessionStorage.getItem('loginTime');
        
        if (!userRole || !loginTime) {
            this.redirectToLogin();
            return false;
        }

        // Verificar si la sesión ha expirado (4 horas)
        const now = new Date();
        const loginDate = new Date(loginTime);
        const hoursDiff = (now - loginDate) / (1000 * 60 * 60);

        if (hoursDiff > 4) {
            this.logout();
            return false;
        }

        return true;
    }

    static logout() {
        sessionStorage.clear();
        this.redirectToLogin();
    }

    static redirectToLogin() {
        window.location.href = 'login.html';
    }

    static updateLastActivity() {
        sessionStorage.setItem('lastActivity', new Date().toISOString());
    }
}

// Verificar autenticación en cada página
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.indexOf('login.html') === -1) {
        SessionManager.checkAuth();
    }
});

// Actualizar actividad con cada interacción
document.addEventListener('click', () => {
    SessionManager.updateLastActivity();
});