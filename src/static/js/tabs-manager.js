/**
 * Gestor de pestañas para formularios modales
 * Permite navegación entre distintas secciones del formulario
 */
class TabsManager {
    constructor(containerId) {
        this.container = document.querySelector(containerId);
        if (!this.container) {
            throw new Error(`Contenedor de pestañas no encontrado: ${containerId}`);
        }
        
        // Guardar instancia actual
        TabsManager.currentInstance = this;
        window.tabsManager = this;
        
        this.tabContents = this.container.querySelectorAll('.tab-content');
        this.tabButtons = this.container.querySelectorAll('.tab-button');
        this.progressSteps = this.container.querySelectorAll('.progress-step');
        
        this.currentTab = 0;
        
        console.log('TabsManager inicializado', {
            container: this.container,
            tabsCount: this.tabContents.length,
            buttonsCount: this.tabButtons.length,
            stepsCount: this.progressSteps.length
        });
        
        // Inicializar eventos
        this.setupEvents();
        
        // Mostrar la primera pestaña
        this.showTab(0);
    }
    
    // Configurar todos los eventos necesarios
    setupEvents() {
        console.log("Configurando eventos en TabsManager");
        
        // 1. Configurar botones de pestañas
        this.tabButtons.forEach((button, index) => {
            // Eliminar eventos antiguos
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Agregar nuevo evento
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Tab button ${index} clicked`);
                this.showTab(index);
            });
        });
        
        // 2. Configurar progress steps (indicadores numéricos)
        this.progressSteps.forEach((step, index) => {
            // Asegurar que sean clickeables
            step.style.cursor = 'pointer';
            step.style.pointerEvents = 'auto';
            step.style.position = 'relative';
            step.style.zIndex = '100';
            
            // Eliminar eventos antiguos
            const newStep = step.cloneNode(true);
            step.parentNode.replaceChild(newStep, step);
            
            // Agregar nuevo evento
            newStep.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Progress step ${index} clicked`);
                this.showTab(index);
            });
        });
        
        // 3. Configurar botones de navegación
        const nextButtons = this.container.querySelectorAll('.btn-next-tab');
        nextButtons.forEach(button => {
            // Eliminar eventos antiguos
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Agregar nuevo evento
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Next button clicked');
                this.nextTab();
            });
        });
        
        const prevButtons = this.container.querySelectorAll('.btn-prev-tab');
        prevButtons.forEach(button => {
            // Eliminar eventos antiguos
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Agregar nuevo evento
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Prev button clicked');
                this.prevTab();
            });
        });
    }
    
    // Método para destruir instancias y limpiar eventos
    destroy() {
        console.log("Destruyendo instancia de TabsManager");
        TabsManager.currentInstance = null;
        window.tabsManager = null;
    }
    
    // Mostrar pestaña específica
    showTab(index) {
        if (index < 0 || index >= this.tabContents.length) {
            console.error(`Índice de pestaña inválido: ${index}`);
            return;
        }
        
        console.log(`TabsManager: Mostrando pestaña ${index}`);
        
        // Ocultar todas las pestañas
        this.tabContents.forEach(tab => {
            tab.classList.remove('active');
            tab.style.display = 'none';
        });
        
        // Mostrar la pestaña seleccionada
        this.tabContents[index].classList.add('active');
        this.tabContents[index].style.display = 'block';
        
        // Actualizar botones
        this.tabButtons.forEach((btn, i) => {
            if (i === index) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Actualizar índice actual
        this.currentTab = index;
        
        // Actualizar indicadores de progreso
        this.updateProgressSteps();
        
        console.log(`TabsManager: Pestaña ${index} mostrada correctamente`);
    }
    
    // Ir a la siguiente pestaña
    nextTab() {
        if (this.currentTab < this.tabContents.length - 1) {
            this.showTab(this.currentTab + 1);
        }
    }
    
    // Ir a la pestaña anterior
    prevTab() {
        if (this.currentTab > 0) {
            this.showTab(this.currentTab - 1);
        }
    }
    
    // Resetear pestañas al estado inicial
    resetTabs() {
        this.showTab(0);
    }
    
    // Actualizar indicadores de progreso
    updateProgressSteps() {
        this.progressSteps.forEach((step, index) => {
            if (index <= this.currentTab) {
                step.classList.add('completed');
            } else {
                step.classList.remove('completed');
            }
        });
    }
}

// Mantener una referencia a la instancia actual
TabsManager.currentInstance = null;

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // No inicializar automáticamente, dejar que el modal lo haga
});
