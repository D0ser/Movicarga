class SidebarManager {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.mainContent = document.querySelector('.main-content');
        this.toggleButton = document.getElementById('sidebar-toggle');
        this.logoutButton = document.getElementById('logout-btn');
        this.usernameDisplay = document.getElementById('username-display');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.displayUsername();
        this.restoreSidebarState();
    }

    setupEventListeners() {
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => this.toggleSidebar());
        }

        if (this.logoutButton) {
            this.logoutButton.addEventListener('click', (e) => this.handleLogout(e));
        }

        // Cerrar sidebar en móvil al hacer clic en un enlace
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.sidebar.classList.remove('active');
                }
            });
        });

        // Gestionar cambios de tamaño de ventana
        window.addEventListener('resize', () => this.handleResize());
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('active');
        localStorage.setItem('sidebarState', this.sidebar.classList.contains('active'));
    }

    restoreSidebarState() {
        const sidebarState = localStorage.getItem('sidebarState');
        if (sidebarState === 'true') {
            this.sidebar.classList.add('active');
        }
    }

    handleResize() {
        if (window.innerWidth > 768) {
            this.sidebar.classList.remove('active');
        }
    }

    displayUsername() {
        if (this.usernameDisplay) {
            const username = sessionStorage.getItem('username');
            this.usernameDisplay.textContent = username || 'Usuario';
        }
    }

    handleLogout(e) {
        e.preventDefault();
        NotificationManager.info('Cerrando sesión...');
        setTimeout(() => {
            sessionStorage.clear();
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    new SidebarManager();
});