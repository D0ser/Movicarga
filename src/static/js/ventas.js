class VentasManager {
    constructor() {
        // Inicializar elementos clave
        this.ventasForm = document.getElementById('ventasForm');
        this.btnNuevaVenta = document.getElementById('btnNuevaVenta');
        this.ventasTable = document.querySelector('#ventasTable tbody') || document.getElementById('ventasTable');
        this.modalVentas = document.getElementById('ventaFormModal');
        this.ventaDetailModal = document.getElementById('ventaDetailModal');
        this.detallesContainer = document.querySelector('.venta-details');
        this.modalTitle = document.getElementById('modalTitle');
        
        // Elementos de filtro y paginación
        this.searchInput = document.getElementById('searchVentas');
        this.tipoFiltroFecha = document.getElementById('tipoFiltroFecha');
        this.fechaDesde = document.getElementById('fechaDesde');
        this.fechaHasta = document.getElementById('fechaHasta');
        this.mesFiltro = document.getElementById('mesFiltro');
        this.anioMesFiltro = document.getElementById('anioMesFiltro');
        this.anioFiltro = document.getElementById('anioFiltro');
        this.filtrarFechasBtn = document.getElementById('filtrarFechas');
        
        this.prevPageBtn = document.getElementById('prevPage');
        this.nextPageBtn = document.getElementById('nextPage');
        this.pageNumbersContainer = document.getElementById('pageNumbers');
        this.paginationInfo = document.getElementById('paginationInfo');
        
        // Inicializar configuración de paginación
        this.ventas = this.cargarVentasGuardadas() || [];
        this.ventasFiltradas = [...this.ventas];
        this.itemsPerPage = 10;
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.ventas.length / this.itemsPerPage);
        
        // Iniciar configuración solo si estamos en la página de ventas
        if (document.querySelector('.container h1')?.textContent.includes('Ventas')) {
            this.inicializar();
            // Asegurar que el botón de nueva venta funcione correctamente (inicialización directa)
            this.configurarBotonNuevaVenta();
        }
        
        // Verificar que el sistema de notificaciones esté disponible
        if (typeof NotificationManager === 'undefined') {
            console.error('NotificationManager no está definido. Asegúrate de que notifications.js está cargado antes de ventas.js');
            // Crear un reemplazo básico para evitar errores
            window.NotificationManager = {
                success: (msg) => { console.log('Éxito:', msg); alert('Éxito: ' + msg); },
                error: (msg) => { console.error('Error:', msg); alert('Error: ' + msg); },
                warning: (msg) => { console.warn('Advertencia:', msg); alert('Advertencia: ' + msg); },
                info: (msg) => { console.info('Info:', msg); alert('Info: ' + msg); }
            };
        }
    }
    
    // Método auxiliar para notificaciones locales
    showNotification(message, type) {
        console.log(`[${type.toUpperCase()}]: ${message}`);
        
        // Si existe SweetAlert2, usarlo
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
        
        // De lo contrario, mostrar una alerta básica
        alert(`${message}`);
    }
    
    getNotificationTitle(type) {
        switch(type) {
            case 'success': return '¡Éxito!';
            case 'error': return 'Error';
            case 'warning': return 'Advertencia';
            case 'info': return 'Información';
            default: return '';
        }
    }
    
    // Método mejorado para configurar el botón de nueva venta
    configurarBotonNuevaVenta() {
        const botonNuevaVenta = document.getElementById('btnNuevaVenta');
        if (botonNuevaVenta) {
            // Remover cualquier evento anterior clonando el botón
            const nuevoBoton = botonNuevaVenta.cloneNode(true);
            if (botonNuevaVenta.parentNode) {
                botonNuevaVenta.parentNode.replaceChild(nuevoBoton, botonNuevaVenta);
            }
            
            // Un solo manejador de eventos para evitar duplicidad
            nuevoBoton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Asegurarse de que el formulario esté limpio para una nueva venta
                if (this.ventasForm) {
                    this.ventasForm.reset();
                    this.ventasForm.removeAttribute('data-editing');
                }
                
                // Actualizar título del modal
                if (this.modalTitle) {
                    this.modalTitle.textContent = 'Nueva Venta';
                }
                
                // Establecer la fecha actual como predeterminada
                const fechaInput = document.getElementById('fecha');
                if (fechaInput) {
                    fechaInput.value = new Date().toISOString().split('T')[0];
                    // Recalcular fecha de vencimiento si hay días de crédito
                    this.calcularFechaVencimiento();
                }
                
                // Mostrar el modal
                this.mostrarModal(this.modalVentas);
            });
        }
    }

    setupEventListeners() {
        // Ya no manejamos el botón Nueva Venta aquí, se hace en configurarBotonNuevaVenta
        
        // Botón de venta de prueba
        const btnVentaPrueba = document.getElementById('btnVentaPrueba');
        if (btnVentaPrueba) {
            const newBtnPrueba = btnVentaPrueba.cloneNode(true);
            if (btnVentaPrueba.parentNode) {
                btnVentaPrueba.parentNode.replaceChild(newBtnPrueba, btnVentaPrueba);
            }
            
            newBtnPrueba.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.crearVentaPrueba();
            });
        }
        
        // Formulario de ventas
        if (this.ventasForm) {
            // Eliminar eventos anteriores para evitar duplicados
            const newForm = this.ventasForm.cloneNode(true);
            this.ventasForm.parentNode.replaceChild(newForm, this.ventasForm);
            this.ventasForm = newForm;
            
            // Agregar el evento submit
            this.ventasForm.addEventListener('submit', (e) => this.handleSubmit(e));
            
            // Manejar botón de reset
            const resetButtons = this.ventasForm.querySelectorAll('button[type="reset"]');
            resetButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.ventasForm.reset();
                    this.ventasForm.removeAttribute('data-editing');
                });
            });
            
            // Manejar botón de submit principal (fuera de las pestañas)
            const mainSubmitButton = this.ventasForm.querySelector('.form-actions button[type="submit"]');
            if (mainSubmitButton) {
                mainSubmitButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleSubmit(e);
                });
            }
            
            // Configurar el cálculo automático de fechas
            const fechaInput = document.getElementById('fecha');
            const diasCreditoInput = document.getElementById('diasCredito');
            if (fechaInput && diasCreditoInput) {
                fechaInput.addEventListener('change', () => this.calcularFechaVencimiento());
                diasCreditoInput.addEventListener('input', () => this.calcularFechaVencimiento());
            }
        }

        // Configurar eventos para los botones de la tabla
        if (this.ventasTable) {
            // Eliminar eventos anteriores para evitar duplicados (importante para el correcto funcionamiento)
            const newTable = this.ventasTable.cloneNode(true);
            if (this.ventasTable.parentNode) {
                this.ventasTable.parentNode.replaceChild(newTable, this.ventasTable);
                this.ventasTable = newTable;
            }
            
            // Agregar delegación de eventos para todas las acciones de la tabla
            this.ventasTable.addEventListener('click', (e) => {
                const target = e.target;
                const button = target.closest('button');
                if (!button) return;
                
                const row = target.closest('tr');
                if (!row || !row.dataset.id) return;
                
                const id = row.dataset.id;
                
                // Identificar qué botón se presionó y llamar a la función correspondiente
                if (button.classList.contains('ver-btn') || button.querySelector('.fa-eye')) {
                    this.verDetallesVenta(id);
                } 
                else if (button.classList.contains('editar-btn') || button.querySelector('.fa-edit')) {
                    this.editarVenta(id);
                } 
                else if (button.classList.contains('eliminar-btn') || button.querySelector('.fa-trash')) {
                    // Aseguramos que el botón de eliminar llame al método correcto
                    e.stopPropagation(); // Evitar propagación del evento
                    this.eliminarVenta(id);
                }
            });
        }

        // Configurar eventos de búsqueda
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.filtrarVentas());
        }
        
        // Configurar eventos de filtro de fecha
        if (this.tipoFiltroFecha) {
            this.tipoFiltroFecha.addEventListener('change', () => {
                const tipo = this.tipoFiltroFecha.value;
                this.cambiarTipoFiltroFecha(tipo);
            });
        }
        
        if (this.filtrarFechasBtn) {
            this.filtrarFechasBtn.addEventListener('click', () => this.aplicarFiltroFechas());
        }

        // Configurar eventos del modal
        this.setupModalEvents();
        
        // Configurar eventos para pestañas y paginación
        this.setupTabsEvents();
        this.setupPaginationEvents();
    }

    setupTabsEvents() {
        console.log("Configurando eventos de pestañas simplificado");
        
        // Eliminar instancia previa si existe
        if (window.tabsManager && typeof window.tabsManager.destroy === 'function') {
            window.tabsManager.destroy();
        }
        
        try {
            // Crear nueva instancia de TabsManager
            window.tabsManager = new TabsManager('#ventasTabsContainer');
            
            // Configurar eventos para las pestañas manualmente
            const tabButtons = document.querySelectorAll('#ventasTabsContainer .tab-button');
            tabButtons.forEach((button, index) => {
                // Remover eventos antiguos
                const newButton = button.cloneNode(true);
                if (button.parentNode) {
                    button.parentNode.replaceChild(newButton, button);
                }
                
                // Agregar evento click con efectos visuales
                newButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`Tab button ${index} clicked`);
                    
                    // Efecto visual inmediato
                    this.cambiarTabManualmente(index);
                });
            });
            
            // Configurar botones anterior y siguiente para que actualicen todos los elementos
            const prevButtons = document.querySelectorAll('.btn-prev-tab');
            const nextButtons = document.querySelectorAll('.btn-next-tab');
            
            prevButtons.forEach(button => {
                const newButton = button.cloneNode(true);
                if (button.parentNode) {
                    button.parentNode.replaceChild(newButton, button);
                }
                
                newButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Obtener el índice de pestaña actual
                    const currentTabContent = document.querySelector('#ventasTabsContainer .tab-content.active');
                    const allTabContents = Array.from(document.querySelectorAll('#ventasTabsContainer .tab-content'));
                    const currentIndex = allTabContents.indexOf(currentTabContent);
                    
                    if (currentIndex > 0) {
                        this.cambiarTabManualmente(currentIndex - 1);
                    }
                });
            });
            
            nextButtons.forEach(button => {
                const newButton = button.cloneNode(true);
                if (button.parentNode) {
                    button.parentNode.replaceChild(newButton, button);
                }
                
                newButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Obtener el índice de pestaña actual
                    const currentTabContent = document.querySelector('#ventasTabsContainer .tab-content.active');
                    const allTabContents = Array.from(document.querySelectorAll('#ventasTabsContainer .tab-content'));
                    const currentIndex = allTabContents.indexOf(currentTabContent);
                    
                    if (currentIndex < allTabContents.length - 1) {
                        this.cambiarTabManualmente(currentIndex + 1);
                    }
                });
            });
            
            // Aplicar estilos visuales directamente
            this.aplicarEstilosVisualesDirectos();
        } catch (error) {
            console.error("Error al inicializar TabsManager:", error);
        }
    }

    // Ya no necesitamos estos métodos, eliminarlos o dejarlos vacíos
    configurarTabsClicks() {
        // Ahora manejado por TabsManager
    }

    reemplazarProgressStepsConBotones() {
        // Ahora manejado por TabsManager
    }

    configurarBotonesNavegacion() {
        // Ahora manejado por TabsManager
    }

    // Método auxiliar para cambiar a una pestaña específica
    cambiarATab(index) {
        console.log(`Cambiando a pestaña ${index}`);
        if (window.tabsManager) {
            window.tabsManager.showTab(index);
            
            // Actualizar el título móvil para reflejar la pestaña actual
            const mobileTitle = document.querySelector('.mobile-tab-title');
            const activeButton = document.querySelector('#ventasTabsContainer .tab-button.active');
            if (mobileTitle && activeButton) {
                mobileTitle.textContent = activeButton.textContent.trim();
            }
            
            // Agregar feedback visual directo para los progress steps
            const progressSteps = document.querySelectorAll('#ventasTabsContainer .progress-step');
            progressSteps.forEach((step, i) => {
                if (i <= index) {
                    step.classList.add('completed');
                    step.style.backgroundColor = 'var(--primary-color, #1a237e)';
                    step.style.color = 'white';
                    step.style.boxShadow = '0 2px 10px rgba(26, 35, 126, 0.3)';
                } else {
                    step.classList.remove('completed');
                    step.style.backgroundColor = '#e0e0e0';
                    step.style.color = '#333';
                    step.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
                }
            });
        } else {
            this.cambiarTabManualmente(index);
        }
    }

    // Método de respaldo para cambios de pestaña si TabsManager falla
    cambiarTabManualmente(index) {
        console.log(`Cambiando manualmente a pestaña ${index}`);
        
        // 1. Ocultar todas las pestañas
        const tabs = document.querySelectorAll('#ventasTabsContainer .tab-content');
        tabs.forEach(tab => {
            tab.style.display = 'none';
            tab.classList.remove('active');
        });
        
        // 2. Mostrar la pestaña seleccionada
        if (tabs[index]) {
            tabs[index].style.display = 'block';
            tabs[index].classList.add('active');
        }
        
        // 3. Actualizar botones de pestañas con estilos directos
        const buttons = document.querySelectorAll('#ventasTabsContainer .tab-button');
        buttons.forEach((btn, i) => {
            if (i === index) {
                btn.classList.add('active');
                btn.style.backgroundColor = 'white';
                btn.style.color = 'var(--primary-color, #1a237e)';
                btn.style.fontWeight = 'bold';
                btn.style.borderBottom = '2px solid var(--primary-color, #1a237e)';
            } else {
                btn.classList.remove('active');
                btn.style.backgroundColor = '#f5f5f5';
                btn.style.color = '#555';
                btn.style.fontWeight = 'normal';
                btn.style.borderBottom = '1px solid #e0e0e0';
            }
        });
        
        // 4. Actualizar indicadores de progreso con estilos visuales directos
        const indicators = document.querySelectorAll('#ventasTabsContainer .progress-step');
        indicators.forEach((indicator, i) => {
            if (i <= index) {
                indicator.classList.add('completed');
                indicator.style.backgroundColor = 'var(--primary-color, #1a237e)';
                indicator.style.color = 'white';
                indicator.style.boxShadow = '0 2px 10px rgba(26, 35, 126, 0.3)';
            } else {
                indicator.classList.remove('completed');
                indicator.style.backgroundColor = '#e0e0e0';
                indicator.style.color = '#333';
                indicator.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
            }
        });
        
        // Actualizar el título móvil para reflejar la pestaña actual
        const mobileTitle = document.querySelector('.mobile-tab-title');
        const activeButton = document.querySelector('#ventasTabsContainer .tab-button.active');
        if (mobileTitle && activeButton) {
            mobileTitle.textContent = activeButton.textContent.trim();
        }
    }

    setupModalEvents() {
        // Cerrar modal con X o haciendo clic fuera
        document.querySelectorAll('.close-modal').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.cerrarModales());
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.cerrarModales();
            }
        });
    }

    // Método mejorado para cerrar modales
    cerrarModales() {
        const modales = document.querySelectorAll('.modal');
        modales.forEach(modal => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
        
        document.body.style.overflow = 'auto';
        
        // Resetear estado de las pestañas si existe el gestor
        if (window.tabsManager) {
            setTimeout(() => {
                window.tabsManager.resetTabs();
            }, 300);
        }
    }

    abrirModalNuevaVenta() {
        if (!this.ventasForm || !this.modalVentas) {
            console.error("No se encontraron los elementos del formulario o modal");
            return;
        }
        
        // Resetear el formulario y eliminar cualquier ID de edición
        this.ventasForm.reset();
        this.ventasForm.removeAttribute('data-editing');
        
        // Actualizar el título del modal
        if (this.modalTitle) {
            this.modalTitle.textContent = 'Nueva Venta';
        }
        
        // Establecer la fecha actual
        const fechaInput = document.getElementById('fecha');
        if (fechaInput) {
            const today = new Date().toISOString().split('T')[0];
            fechaInput.value = today;
        }
        
        // Mostrar el modal
        this.mostrarModal(this.modalVentas);
    }
    
    editarVenta(id) {
        // Buscar la venta por ID
        const venta = this.ventas.find(v => v.id === id);
        if (!venta || !this.ventasForm || !this.modalVentas) {
            console.error("No se encontró la venta o elementos del formulario");
            return;
        }
        
        // Resetear el formulario primero
        this.ventasForm.reset();
        
        // Marcar como modo edición
        this.ventasForm.setAttribute('data-editing', id);
        
        // Actualizar el título del modal
        if (this.modalTitle) {
            this.modalTitle.textContent = 'Editar Venta';
        }
        
        // Llenar el formulario con los datos de la venta
        document.getElementById('fecha').value = venta.fecha || '';
        document.getElementById('serieFactura').value = venta.serieFactura || '';
        document.getElementById('numeroFactura').value = venta.numeroFactura || '';
        document.getElementById('documento').value = venta.documento || '';
        document.getElementById('guiaRemitente').value = venta.guiaRemitente || '';
        document.getElementById('guiaTransportista').value = venta.guiaTransportista || '';
        document.getElementById('montoFlete').value = venta.montoFlete || 0;
        document.getElementById('detraccion').value = venta.detraccion || 0;
        document.getElementById('totalDeber').value = venta.totalDeber || 0;
        document.getElementById('totalMonto').value = venta.totalMonto || 0;
        document.getElementById('empresa').value = venta.empresa || '';
        document.getElementById('ruc').value = venta.ruc || '';
        document.getElementById('diasCredito').value = venta.diasCredito || 0;
        document.getElementById('fechaVencimiento').value = venta.fechaVencimiento || '';
        document.getElementById('observacion').value = venta.observacion || '';
        document.getElementById('estado').value = venta.estado || 'pendiente';
        
        // Seleccionar conductor y placas
        const conductorSelect = document.getElementById('conductor');
        if (conductorSelect && venta.conductor && venta.conductor.id) {
            conductorSelect.value = venta.conductor.id;
        }
        
        const placaTractoSelect = document.getElementById('placaTracto');
        if (placaTractoSelect && venta.placaTracto && venta.placaTracto.id) {
            placaTractoSelect.value = venta.placaTracto.id;
        }
        
        const placaCarretaSelect = document.getElementById('placaCarreta');
        if (placaCarretaSelect && venta.placaCarreta && venta.placaCarreta.id) {
            placaCarretaSelect.value = venta.placaCarreta.id;
        }
        
        // Mostrar el modal
        this.mostrarModal(this.modalVentas);
        
        // Inicializar el gestor de pestañas después de que el modal esté visible
        setTimeout(() => {
            if (window.TabsManager) {
                window.tabsManager = new TabsManager('#ventasTabsContainer');
                // No necesitamos resetear las pestañas para mantener los datos
                this.asegurarEventosNavegacionPestanas();
            }
            
            // Configurar los cálculos automáticos
            this.setupCalculosAutomaticos();
        }, 100);
    }

    async inicializar() {
        try {
            this.cargarVentasGuardadas();
            await this.cargarConductores();
            await this.cargarPlacas();
            this.setupEventListeners();
            this.setupCalculosAutomaticos();
            this.renderizarTablaVentas();
            
            // Optimizar formulario en dispositivos móviles
            this.optimizarCamposFormulario();
            
            console.log('VentasManager inicializado correctamente');
        } catch (error) {
            console.error('Error al inicializar VentasManager:', error);
            NotificationManager.error('Error al cargar el sistema de ventas');
        }
    }
    
    // Método para inicializar los años para los filtros
    inicializarAniosFiltros() {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 5;
        const endYear = currentYear + 1;
        
        // Filtro de año-mes
        if (this.anioMesFiltro) {
            this.anioMesFiltro.innerHTML = '';
            for (let year = endYear; year >= startYear; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                if (year === currentYear) option.selected = true;
                this.anioMesFiltro.appendChild(option);
            }
        }
        
        // Filtro de año
        if (this.anioFiltro) {
            this.anioFiltro.innerHTML = '';
            for (let year = endYear; year >= startYear; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                if (year === currentYear) option.selected = true;
                this.anioFiltro.appendChild(option);
            }
        }
    }
    
    // Método para asegurar que todos los modales estén ocultos al inicio
    hideAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
            modal.classList.remove('show');
        });
    }
    
    // Método para cambiar el tipo de filtro de fecha
    cambiarTipoFiltroFecha(tipo) {
        document.getElementById('filtroFecha').style.display = tipo === 'fecha' ? 'block' : 'none';
        document.getElementById('filtroMes').style.display = tipo === 'mes' ? 'block' : 'none';
        document.getElementById('filtroAnio').style.display = tipo === 'anio' ? 'block' : 'none';
    }
    
    // Método para aplicar los filtros de fechas según el tipo seleccionado
    aplicarFiltroFechas() {
        const tipoFiltro = this.tipoFiltroFecha.value;
        
        // Resetear paginación al aplicar filtros
        this.currentPage = 1;
        
        switch (tipoFiltro) {
            case 'fecha':
                const desde = this.fechaDesde.value;
                const hasta = this.fechaHasta.value;
                
                if (!desde || !hasta) {
                    NotificationManager.warning('Debe ingresar ambas fechas para filtrar');
                    return;
                }
                
                this.ventasFiltradas = this.ventas.filter(venta => {
                    return venta.fecha >= desde && venta.fecha <= hasta;
                });
                break;
                
            case 'mes':
                const mes = this.mesFiltro.value;
                const anioMes = this.anioMesFiltro.value;
                
                if (!mes || !anioMes) {
                    NotificationManager.warning('Debe seleccionar mes y año');
                    return;
                }
                
                this.ventasFiltradas = this.ventas.filter(venta => {
                    const ventaFecha = new Date(venta.fecha);
                    return ventaFecha.getMonth() + 1 == parseInt(mes) && 
                           ventaFecha.getFullYear() == parseInt(anioMes);
                });
                break;
                
            case 'anio':
                const anio = this.anioFiltro.value;
                
                if (!anio) {
                    NotificationManager.warning('Debe seleccionar un año');
                    return;
                }
                
                this.ventasFiltradas = this.ventas.filter(venta => {
                    const ventaFecha = new Date(venta.fecha);
                    return ventaFecha.getFullYear() == parseInt(anio);
                });
                break;
        }
        
        this.renderizarVentasFiltradas();
    }
    
    crearVentaPrueba() {
        // Crear una venta de ejemplo con datos predefinidos
        const fechaHoy = new Date();
        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 30); // 30 días de crédito
        
        // Formatear fechas para el formato YYYY-MM-DD
        const formatearFecha = (fecha) => {
            return fecha.toISOString().split('T')[0];
        };
        
        const ventaPrueba = {
            id: 'prueba-' + Date.now().toString(),
            fecha: formatearFecha(fechaHoy),
            serieFactura: 'F001',
            numeroFactura: Math.floor(10000 + Math.random() * 90000).toString(), // Número aleatorio de 5 dígitos
            montoFlete: 2500.00,
            detraccion: 100.00,
            totalDeber: 2400.00,
            totalMonto: 2950.00,
            empresa: 'Transportes Rápidos S.A.',
            ruc: '20123456789',
            conductor: {
                id: '1',
                nombre: 'Juan Pérez'
            },
            placaTracto: {
                id: '1',
                placa: 'ABC-123'
            },
            placaCarreta: {
                id: '2',
                placa: 'UVW-654'
            },
            observacion: 'Venta de prueba creada automáticamente para demostración.',
            documento: 'DOC-' + Math.floor(1000 + Math.random() * 9000).toString(),
            guiaRemitente: 'GR-' + Math.floor(10000 + Math.random() * 90000).toString(),
            guiaTransportista: 'GT-' + Math.floor(10000 + Math.random() * 90000).toString(),
            diasCredito: 30,
            fechaVencimiento: formatearFecha(fechaVencimiento),
            estado: 'pendiente'
        };
        
        // Guardar la venta y actualizar la tabla
        this.ventas.push(ventaPrueba);
        this.guardarVentas();
        this.ventasFiltradas = [...this.ventas]; // Actualizar la lista de ventas filtradas
        this.renderizarTablaVentas();
        
        // Mostrar notificación
        NotificationManager.success('Venta de prueba añadida correctamente');
    }
    
    setupPaginationEvents() {
        // Paginación
        const prevPageBtn = document.getElementById('prevPage');
        const nextPageBtn = document.getElementById('nextPage');
        
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.cambiarPagina(this.currentPage - 1);
                }
            });
        }
        
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                if (this.currentPage < this.totalPages) {
                    this.cambiarPagina(this.currentPage + 1);
                }
            });
        }
    }

    // Método mejorado para mostrar modales de forma consistente
    mostrarModal(modal) {
        if (!modal) return;
        
        // Cerrar cualquier modal abierto primero para evitar conflictos
        this.cerrarModales();
        
        // Mostrar el modal
        setTimeout(() => {
            document.body.style.overflow = 'hidden';
            modal.style.display = 'flex';
            modal.style.opacity = '0';
            
            // Forzar reflow para que la animación funcione
            void modal.offsetWidth;
            
            // Añadir clase para mostrar con animación
            modal.classList.add('show');
            modal.style.opacity = '1';
            
            // Resetear posición de scroll del contenido del modal
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.scrollTop = 0;
            }
            
            // Inicializar TabsManager si estamos en el modal de formulario
            if (modal.id === 'ventaFormModal') {
                setTimeout(() => {
                    try {
                        this.setupTabsEvents();
                        this.setupCalculosAutomaticos();
                        
                        // Aplicar estilos directamente para mayor consistencia visual
                        this.aplicarEstilosVisualesDirectos();
                    } catch (error) {
                        console.error("Error al inicializar componentes del modal:", error);
                    }
                }, 200); // Aumentado a 200ms para dar más tiempo
            }
            
            this.optimizarCamposFormulario();
        }, 100);
    }

    // Nuevo método para aplicar estilos visuales directamente
    aplicarEstilosVisualesDirectos() {
        console.log("Aplicando estilos visuales directos");
        
        // 1. Estilizar botones de pestañas
        const tabButtons = document.querySelectorAll('#ventasTabsContainer .tab-button');
        const activeTab = tabButtons[0]; // Primera pestaña por defecto
        
        tabButtons.forEach(btn => {
            // Resetear estilos
            btn.style.backgroundColor = '#f5f5f5';
            btn.style.color = '#555';
            btn.style.fontWeight = 'normal';
            btn.style.borderBottom = '1px solid #e0e0e0';
        });
        
        // Activar la primera pestaña
        if (activeTab) {
            activeTab.style.backgroundColor = 'white';
            activeTab.style.color = 'var(--primary-color, #1a237e)';
            activeTab.style.fontWeight = 'bold';
            activeTab.style.borderBottom = '2px solid var(--primary-color, #1a237e)';
            activeTab.classList.add('active');
        }
        
        // 2. Estilizar progress steps
        const progressSteps = document.querySelectorAll('#ventasTabsContainer .progress-step');
        progressSteps.forEach((step, index) => {
            // Resetear estilos
            step.style.backgroundColor = '#e0e0e0';
            step.style.color = '#333';
            step.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
            
            // Marcar el primer paso como completado
            if (index === 0) {
                step.style.backgroundColor = 'var(--primary-color, #1a237e)';
                step.style.color = 'white';
                step.style.boxShadow = '0 2px 10px rgba(26, 35, 126, 0.3)';
                step.classList.add('completed');
            }
            
            // Agregar efectos interactivos
            step.style.cursor = 'pointer';
            
            // Eliminar y volver a añadir evento click para prevenir duplicados
            const newStep = step.cloneNode(true);
            step.parentNode.replaceChild(newStep, step);
            
            newStep.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Progress step ${index} clicked`);
                
                // Efecto visual directo
                newStep.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    newStep.style.transform = 'scale(1)';
                }, 100);
                
                // Cambiar a esa pestaña
                this.cambiarATab(index);
            });
        });
        
        // 3. Mostrar visualmente el contenido de la primera pestaña
        const tabContents = document.querySelectorAll('#ventasTabsContainer .tab-content');
        tabContents.forEach((tab, index) => {
            if (index === 0) {
                tab.style.display = 'block';
                tab.classList.add('active');
            } else {
                tab.style.display = 'none';
                tab.classList.remove('active');
            }
        });
    }
    
    // Nuevo método para asegurar que todos los campos son visibles
    optimizarCamposFormulario() {
        // Comprobar si estamos en móvil
        if (window.innerWidth <= 768) {
            // Ajustar el formulario para que todos los campos sean visibles
            const formSections = document.querySelectorAll('.form-section');
            formSections.forEach(section => {
                section.style.width = '100%';
                section.style.padding = '15px';
                section.style.boxSizing = 'border-box';
            });
            
            // Ajustar los grids a una columna
            const formGrids = document.querySelectorAll('.form-grid');
            formGrids.forEach(grid => {
                grid.style.gridTemplateColumns = '1fr';
                grid.style.width = '100%';
            });
            
            // Asegurar ancho completo para inputs
            const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
            formInputs.forEach(input => {
                input.style.width = '100%';
                input.style.boxSizing = 'border-box';
            });
        }
    }
    
    asegurarEventosNavegacionPestanas() {
        // Este método ahora se deja vacío, ya que la navegación se maneja en setupTabsEvents
        // Este cambio evita la duplicación de eventos que estaba ocurriendo
        console.log("Usando setupTabsEvents para manejar la navegación de pestañas");
    }
    
    calcularFechaVencimiento() {
        const fechaInput = document.getElementById('fecha');
        const diasCreditoInput = document.getElementById('diasCredito');
        const fechaVencimientoInput = document.getElementById('fechaVencimiento');
        
        if (fechaInput && fechaInput.value && diasCreditoInput && fechaVencimientoInput) {
            const fecha = new Date(fechaInput.value);
            const diasCredito = parseInt(diasCreditoInput.value) || 0;
            
            if (!isNaN(fecha.getTime())) {
                fecha.setDate(fecha.getDate() + diasCredito);
                fechaVencimientoInput.value = fecha.toISOString().split('T')[0];
            }
        }
    }

    async cargarConductores() {
        try {
            const conductores = [
                { id: 1, nombre: 'Juan Pérez' },
                { id: 2, nombre: 'Carlos López' },
                { id: 3, nombre: 'María González' }
            ];
            
            const conductorSelect = document.getElementById('conductor');
            if (conductorSelect) {
                conductores.forEach(conductor => {
                    const option = document.createElement('option');
                    option.value = conductor.id;
                    option.textContent = conductor.nombre;
                    conductorSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar conductores:', error);
            NotificationManager.error('Error al cargar la lista de conductores');
        }
    }

    async cargarPlacas() {
        try {
            const tractos = [
                { id: 1, placa: 'ABC-123' },
                { id: 2, placa: 'DEF-456' },
                { id: 3, placa: 'GHI-789' }
            ];
            
            const carretas = [
                { id: 1, placa: 'XYZ-987' },
                { id: 2, placa: 'UVW-654' },
                { id: 3, placa: 'RST-321' }
            ];
            
            const placaTractoSelect = document.getElementById('placaTracto');
            const placaCarretaSelect = document.getElementById('placaCarreta');
            
            if (placaTractoSelect) {
                tractos.forEach(tracto => {
                    const option = document.createElement('option');
                    option.value = tracto.id;
                    option.textContent = tracto.placa;
                    placaTractoSelect.appendChild(option);
                });
            }
            
            if (placaCarretaSelect) {
                carretas.forEach(carreta => {
                    const option = document.createElement('option');
                    option.value = carreta.id;
                    option.textContent = carreta.placa;
                    placaCarretaSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar placas:', error);
            NotificationManager.error('Error al cargar la lista de placas');
        }
    }

    cargarVentasGuardadas() {
        const ventasGuardadas = localStorage.getItem('ventas');
        return ventasGuardadas ? JSON.parse(ventasGuardadas) : [];
    }
    
    guardarVentas() {
        localStorage.setItem('ventas', JSON.stringify(this.ventas));
    }

    handleSubmit(e) {
        e.preventDefault();
        
        try {
            // Validar campos obligatorios antes de procesar
            if (!this.validarCamposObligatorios()) {
                return;
            }
            
            // Recopilar datos del formulario
            const formData = this.recopilarDatosFormulario();
            
            // Actualizar o crear nueva venta
            if (formData.id) {
                const index = this.ventas.findIndex(v => v.id === formData.id);
                if (index !== -1) {
                    this.ventas[index] = formData;
                    
                    // Usar SweetAlert2 para mostrar mensaje de éxito
                    Swal.fire({
                        title: '¡Éxito!',
                        text: 'Venta actualizada correctamente',
                        icon: 'success',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                }
            } else {
                formData.id = Date.now().toString();
                this.ventas.push(formData);
                
                // Usar SweetAlert2 para mostrar mensaje de éxito
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'Venta registrada correctamente',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
            
            // Guardar, renderizar y limpiar
            this.guardarVentas();
            this.renderizarTablaVentas();
            this.ventasForm.reset();
            this.ventasForm.removeAttribute('data-editing');
            this.cerrarModales();
        } catch (error) {
            console.error('Error al procesar el formulario:', error);
            
            // Usar SweetAlert2 para mostrar mensaje de error
            Swal.fire({
                title: 'Error',
                text: 'Error al procesar el formulario: ' + error.message,
                icon: 'error',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 4000
            });
        }
    }
    
    // Método para validar campos obligatorios
    validarCamposObligatorios() {
        // Validar campos prioritarios (se pueden agregar más según las necesidades)
        const fecha = document.getElementById('fecha').value;
        const montoFlete = document.getElementById('montoFlete').value;
        const empresa = document.getElementById('empresa').value;
        const conductor = document.getElementById('conductor').value;
        
        // Verificar que los campos obligatorios tengan valores
        if (!fecha) {
            Swal.fire({
                title: 'Validación',
                text: 'Debe ingresar la fecha',
                icon: 'warning',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return false;
        }
        
        if (!montoFlete) {
            Swal.fire({
                title: 'Validación',
                text: 'Debe ingresar el monto del flete',
                icon: 'warning',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return false;
        }
        
        if (!empresa) {
            Swal.fire({
                title: 'Validación',
                text: 'Debe ingresar la empresa',
                icon: 'warning',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return false;
        }
        
        if (!conductor) {
            Swal.fire({
                title: 'Validación',
                text: 'Debe seleccionar un conductor',
                icon: 'warning',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return false;
        }
        
        return true;
    }
    
    recopilarDatosFormulario() {
        const conductorElement = document.getElementById('conductor');
        const placaTractoElement = document.getElementById('placaTracto');
        const placaCarretaElement = document.getElementById('placaCarreta');

        // Verificar que los elementos existan antes de acceder a sus propiedades
        if (!conductorElement || !placaTractoElement || !placaCarretaElement) {
            throw new Error("Faltan elementos obligatorios en el formulario");
        }

        const conductorText = conductorElement.options[conductorElement.selectedIndex]?.text || 'No especificado';
        const placaTractoText = placaTractoElement.options[placaTractoElement.selectedIndex]?.text || 'No especificado';
        const placaCarretaText = placaCarretaElement.options[placaCarretaElement.selectedIndex]?.text || 'N/A';

        const formData = {
            id: this.ventasForm.getAttribute('data-editing'),
            fecha: document.getElementById('fecha').value || new Date().toISOString().split('T')[0],
            serieFactura: document.getElementById('serieFactura').value || 'S/N',
            numeroFactura: document.getElementById('numeroFactura').value || 'S/N',
            montoFlete: parseFloat(document.getElementById('montoFlete').value) || 0,
            detraccion: parseFloat(document.getElementById('detraccion').value) || 0,
            totalDeber: parseFloat(document.getElementById('totalDeber').value) || 0,
            totalMonto: parseFloat(document.getElementById('totalMonto').value) || 0,
            empresa: document.getElementById('empresa').value || 'Cliente general',
            ruc: document.getElementById('ruc').value || '00000000000',
            conductor: {
                id: conductorElement.value || '0',
                nombre: conductorText
            },
            placaTracto: {
                id: placaTractoElement.value || '0',
                placa: placaTractoText
            },
            placaCarreta: {
                id: placaCarretaElement.value || '0',
                placa: placaCarretaText
            },
            observacion: document.getElementById('observacion').value || '',
            documento: document.getElementById('documento').value || '',
            guiaRemitente: document.getElementById('guiaRemitente').value || '',
            guiaTransportista: document.getElementById('guiaTransportista').value || '',
            diasCredito: parseInt(document.getElementById('diasCredito').value) || 0,
            fechaVencimiento: document.getElementById('fechaVencimiento').value || '',
            estado: document.getElementById('estado').value || 'pendiente'
        };
        
        return formData;
    }

    renderizarTablaVentas() {
        this.ventasTable.innerHTML = '';
        
        if (this.ventas.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="8" class="empty-table">No hay ventas registradas</td>';
            this.ventasTable.appendChild(row);
            this.actualizarInfoPaginacion(0, 0, 0);
            return;
        }
            
        // Actualizar las ventas filtradas con todas las ventas
        this.ventasFiltradas = [...this.ventas];
        
        // Calcular la paginación
        this.totalPages = Math.ceil(this.ventasFiltradas.length / this.itemsPerPage);
        
        // Asegurar que la página actual es válida
        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
        }
        
        // Calcular índices de inicio y fin para la paginación
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.ventasFiltradas.length);
        
        // Obtener solo las ventas para la página actual
        const ventasPaginadas = this.ventasFiltradas.slice(startIndex, endIndex);
        
        // Renderizar las ventas de la página actual
        ventasPaginadas.forEach(venta => {
            const row = document.createElement('tr');
            row.dataset.id = venta.id;
            
            const estadoClass = this.getEstadoClass(venta.estado);
            
            row.innerHTML = `
                <td>${this.formatDate(venta.fecha)}</td>
                <td>${venta.serieFactura || '-'}-${venta.numeroFactura || '-'}</td>
                <td>${venta.empresa || 'Cliente general'}</td>
                <td>S/ ${venta.montoFlete.toFixed(2)}</td>
                <td>S/ ${venta.totalMonto.toFixed(2)}</td>
                <td>${venta.conductor.nombre || 'No asignado'}</td>
                <td><span class="estado-badge ${estadoClass}">${this.capitalizar(venta.estado || 'pendiente')}</span></td>
                <td class="actions">
                    <button class="ver-btn" title="Ver detalles"><i class="fas fa-eye"></i></button>
                    <button class="editar-btn" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="eliminar-btn" title="Eliminar"><i class="fas fa-trash"></i></button>
                </td>
            `;
            this.ventasTable.appendChild(row);
        });

        // Actualizar la información de paginación
        this.actualizarInfoPaginacion(startIndex + 1, endIndex, this.ventasFiltradas.length);
        
        // Actualizar los controles de paginación
        this.actualizarControlesPaginacion();
        
        // Después de renderizar la tabla, inicializar el mejorador de tablas y asegurar que los botones sean visibles
        if (window.TableEnhancer) {
            setTimeout(() => {
                new TableEnhancer().enhanceTableCells(this.ventasTable);
                this.asegurarBotonesAccionesVisibles();
            }, 100);
        } else {
            this.asegurarBotonesAccionesVisibles();
        }
    }

    asegurarBotonesAccionesVisibles() {
        // Asegurar que los botones de acción sean visibles y tengan el estilo correcto
        document.querySelectorAll('td.actions').forEach(td => {
            const botones = td.querySelectorAll('button');
            botones.forEach(btn => {
                // Asegurar que el botón sea visible
                btn.style.display = 'inline-flex';
                
                // Asignar colores según el tipo de botón
                if (btn.classList.contains('ver-btn')) {
                    btn.style.backgroundColor = 'rgba(26, 35, 126, 0.1)';
                    btn.style.color = 'var(--primary-color)';
                } else if (btn.classList.contains('editar-btn')) {
                    btn.style.backgroundColor = 'rgba(255, 152, 0.1)';
                    btn.style.color = 'var(--warning-color, #ff9800)';
                } else if (btn.classList.contains('eliminar-btn')) {
                    btn.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
                    btn.style.color = 'var(--danger-color, #f44336)';
                }
            });
        });
    }

    renderizarVentasFiltradas() {
        this.ventasTable.innerHTML = '';
        
        if (this.ventasFiltradas.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="8" class="empty-table">No se encontraron ventas que coincidan con la búsqueda</td>';
            this.ventasTable.appendChild(row);
            this.actualizarInfoPaginacion(0, 0, 0);
            return;
        }
        
        // Calcular la paginación
        this.totalPages = Math.ceil(this.ventasFiltradas.length / this.itemsPerPage);
        
        // Asegurar que la página actual es válida
        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
        }
        
        // Calcular índices de inicio y fin para la paginación
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.ventasFiltradas.length);
        
        // Obtener solo las ventas para la página actual
        const ventasPaginadas = this.ventasFiltradas.slice(startIndex, endIndex);
        
        // Renderizar las ventas de la página actual
        ventasPaginadas.forEach(venta => {
            const row = document.createElement('tr');
            row.dataset.id = venta.id;
            
            const estadoClass = this.getEstadoClass(venta.estado);
            
            row.innerHTML = `
                <td>${this.formatDate(venta.fecha)}</td>
                <td>${venta.serieFactura || '-'}-${venta.numeroFactura || '-'}</td>
                <td>${venta.empresa || 'Cliente general'}</td>
                <td>S/ ${venta.montoFlete.toFixed(2)}</td>
                <td>S/ ${venta.totalMonto.toFixed(2)}</td>
                <td>${venta.conductor.nombre || 'No asignado'}</td>
                <td><span class="estado-badge ${estadoClass}">${this.capitalizar(venta.estado || 'pendiente')}</span></td>
                <td class="actions">
                    <button class="ver-btn" title="Ver detalles"><i class="fas fa-eye"></i></button>
                    <button class="editar-btn" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="eliminar-btn" title="Eliminar"><i class="fas fa-trash"></i></button>
                </td>
            `;
            this.ventasTable.appendChild(row);
        });
        
        // Actualizar la información de paginación
        this.actualizarInfoPaginacion(startIndex + 1, endIndex, this.ventasFiltradas.length);
        
        // Actualizar los controles de paginación
        this.actualizarControlesPaginacion();
        
        // Después de renderizar la tabla filtrada, reiniciar el mejorador de tablas
        if (window.TableEnhancer) {
            setTimeout(() => {
                new TableEnhancer().enhanceTableCells(this.ventasTable);
                this.asegurarBotonesAccionesVisibles();
            }, 100);
        } else {
            this.asegurarBotonesAccionesVisibles();
        }
    }
    
    filtrarVentas() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const searchField = document.getElementById('searchField').value;
        
        // Resetear paginación al filtrar
        this.currentPage = 1;
        
        if (!searchTerm) {
            this.ventasFiltradas = [...this.ventas];
            this.renderizarVentasFiltradas();
            return;
        }
        
        this.ventasFiltradas = this.ventas.filter(venta => {
            switch (searchField) {
                case 'empresa':
                    return venta.empresa.toLowerCase().includes(searchTerm);
                case 'factura':
                    return venta.serieFactura.toLowerCase().includes(searchTerm) || 
                           venta.numeroFactura.toLowerCase().includes(searchTerm);
                case 'ruc':
                    return venta.ruc.toLowerCase().includes(searchTerm);
                case 'conductor':
                    return venta.conductor.nombre.toLowerCase().includes(searchTerm);
                case 'estado':
                    return venta.estado.toLowerCase().includes(searchTerm);
                case 'all':
                default:
                    return venta.empresa.toLowerCase().includes(searchTerm) ||
                           venta.serieFactura.toLowerCase().includes(searchTerm) ||
                           venta.numeroFactura.toLowerCase().includes(searchTerm) ||
                           venta.conductor.nombre.toLowerCase().includes(searchTerm) ||
                           venta.ruc.toLowerCase().includes(searchTerm) ||
                           venta.estado.toLowerCase().includes(searchTerm) ||
                           (venta.observacion && venta.observacion.toLowerCase().includes(searchTerm));
            }
        });
        
        this.renderizarVentasFiltradas();
    }
    
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date)) return dateString;
        return date.toLocaleDateString('es-ES');
    }
    
    capitalizar(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    getEstadoClass(estado) {
        switch (estado) {
            case 'pagado': return 'estado-pagado';
            case 'anulado': return 'estado-anulado';
            case 'pendiente': return 'estado-pendiente';
            default: return 'estado-pendiente';
        }
    }
    
    verDetallesVenta(id) {
        const venta = this.ventas.find(v => v.id === id);
        if (!venta) return;
        
        const detallesContainer = this.ventaDetailModal.querySelector('.venta-details');
        
        // Formatear información de la venta para mostrarla
        detallesContainer.innerHTML = `
            <div class="detail-section">
                <h3>Datos de factura</h3>
                <p><strong>Fecha:</strong> ${this.formatDate(venta.fecha)}</p>
                <p><strong>Serie y Número:</strong> ${venta.serieFactura || 'S/N'}-${venta.numeroFactura || 'S/N'}</p>
                <p><strong>Documento:</strong> ${venta.documento || '-'}</p>
                <p><strong>Guía Remitente:</strong> ${venta.guiaRemitente || '-'}</p>
                <p><strong>Guía Transportista:</strong> ${venta.guiaTransportista || '-'}</p>
            </div>
            
            <div class="detail-section">
                <h3>Información económica</h3>
                <p><strong>Monto de flete:</strong> S/ ${venta.montoFlete.toFixed(2)}</p>
                <p><strong>Detracción:</strong> S/ ${venta.detraccion.toFixed(2)}</p>
                <p><strong>Total a deber:</strong> S/ ${venta.totalDeber.toFixed(2)}</p>
                <p><strong>Total monto:</strong> S/ ${venta.totalMonto.toFixed(2)}</p>
                <p><strong>Días crédito:</strong> ${venta.diasCredito}</p>
                <p><strong>Fecha vencimiento:</strong> ${this.formatDate(venta.fechaVencimiento)}</p>
                <p><strong>Estado:</strong> <span class="estado-badge ${this.getEstadoClass(venta.estado)}">${this.capitalizar(venta.estado)}</span></p>
            </div>

            <div class="detail-section">
                <h3>Datos del cliente</h3>
                <p><strong>Empresa:</strong> ${venta.empresa || 'Cliente general'}</p>
                <p><strong>RUC:</strong> ${venta.ruc || '-'}</p>
            </div>
            
            <div class="detail-section">
                <h3>Datos de operación</h3>
                <p><strong>Conductor:</strong> ${venta.conductor.nombre || 'No asignado'}</p>
                <p><strong>Placa tracto:</strong> ${venta.placaTracto.placa || '-'}</p>    
                <p><strong>Placa carreta:</strong> ${venta.placaCarreta.placa || '-'}</p>
                <p><strong>Observaciones:</strong> ${venta.observacion || '-'}</p>
            </div>
        `;
        this.mostrarModal(this.ventaDetailModal);
    }
    
    eliminarVenta(id) {
        Swal.fire({
            title: '¿Eliminar venta?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const index = this.ventas.findIndex(v => v.id === id);
                if (index !== -1) {
                    this.ventas.splice(index, 1);
                    this.guardarVentas();
                    this.renderizarTablaVentas();
                    
                    Swal.fire({
                        title: 'Eliminada',
                        text: 'La venta ha sido eliminada correctamente',
                        icon: 'success',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                }
            }
        });
    }
    
    setupCalculosAutomaticos() {
        const montoFleteInput = document.getElementById('montoFlete');
        const detraccionInput = document.getElementById('detraccion');
        const totalDeberInput = document.getElementById('totalDeber');
        const totalMontoInput = document.getElementById('totalMonto');

        if (montoFleteInput && detraccionInput && totalDeberInput && totalMontoInput) {
            const calcularTotales = () => {
                const montoFlete = parseFloat(montoFleteInput.value) || 0;
                const detraccion = parseFloat(detraccionInput.value) || 0;
                
                const totalDeber = montoFlete - detraccion;
                totalDeberInput.value = totalDeber.toFixed(2);
                
                if (!totalMontoInput.value) {
                    totalMontoInput.value = montoFlete.toFixed(2);
                }   
            };
            
            montoFleteInput.addEventListener('input', calcularTotales);
            detraccionInput.addEventListener('input', calcularTotales);
        }
    }

    // Método para configurar los botones principales con manejo de eventos mejorado
    setupButtonHandlers() {
        // 1. Configurar el botón de Nueva Venta
        const btnNuevaVenta = document.getElementById('btnNuevaVenta');
        if (btnNuevaVenta) {
            // Clonar el botón para eliminar eventos previos
            const nuevoBotonVenta = btnNuevaVenta.cloneNode(true);
            btnNuevaVenta.parentNode.replaceChild(nuevoBotonVenta, btnNuevaVenta);
                 
            // Configurar el evento click con máxima prioridad
            nuevoBotonVenta.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Click en Nueva Venta');
                
                // Preparar formulario para nueva venta
                this.prepararNuevaVenta();
                
                // Mostrar modal con efecto de delay para evitar conflictos
                setTimeout(() => this.mostrarModal(this.modalVentas), 50);
            }, { capture: true });
        }
        
        // 2. Configurar los botones de editar con delegación de eventos
        const tbody = document.querySelector('#ventasTable tbody');
        if (tbody) {
            // Usar delegación de eventos para manejar clicks en botones de editar
            tbody.addEventListener('click', (e) => {
                const editarBtn = e.target.closest('.editar-btn');
                if (editarBtn) {   
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const ventaId = editarBtn.getAttribute('data-id');
                    if (ventaId) {
                        console.log('Click en Editar Venta:', ventaId);
                        this.editarVenta(ventaId);
                    }
                }
            });
        }
        
        // 3. Configurar los botones de ver detalle
        document.addEventListener('click', (e) => {
            const verBtn = e.target.closest('.ver-btn');
            if (verBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                const ventaId = verBtn.getAttribute('data-id');
                if (ventaId) {
                    console.log('Click en Ver Detalle Venta:', ventaId);
                    this.verDetallesVenta(ventaId);
                }
            }
        });
    }
    
    prepararNuevaVenta() {
        if (!this.ventasForm) return;
        
        // Resetear formulario y eliminar atributos de edición
        this.ventasForm.reset();
        this.ventasForm.removeAttribute('data-editing');
        
        // Actualizar título
        if (this.modalTitle) {
            this.modalTitle.textContent = 'Nueva Venta';
        }
        
        // Establecer fecha actual
        const fechaInput = document.getElementById('fecha');
        if (fechaInput) {
            fechaInput.value = new Date().toISOString().split('T')[0];
        }
    }
}

// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.ventasManager = new VentasManager();
});
