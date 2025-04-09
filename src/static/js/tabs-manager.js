/**
 * Gestor de pestañas para formularios modales
 * Permite navegación entre distintas secciones del formulario
 */
class TabsManager {
    constructor(containerId) {
        // Guardar referencia a la instancia actual como estática
        TabsManager.currentInstance = this;
        
        this.container = document.querySelector(containerId);
        if (!this.container) {
            console.error(`No se encontró el contenedor ${containerId}`);
            return;
        }
        
        this.tabContents = this.container.querySelectorAll('.tab-content');
        this.tabButtons = this.container.querySelectorAll('.tab-button');
        this.progressSteps = this.container.querySelectorAll('.progress-step');
        this.currentTab = 0;
        
        // Limpiar eventos previos para evitar duplicados
        this.cleanupPreviousEvents();
        
        // Inicializar eventos de pestañas
        this.initTabEvents();
        
        console.log(`TabsManager inicializado para ${containerId}`);
    }
    
    // Método para limpiar eventos previos
    cleanupPreviousEvents() {
        // Remover eventos de botones de navegación de pestañas
        const oldTabButtons = this.container.querySelectorAll('.tab-button');
        oldTabButtons.forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });
        
        // Remover eventos de indicadores de progreso (steps)
        const oldProgressSteps = this.container.querySelectorAll('.progress-step');
        oldProgressSteps.forEach(step => {
            const newStep = step.cloneNode(true);
            step.parentNode.replaceChild(newStep, step);
        });
        
        // Remover eventos de botones de navegación
        const oldNextButtons = this.container.querySelectorAll('.btn-next-tab');
        oldNextButtons.forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });
        
        const oldPrevButtons = this.container.querySelectorAll('.btn-prev-tab');
        oldPrevButtons.forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });
        
        // Remover eventos de botones de acción final
        const oldSubmitButtons = this.container.querySelectorAll('button[type="submit"]');
        oldSubmitButtons.forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });
        
        const oldResetButtons = this.container.querySelectorAll('button[type="reset"], .btn-clean');
        oldResetButtons.forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });
        
        console.log("Eventos previos limpiados");
    }
    
    // Inicializar eventos de pestañas
    initTabEvents() {
        // Refreshear referencias después de la limpieza
        this.tabButtons = this.container.querySelectorAll('.tab-button');
        this.progressSteps = this.container.querySelectorAll('.progress-step');
        
        // Agregar eventos a los botones de pestañas
        this.tabButtons.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showTab(index);
                console.log(`Clic en pestaña ${index}`);
            });
        });
        
        // Agregar eventos mejorados a los indicadores de progreso (números)
        this.progressSteps.forEach((step, index) => {
            // Asegurarse de que sea clickeable
            step.style.cursor = 'pointer';
            step.style.pointerEvents = 'auto';
            
            // Agregar evento de clic
            step.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Clic en indicador de progreso ${index}`);
                this.showTab(index);
            });
            
            // Agregar evento para mejor feedback visual al pasar el mouse
            step.addEventListener('mouseover', () => {
                step.style.transform = 'scale(1.1)';
            });
            
            step.addEventListener('mouseout', () => {
                step.style.transform = '';
            });
            
            // Agregar evento de toque para móviles
            step.addEventListener('touchstart', () => {
                step.style.transform = 'scale(1.1)';
            });
            
            step.addEventListener('touchend', () => {
                step.style.transform = '';
                setTimeout(() => this.showTab(index), 50);
            });
        });
        
        // Agregar eventos a los botones de siguiente
        const nextButtons = this.container.querySelectorAll('.btn-next-tab');
        nextButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.nextTab();
                console.log("Botón siguiente presionado");
            });
            
            // Asegurar que sea clickeable
            button.style.pointerEvents = 'auto';
            button.style.cursor = 'pointer';
        });
        
        // Agregar eventos a los botones de anterior
        const prevButtons = this.container.querySelectorAll('.btn-prev-tab');
        prevButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.prevTab();
                console.log("Botón anterior presionado");
            });
            
            // Asegurar que sea clickeable
            button.style.pointerEvents = 'auto';
            button.style.cursor = 'pointer';
        });
        
        // Agregar confirmación antes de limpiar el formulario
        const resetButtons = this.container.querySelectorAll('button[type="reset"], .btn-clean');
        resetButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Mostrar confirmación usando SweetAlert2 que es más bonito y compatible con el estilo de la app
                Swal.fire({
                    title: '¿Estás seguro?',
                    text: 'Se borrarán todos los datos ingresados',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Sí, limpiar formulario',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Si confirma, resetear el formulario
                        const form = button.closest('form');
                        if (form) {
                            form.reset();
                            this.showTab(0); // Volver a la primera pestaña
                            console.log("Formulario limpiado por confirmación del usuario");
                            
                            // Mostrar notificación de éxito
                            if (window.Swal) {
                                Swal.fire({
                                    toast: true,
                                    position: 'top-end',
                                    icon: 'success',
                                    title: 'Formulario limpiado correctamente',
                                    showConfirmButton: false,
                                    timer: 3000
                                });
                            }
                        }
                    }
                });
            });
        });
        
        // Mostrar la primera pestaña
        this.showTab(0);
    }
    
    // Mostrar una pestaña específica
    showTab(n) {
        // Si no hay pestañas o el índice está fuera de rango, salir
        if (this.tabContents.length === 0 || n < 0 || n >= this.tabContents.length) {
            return;
        }
        
        // Ocultar todas las pestañas
        this.tabContents.forEach(tab => {
            tab.classList.remove('active');
            tab.style.display = 'none';
        });
        
        // Quitar clase activa de todos los botones
        this.tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        // Actualizar los indicadores de progreso
        this.progressSteps.forEach((step, index) => {
            if (index <= n) {
                step.classList.add('completed');
            } else {
                step.classList.remove('completed');
            }
        });
        
        // Mostrar la pestaña actual con animación
        const currentTab = this.tabContents[n];
        currentTab.style.display = 'block';
        
        // Forzar reflow para activar la animación
        void currentTab.offsetWidth;
        
        // Añadir clase activa
        currentTab.classList.add('active');
        
        // Marcar el botón correspondiente como activo
        if (this.tabButtons[n]) {
            this.tabButtons[n].classList.add('active');
        }
        
        // Actualizar el título para móviles
        this.updateMobileTitle(n);
        
        // Actualizar el estado actual
        this.currentTab = n;
        
        console.log(`Mostrando pestaña ${n}`);
    }
    
    // Actualizar el título visible en móviles
    updateMobileTitle(n) {
        const mobileTitle = this.container.querySelector('.mobile-tab-title');
        if (mobileTitle && this.tabButtons[n]) {
            const titleText = this.tabButtons[n].textContent.trim();
            mobileTitle.textContent = titleText;
        }
    }
    
    // Ir a la siguiente pestaña
    nextTab() {
        const nextTab = this.currentTab + 1;
        if (nextTab < this.tabContents.length) {
            this.showTab(nextTab);
        }
    }
    
    // Ir a la pestaña anterior
    prevTab() {
        const prevTab = this.currentTab - 1;
        if (prevTab >= 0) {
            this.showTab(prevTab);
        }
    }
    
    // Reiniciar pestañas al estado inicial
    resetTabs() {
        this.showTab(0);
    }
}

// Función para inicializar las pestañas cuando se abra el modal
function setupTabsOnModalOpen() {
    const btnNuevaVenta = document.getElementById('btnNuevaVenta');
    if (btnNuevaVenta) {
        // Remover cualquier evento anterior clonando el botón
        const nuevoBoton = btnNuevaVenta.cloneNode(true);
        if (btnNuevaVenta.parentNode) {
            btnNuevaVenta.parentNode.replaceChild(nuevoBoton, btnNuevaVenta);
        }
        
        nuevoBoton.addEventListener('click', () => {
            // Esperar a que el modal esté visible
            setTimeout(() => {
                console.log("Inicializando TabsManager desde btnNuevaVenta");
                window.tabsManager = new TabsManager('#ventasTabsContainer');
            }, 300);
        });
    }
    
    // También inicializar cuando se abre para editar
    document.querySelectorAll('.editar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(() => {
                console.log("Inicializando TabsManager desde editar-btn");
                window.tabsManager = new TabsManager('#ventasTabsContainer');
            }, 300);
        });
    });
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setupTabsOnModalOpen();
});
