/**
 * Animaciones para formularios en modales
 */
document.addEventListener('DOMContentLoaded', () => {
    // Función para animar la entrada de secciones de formulario cuando se abre un modal
    function setupFormSectionAnimations() {
        // Buscar todos los botones que abren modales con formularios
        const modalTriggers = document.querySelectorAll('[data-modal]');
        
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const modalId = trigger.getAttribute('data-modal');
                const modal = document.getElementById(modalId);
                
                if (modal) {
                    // Una vez que el modal es visible, animar las secciones
                    setTimeout(() => {
                        const sections = modal.querySelectorAll('.form-section');
                        sections.forEach((section, index) => {
                            // Aplicar un retraso incremental para crear un efecto cascada
                            setTimeout(() => {
                                section.classList.add('animate__animated', 'animate__fadeInUp');
                            }, 100 * index);
                        });
                    }, 300); // Pequeño retraso para asegurar que el modal ya está visible
                }
            });
        });
    }

    // Función para preparar el botón de "Nueva Venta" para abrir el modal
    function setupModalTriggers() {
        const btnNuevaVenta = document.getElementById('btnNuevaVenta');
        if (btnNuevaVenta) {
            btnNuevaVenta.setAttribute('data-modal', 'ventaFormModal');
        }
    }

    // Inicializar
    setupModalTriggers();
    setupFormSectionAnimations();
});
