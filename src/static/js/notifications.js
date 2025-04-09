class NotificationManager {
    static show(message, type = 'info') {
        // Verificar si SweetAlert2 está disponible y usarlo si es posible
        if (window.Swal) {
            Swal.fire({
                title: this.getNotificationTitle(type),
                text: message,
                icon: type,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
            return;
        }
        
        // De lo contrario, usar notificaciones personalizadas
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animación de entrada
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto cerrar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // También registrar en la consola para debug
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    static getIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }
    
    static getNotificationTitle(type) {
        switch(type) {
            case 'success': return '¡Éxito!';
            case 'error': return 'Error';
            case 'warning': return 'Advertencia';
            case 'info': return 'Información';
            default: return '';
        }
    }

    static success(message) {
        this.show(message, 'success');
    }

    static error(message) {
        this.show(message, 'error');
    }

    static warning(message) {
        this.show(message, 'warning');
    }

    static info(message) {
        this.show(message, 'info');
    }
}