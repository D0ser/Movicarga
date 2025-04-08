/**
 * Gestor de pestañas para formularios modales
 * Permite navegación entre distintas secciones del formulario
 */
class TabsManager {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;

        this.tabs = this.container.querySelectorAll('.tab-button');
        this.contents = this.container.querySelectorAll('.tab-content');
        this.progressSteps = this.container.querySelectorAll('.progress-step');
        this.mobileTabTitle = this.container.querySelector('.mobile-tab-title');
        
        // Identificar la última pestaña para mostrar los botones de acción final
        this.lastTabIndex = this.tabs.length - 1;
        
        this.currentTabIndex = 0;
        this.setupTabs();
        this.showTab(0); // Mostrar primera pestaña por defecto
        
        // Asegurar que todos los campos están disponibles
        this.optimizarCamposDisponibles();
    }

    setupTabs() {
        // Configurar los botones de pestañas
        this.tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                this.showTab(index);
            });
        });

        // Configurar los indicadores de progreso para que sean clickeables
        this.progressSteps.forEach((step, index) => {
            step.addEventListener('click', () => {
                // Permitir navegar directamente a cualquier pestaña sin validación
                this.showTab(index);
                
                // Actualizar el título móvil
                this.updateMobileTitle(index);
            });
        });

        // Configurar botones de navegación
        const nextButtons = this.container.querySelectorAll('.btn-next-tab');
        const prevButtons = this.container.querySelectorAll('.btn-prev-tab');

        nextButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Avanzar sin validar los campos
                this.nextTab();
                // Actualizar el título móvil
                this.updateMobileTitle(this.currentTabIndex);
            });
        });

        prevButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.prevTab();
                // Actualizar el título móvil
                this.updateMobileTitle(this.currentTabIndex);
            });
        });
        
        // Configurar los botones de acción (submit y reset) dentro de la última pestaña
        const lastTabContent = this.contents[this.lastTabIndex];
        if (lastTabContent) {
            const tabActionsButtons = lastTabContent.querySelectorAll('.final-tab-actions button');
            
            tabActionsButtons.forEach(button => {
                if (button.type === 'submit') {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        // Validar todos los campos del formulario antes de enviar
                        if (this.validateAllTabs()) {
                            // Si todo es válido, enviar el formulario
                            this.container.closest('form').submit();
                        }
                    });
                } else if (button.type === 'reset') {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        // Confirmar reset para evitar clics accidentales
                        Swal.fire({
                            title: '¿Limpiar formulario?',
                            text: 'Se perderán todos los datos ingresados',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#1a237e',
                            cancelButtonColor: '#9e9e9e',
                            confirmButtonText: 'Sí, limpiar',
                            cancelButtonText: 'Cancelar'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                this.container.closest('form').reset();
                                this.resetTabs();
                                
                                // Notificar al usuario que se ha limpiado el formulario
                                Swal.fire({
                                    title: 'Formulario limpiado',
                                    text: 'Se han eliminado todos los datos del formulario',
                                    icon: 'success',
                                    confirmButtonColor: '#1a237e',
                                    timer: 1500
                                });
                            }
                        });
                    });
                }
            });
            
            // Mejorar la responsividad para adaptarse a distintos tamaños de pantalla
            this.setupResponsiveLayout();
        }
    }
    
    // Método para configurar disposición responsive
    setupResponsiveLayout() {
        const updateLayout = () => {
            const isMobile = window.innerWidth < 768;
            const isSmallMobile = window.innerWidth < 480;
            const lastTabActions = this.contents[this.lastTabIndex].querySelector('.tabs-actions');
            
            if (lastTabActions) {
                if (isSmallMobile) {
                    lastTabActions.classList.add('small-mobile-layout');
                } else {
                    lastTabActions.classList.remove('small-mobile-layout');
                }
                
                if (isMobile && !isSmallMobile) {
                    lastTabActions.classList.add('mobile-layout');
                    lastTabActions.classList.remove('small-mobile-layout');
                } else if (!isMobile) {
                    lastTabActions.classList.remove('mobile-layout');
                }
            }
        };
        
        // Ejecutar inicialmente
        updateLayout();
        
        // Y actualizar cuando cambie el tamaño de la ventana
        window.addEventListener('resize', updateLayout);
    }

    // Método para actualizar el título móvil según la pestaña activa
    updateMobileTitle(index) {
        if (this.mobileTabTitle) {
            let tabTitle = '';
            if (index === 0) tabTitle = 'Datos de factura';
            else if (index === 1) tabTitle = 'Información económica';
            else if (index === 2) tabTitle = 'Datos del cliente';
            else if (index === 3) tabTitle = 'Datos de operación';
            
            this.mobileTabTitle.textContent = tabTitle;
        }
    }

    showTab(index) {
        if (index < 0 || index >= this.tabs.length) return;

        // Desactivar todas las pestañas y contenidos
        this.tabs.forEach(tab => tab.classList.remove('active'));
        this.contents.forEach(content => content.classList.remove('active'));

        // Activar la pestaña y contenido seleccionados
        this.tabs[index].classList.add('active');
        this.contents[index].classList.add('active');
        this.currentTabIndex = index;

        // Actualizar el título móvil
        this.updateMobileTitle(index);

        // Actualizar indicadores de progreso
        this.updateProgress();
    }

    nextTab() {
        if (this.currentTabIndex < this.tabs.length - 1) {
            this.showTab(this.currentTabIndex + 1);
        }
    }

    prevTab() {
        if (this.currentTabIndex > 0) {
            this.showTab(this.currentTabIndex - 1);
        }
    }

    updateProgress() {
        // Marcar pasos completados hasta la pestaña actual
        if (this.progressSteps) {
            this.progressSteps.forEach((step, index) => {
                if (index <= this.currentTabIndex) {
                    step.classList.add('completed');
                } else {
                    step.classList.remove('completed');
                }
            });
        }
    }

    validateCurrentTab() {
        // Siempre retorna true para permitir avanzar sin validación
        return true;
    }

    // Método para validar todas las pestañas
    validateAllTabs() {
        // Permitir enviar el formulario sin validación
        return true;
    }

    // Marcar todas las pestañas como incompletas para reiniciar el formulario
    resetTabs() {
        this.showTab(0);
        if (this.progressSteps) {
            this.progressSteps.forEach(step => {
                step.classList.remove('completed');
            });
        }
    }
    
    // Nuevo método para asegurar que todos los campos están disponibles
    optimizarCamposDisponibles() {
        // Ajustar el container para mejor visualización de campos
        if (this.container) {
            this.container.style.width = '100%';
            this.container.style.boxSizing = 'border-box';
            this.container.style.overflowX = 'hidden';
            
            // Optimizar visualización en dispositivos móviles
            if (window.innerWidth <= 768) {
                const formSections = this.container.querySelectorAll('.form-section');
                formSections.forEach(section => {
                    section.style.width = '100%';
                    section.style.maxWidth = '100%';
                    section.style.boxSizing = 'border-box';
                    section.style.padding = '15px';
                    section.style.overflowX = 'hidden';
                });
                
                const formGrids = this.container.querySelectorAll('.form-grid');
                formGrids.forEach(grid => {
                    grid.style.gridTemplateColumns = '1fr';
                    grid.style.width = '100%';
                });
            }
        }
    }
}

// Inicializar cuando se abra un modal con pestañas
document.addEventListener('DOMContentLoaded', () => {
    // Función para inicializar las pestañas cuando se abra el modal
    function setupTabsOnModalOpen() {
        const btnNuevaVenta = document.getElementById('btnNuevaVenta');
        if (btnNuevaVenta) {
            btnNuevaVenta.addEventListener('click', () => {
                // Esperar a que el modal esté visible
                setTimeout(() => {
                    new TabsManager('#ventasTabsContainer');
                }, 300);
            });
        }
        
        // También inicializar cuando se abre para editar
        document.querySelectorAll('.editar-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setTimeout(() => {
                    new TabsManager('#ventasTabsContainer');
                }, 300);
            });
        });
    }
    
    setupTabsOnModalOpen();
});
