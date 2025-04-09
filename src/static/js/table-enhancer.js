/**
 * Script para mejorar la visualización de tablas
 * Añade funcionalidad de desplazamiento horizontal controlado
 * y mejora la estructura visual de las tablas
 */
class TableEnhancer {
    constructor() {
        this.enhancedTables = new Set(); // Para evitar procesar tablas más de una vez
    }

    init() {
        this.setupTables();
        
        // Configurar observadores de cambio de tamaño
        window.addEventListener('resize', () => {
            this.checkScrollIndicators();
            this.updateScrollHints();
        });
        
        // Configurar observador de mutaciones para detectar cambios en el DOM
        this.setupMutationObserver();
        
        console.log('TableEnhancer iniciado correctamente');
    }
    
    setupMutationObserver() {
        // Observador para detectar cuando se añaden o modifican tablas
        const observer = new MutationObserver((mutations) => {
            let shouldRefresh = false;
            
            mutations.forEach(mutation => {
                // Verificar si se han añadido nodos relevantes
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.querySelector && 
                           (node.querySelector('table') || 
                            node.querySelector('.table-container'))) {
                            shouldRefresh = true;
                        }
                    });
                }
            });
            
            if (shouldRefresh) {
                console.log("Cambios detectados en tablas, actualizando...");
                setTimeout(() => this.setupTables(), 100);
            }
        });
        
        // Observar todo el documento para tablas nuevas
        observer.observe(document.body, { 
            childList: true, 
            subtree: true,
            attributes: false,
            characterData: false
        });
    }

    setupTables() {
        const tables = document.querySelectorAll('table');
        
        tables.forEach(table => {
            // Evitar procesar la misma tabla múltiples veces
            if (this.enhancedTables.has(table)) return;
            this.enhancedTables.add(table);
            
            // Comprobar si la tabla ya está en un contenedor
            let container = table.closest('.table-container');
            let scrollContainer;
            
            if (!container) {
                // Crear nuevo contenedor si no existe
                container = document.createElement('div');
                container.className = 'table-container';
                
                // Envolver la tabla con el contenedor
                table.parentNode.insertBefore(container, table);
                container.appendChild(table);
            }
            
            // Comprobar si ya existe un contenedor de desplazamiento
            scrollContainer = container.querySelector('.table-scroll-container');
            
            if (!scrollContainer) {
                // Crear contenedor de desplazamiento
                scrollContainer = document.createElement('div');
                scrollContainer.className = 'table-scroll-container';
                
                // Mover la tabla al contenedor de desplazamiento
                container.appendChild(scrollContainer);
                scrollContainer.appendChild(table);
            }
            
            // Añadir indicadores de desplazamiento
            this.addScrollIndicators(container, scrollContainer);
            
            // Añadir pista visual de desplazamiento
            if (!container.dataset.scrollHint) {
                this.addScrollHint(container, scrollContainer);
            }
            
            // Mejorar celdas para mejor visualización
            this.enhanceTableCells(table);
        });
    }

    addScrollIndicators(container, scrollContainer) {
        // Crear indicadores de desplazamiento
        const scrollLeftBtn = document.createElement('div');
        scrollLeftBtn.className = 'scroll-indicator scroll-left';
        scrollLeftBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        
        const scrollRightBtn = document.createElement('div');
        scrollRightBtn.className = 'scroll-indicator scroll-right';
        scrollRightBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        
        // Añadir indicadores al contenedor
        container.appendChild(scrollLeftBtn);
        container.appendChild(scrollRightBtn);
        
        // Manejar eventos de desplazamiento
        scrollLeftBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: -200, behavior: 'smooth' });
        });
        
        scrollRightBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: 200, behavior: 'smooth' });
        });
        
        // Mostrar/ocultar indicadores según sea necesario
        scrollContainer.addEventListener('scroll', () => {
            this.updateScrollIndicators(scrollContainer, scrollLeftBtn, scrollRightBtn);
            this.checkScrollHint(container, scrollContainer);
        });
        
        // Comprobar inicialmente si hay desplazamiento
        setTimeout(() => {
            this.updateScrollIndicators(scrollContainer, scrollLeftBtn, scrollRightBtn);
            this.checkScrollHint(container, scrollContainer);
        }, 200);  // Aumentado a 200ms para dar más tiempo a la renderización
    }

    addScrollHint(container, scrollContainer) {
        // Crear pista visual de desplazamiento
        const scrollHint = document.createElement('div');
        scrollHint.className = 'table-scroll-hint';
        scrollHint.innerHTML = '<i class="fas fa-arrows-alt-h"></i> Desliza para ver más';
        container.appendChild(scrollHint);
        
        // Guardar referencia para usarla más tarde
        container.dataset.scrollHint = true;
        
        // Mostrar pista inicialmente y luego ocultarla
        setTimeout(() => {
            this.checkScrollHint(container, scrollContainer);
            // Auto ocultar después de 5 segundos
            setTimeout(() => {
                scrollHint.classList.remove('visible');
            }, 5000);
        }, 500);
    }

    checkScrollHint(container, scrollContainer) {
        const scrollHint = container.querySelector('.table-scroll-hint');
        if (!scrollHint) return;
        
        // Si hay overflow horizontal y no está al final, mostrar pista
        const hasHorizontalScroll = scrollContainer.scrollWidth > scrollContainer.clientWidth;
        const isScrolled = scrollContainer.scrollLeft > 10;
        
        if (hasHorizontalScroll && !isScrolled) {
            scrollHint.classList.add('visible');
        } else {
            scrollHint.classList.remove('visible');
        }
    }

    updateScrollHint() {
        document.querySelectorAll('.table-container[data-scroll-hint="true"]').forEach(container => {
            const scrollContainer = container.querySelector('.table-scroll-container');
            if (scrollContainer) {
                this.checkScrollHint(container, scrollContainer);
            }
        });
    }

    updateScrollIndicators(scrollContainer, leftBtn, rightBtn) {
        const hasHorizontalScroll = scrollContainer.scrollWidth > scrollContainer.clientWidth;
        const atStart = scrollContainer.scrollLeft <= 10;
        const atEnd = scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 10;
        
        // Actualizar clases según la posición
        if (!hasHorizontalScroll) {
            leftBtn.classList.remove('active');
            rightBtn.classList.remove('active');
            return;
        }
        
        if (atStart) {
            leftBtn.classList.remove('active');
        } else {
            leftBtn.classList.add('active');
        }
        
        if (atEnd) {
            rightBtn.classList.remove('active');
        } else {
            rightBtn.classList.add('active');
        }
    }

    checkScrollIndicators() {
        // Actualizar todos los indicadores cuando cambia el tamaño de la ventana
        const tableContainers = document.querySelectorAll('.table-container');
        
        tableContainers.forEach(container => {
            const scrollContainer = container.querySelector('.table-scroll-container');
            const leftBtn = container.querySelector('.scroll-left');
            const rightBtn = container.querySelector('.scroll-right');
            
            if (scrollContainer && leftBtn && rightBtn) {
                this.updateScrollIndicators(scrollContainer, leftBtn, rightBtn);
            }
        });
    }

    enhanceTableCells(table) {
        // Detectar tipo de tabla para aplicar mejoras específicas
        if (table.id === 'ventasTable') {
            this.enhanceVentasTable(table);
        } else {
            this.enhanceGenericTable(table);
        }
        
        // Garantizar visibilidad de botones en todas las celdas de acción
        setTimeout(() => {
            const actionCells = table.querySelectorAll('td.actions');
            actionCells.forEach(cell => {
                const buttons = cell.querySelectorAll('button');
                buttons.forEach(btn => {
                    // Aplicar estilos inline para mayor prioridad
                    btn.style.display = 'inline-flex';
                    btn.style.position = 'relative';
                    btn.style.zIndex = '10';
                    btn.style.opacity = '1';
                    btn.style.visibility = 'visible';
                    btn.style.pointerEvents = 'auto';
                });
            });
        }, 100);
    }
    
    enhanceVentasTable(table) {
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            // Mejorar la celda de empresa (índice 2) para mostrar tooltip si es larga
            const empresaCell = row.cells[2];
            if (empresaCell && empresaCell.textContent.length > 15) {
                empresaCell.classList.add('with-tooltip');
                empresaCell.setAttribute('data-tooltip', empresaCell.textContent);
            }
            
            // Mejorar la celda de conductor (índice 5)
            const conductorCell = row.cells[5];
            if (conductorCell && conductorCell.textContent.length > 15) {
                conductorCell.classList.add('with-tooltip');
                conductorCell.setAttribute('data-tooltip', conductorCell.textContent);
            }
            
            // Asegurar que la celda de acciones tenga la clase correcta
            if (row.cells.length > 7) {
                const actionsCell = row.cells[7];
                actionsCell.classList.add('actions');
            }
        });
    }
    
    enhanceGenericTable(table) {
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            // Procesar cada celda excepto la última (acciones)
            const cells = row.cells;
            const lastIndex = cells.length - 1;
            
            for (let i = 0; i < lastIndex; i++) {
                const cell = cells[i];
                // Si el contenido es largo, añadir tooltip
                if (cell.textContent.length > 20) {
                    cell.classList.add('with-tooltip');
                    cell.setAttribute('data-tooltip', cell.textContent);
                }
            }
            
            // La última celda suele contener acciones
            if (cells.length > 0) {
                const actionsCell = cells[lastIndex];
                if (actionsCell.querySelector('button')) {
                    actionsCell.classList.add('actions');
                }
            }
        });
    }
    
    updateScrollHints() {
        document.querySelectorAll('.table-container').forEach(container => {
            const scrollContainer = container.querySelector('.table-scroll-container');
            if (scrollContainer) {
                this.checkScrollHint(container, scrollContainer);
            }
        });
    }
}

// Inicializar TableEnhancer cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.tableEnhancer = new TableEnhancer();
    window.tableEnhancer.init();
});
