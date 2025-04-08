class VentasManager {
    constructor() {
        this.ventasForm = document.getElementById('ventasForm');
        this.ventasTable = document.getElementById('ventasTable').querySelector('tbody');
        this.searchInput = document.getElementById('searchVentas');
        this.fechaDesde = document.getElementById('fechaDesde');
        this.fechaHasta = document.getElementById('fechaHasta');
        this.filtrarBtn = document.getElementById('filtrarFechas');
        this.btnNuevaVenta = document.getElementById('btnNuevaVenta');
        this.ventaFormModal = document.getElementById('ventaFormModal');
        this.ventaDetailModal = document.getElementById('ventaDetailModal');
        this.closeModalButtons = document.querySelectorAll('.close-modal');
        this.modalTitle = document.getElementById('modalTitle');
        
        this.ventas = this.cargarVentasGuardadas();
        
        // Asegurarnos que los modales estén ocultos al inicio
        this.hideAllModals();
        
        // Continuar con la inicialización normal
        this.setupEventListeners();
        this.cargarConductores();
        this.cargarPlacas();
        this.renderizarTablaVentas();
        this.setupCalculosAutomaticos();
    }
    
    // Método para asegurar que todos los modales estén ocultos al inicio
    hideAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
            modal.classList.remove('show');
        });
    }

    setupEventListeners() {
        if (this.btnNuevaVenta) {
            this.btnNuevaVenta.addEventListener('click', () => this.abrirModalNuevaVenta());
        }
        
        if (this.ventasForm) {
            this.ventasForm.addEventListener('submit', this.handleSubmit.bind(this));
            
            // Prevenir el envío del formulario desde botones que no sean el principal
            const hiddenSubmitButton = this.ventasForm.querySelector('.hidden-actions button[type="submit"]');
            if (hiddenSubmitButton) {
                hiddenSubmitButton.addEventListener('click', (e) => {
                    e.preventDefault(); 
                    // No hacer nada aquí, ya que el botón principal maneja el envío
                });
            }
        }
        
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.filtrarVentas.bind(this));
        }
        
        if (this.filtrarBtn) {
            this.filtrarBtn.addEventListener('click', this.filtrarPorFechas.bind(this));
        }

        const diasCreditoInput = document.getElementById('diasCredito');
        const fechaInput = document.getElementById('fecha');
        
        if (diasCreditoInput && fechaInput) {
            diasCreditoInput.addEventListener('input', () => this.calcularFechaVencimiento());
            fechaInput.addEventListener('change', () => this.calcularFechaVencimiento());
        }

        this.ventasTable.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.matches('.ver-btn') || target.closest('.ver-btn')) {
                const id = target.closest('tr').dataset.id;
                this.verDetallesVenta(id);
            } else if (target.matches('.editar-btn') || target.closest('.editar-btn')) {
                const id = target.closest('tr').dataset.id;
                this.editarVenta(id);
            } else if (target.matches('.eliminar-btn') || target.closest('.eliminar-btn')) {
                const id = target.closest('tr').dataset.id;
                this.eliminarVenta(id);
            }
        });

        this.setupModalEvents();
    }

    setupModalEvents() {
        this.closeModalButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.cerrarModales();
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target === this.ventaDetailModal || e.target === this.ventaFormModal) {
                this.cerrarModales();
            }
        });

        const modalContents = document.querySelectorAll('.modal-content');
        modalContents.forEach(content => {
            content.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cerrarModales();
            }
        });
    }

    cerrarModales() {
        const modales = document.querySelectorAll('.modal');
        modales.forEach(modal => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
        
        document.body.style.overflow = 'auto';
    }

    mostrarModal(modal) {
        // Deshabilitar scroll en el body para evitar el scroll debajo del modal
        document.body.style.overflow = 'hidden';
        
        // Asegurarse de que el modal esté centrado
        modal.style.display = 'flex';
        
        // En dispositivos móviles, asegurarse que el modal aparece desde arriba
        if (window.innerWidth <= 768) {
            window.scrollTo(0, 0);
            modal.classList.add('mobile-view');
        } else {
            modal.classList.remove('mobile-view');
        }
        
        // Forzar reflow para que la animación funcione
        void modal.offsetWidth;
        
        // Añadir clase para mostrar con animación
        modal.classList.add('show');
        
        // Resetear posición de scroll del contenido del modal
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            setTimeout(() => {
                if (modalContent.scrollTop) {
                    modalContent.scrollTop = 0;
                }
                
                // Asegurar que todos los campos son visibles
                this.optimizarCamposFormulario();
            }, 50);
        }
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

    abrirModalNuevaVenta() {
        this.ventasForm.reset();
        this.ventasForm.removeAttribute('data-editing');
        this.modalTitle.textContent = 'Nueva Venta';
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('fecha').value = today;

        // Reiniciar las pestañas al estado inicial
        if (window.TabsManager) {
            setTimeout(() => {
                const tabsManager = new TabsManager('#ventasTabsContainer');
                tabsManager.resetTabs();
            }, 100);
        }

        this.mostrarModal(this.ventaFormModal);
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

    calcularFechaVencimiento() {
        const fechaInput = document.getElementById('fecha');
        const diasCreditoInput = document.getElementById('diasCredito');
        const fechaVencimientoInput = document.getElementById('fechaVencimiento');
        
        if (fechaInput.value && diasCreditoInput.value) {
            const fecha = new Date(fechaInput.value);
            const diasCredito = parseInt(diasCreditoInput.value) || 0;
            
            fecha.setDate(fecha.getDate() + diasCredito);
            
            const year = fecha.getFullYear();
            const month = String(fecha.getMonth() + 1).padStart(2, '0');
            const day = String(fecha.getDate()).padStart(2, '0');
            
            fechaVencimientoInput.value = `${year}-${month}-${day}`;
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
            // Ya no validamos campos requeridos
            const formData = this.recopilarDatosFormulario();
            
            if (formData.id) {
                const index = this.ventas.findIndex(v => v.id === formData.id);
                if (index !== -1) {
                    this.ventas[index] = formData;
                    NotificationManager.success('Venta actualizada correctamente');
                }
            } else {
                formData.id = Date.now().toString();
                this.ventas.push(formData);
                NotificationManager.success('Venta registrada correctamente');
            }
            
            this.guardarVentas();
            this.renderizarTablaVentas();
            this.ventasForm.reset();
            this.ventasForm.removeAttribute('data-editing');
            this.cerrarModales();
        } catch (error) {
            console.error('Error al procesar el formulario:', error);
            NotificationManager.error('Error al procesar el formulario');
        }
    }

    recopilarDatosFormulario() {
        const conductorElement = document.getElementById('conductor');
        const placaTractoElement = document.getElementById('placaTracto');
        const placaCarretaElement = document.getElementById('placaCarreta');

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
                nombre: conductorElement.options[conductorElement.selectedIndex]?.text || 'No especificado'
            },
            placaTracto: {
                id: placaTractoElement.value || '0',
                placa: placaTractoElement.options[placaTractoElement.selectedIndex]?.text || 'No especificado'
            },
            placaCarreta: {
                id: placaCarretaElement.value || '0',
                placa: placaCarretaElement.options[placaCarretaElement.selectedIndex]?.text || 'N/A'
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
            return;
        }
        
        this.ventas.forEach(venta => {
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

        // Después de renderizar la tabla, inicializar el mejorador de tablas
        if (window.TableEnhancer) {
            setTimeout(() => {
                new TableEnhancer().enhanceTableCells(this.ventasTable);
            }, 100);
        }
    }

    renderizarVentasFiltradas(ventasFiltradas) {
        this.ventasTable.innerHTML = '';
        
        if (ventasFiltradas.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="8" class="empty-table">No se encontraron ventas que coincidan con la búsqueda</td>';
            this.ventasTable.appendChild(row);
            return;
        }
        
        ventasFiltradas.forEach(venta => {
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

        // Después de renderizar la tabla filtrada, reiniciar el mejorador de tablas
        if (window.TableEnhancer) {
            setTimeout(() => {
                new TableEnhancer().enhanceTableCells(this.ventasTable);
            }, 100);
        }
    }

    filtrarVentas() {
        const searchTerm = this.searchInput.value.toLowerCase();
        
        const ventasFiltradas = this.ventas.filter(venta => 
            venta.empresa.toLowerCase().includes(searchTerm) ||
            venta.serieFactura.toLowerCase().includes(searchTerm) ||
            venta.numeroFactura.toLowerCase().includes(searchTerm) ||
            venta.conductor.nombre.toLowerCase().includes(searchTerm) ||
            venta.ruc.toLowerCase().includes(searchTerm)
        );
        
        this.renderizarVentasFiltradas(ventasFiltradas);
    }

    filtrarPorFechas() {
        const desde = this.fechaDesde.value ? new Date(this.fechaDesde.value) : null;
        const hasta = this.fechaHasta.value ? new Date(this.fechaHasta.value) : null;
        
        if (!desde && !hasta) {
            this.renderizarTablaVentas();
            return;
        }
        
        const ventasFiltradas = this.ventas.filter(venta => {
            const fechaVenta = new Date(venta.fecha);
            
            if (desde && hasta) {
                return fechaVenta >= desde && fechaVenta <= hasta;
            } else if (desde) {
                return fechaVenta >= desde;
            } else if (hasta) {
                return fechaVenta <= hasta;
            }
            return true;
        });
        
        this.renderizarVentasFiltradas(ventasFiltradas);
    }

    verDetallesVenta(id) {
        const venta = this.ventas.find(v => v.id === id);
        
        if (!venta) {
            NotificationManager.error('No se encontró la venta');
            return;
        }
        
        const modal = document.getElementById('ventaDetailModal');
        const detallesContainer = modal.querySelector('.venta-details');
        
        // Asegurarse de que todos los campos tengan un valor o muestren un "-"
        detallesContainer.innerHTML = `
            <h3>Datos de Factura</h3>
            <p><strong>Fecha:</strong> ${this.formatDate(venta.fecha) || '-'}</p>
            <p><strong>Factura:</strong> ${venta.serieFactura || '-'}-${venta.numeroFactura || '-'}</p>
            <p><strong>Documento:</strong> ${venta.documento || '-'}</p>
            <p><strong>Guía remitente:</strong> ${venta.guiaRemitente || '-'}</p>
            <p><strong>Guía transportista:</strong> ${venta.guiaTransportista || '-'}</p>
            
            <h3>Información Económica</h3>
            <p><strong>Monto de flete:</strong> S/ ${venta.montoFlete?.toFixed(2) || '-'}</p>
            <p><strong>Detracción:</strong> S/ ${venta.detraccion?.toFixed(2) || '-'}</p>
            <p><strong>Total a deber:</strong> S/ ${venta.totalDeber?.toFixed(2) || '-'}</p>
            <p><strong>Total monto:</strong> S/ ${venta.totalMonto?.toFixed(2) || '-'}</p>
            <p><strong>Días crédito:</strong> ${venta.diasCredito || '0'}</p>
            <p><strong>Fecha vencimiento:</strong> ${venta.fechaVencimiento ? this.formatDate(venta.fechaVencimiento) : '-'}</p>
            <p><strong>Estado:</strong> <span class="estado-badge ${this.getEstadoClass(venta.estado || 'pendiente')}">${this.capitalizar(venta.estado || 'pendiente')}</span></p>
            
            <h3>Datos del Cliente</h3>
            <p><strong>Empresa:</strong> ${venta.empresa || '-'}</p>
            <p><strong>RUC:</strong> ${venta.ruc || '-'}</p>
            
            <h3>Datos de Operación</h3>
            <p><strong>Conductor:</strong> ${venta.conductor?.nombre || '-'}</p>
            <p><strong>Placa tracto:</strong> ${venta.placaTracto?.placa || '-'}</p>
            <p><strong>Placa carreta:</strong> ${venta.placaCarreta?.placa || '-'}</p>
            <p><strong>Observación:</strong> ${venta.observacion || '-'}</p>
        `;
        
        this.mostrarModal(modal);
    }

    editarVenta(id) {
        const venta = this.ventas.find(v => v.id === id);
        
        if (!venta) {
            NotificationManager.error('No se encontró la venta');
            return;
        }
        
        this.ventasForm.setAttribute('data-editing', venta.id);
        this.modalTitle.textContent = 'Editar Venta';
        
        // Establecer los valores del formulario
        document.getElementById('fecha').value = venta.fecha;
        document.getElementById('serieFactura').value = venta.serieFactura;
        document.getElementById('numeroFactura').value = venta.numeroFactura;
        document.getElementById('montoFlete').value = venta.montoFlete;
        document.getElementById('detraccion').value = venta.detraccion;
        document.getElementById('totalDeber').value = venta.totalDeber;
        document.getElementById('totalMonto').value = venta.totalMonto;
        document.getElementById('empresa').value = venta.empresa;
        document.getElementById('ruc').value = venta.ruc;
        document.getElementById('conductor').value = venta.conductor.id;
        document.getElementById('placaTracto').value = venta.placaTracto.id;
        if (venta.placaCarreta.id) {
            document.getElementById('placaCarreta').value = venta.placaCarreta.id;
        }
        document.getElementById('observacion').value = venta.observacion || '';
        document.getElementById('documento').value = venta.documento || '';
        document.getElementById('guiaRemitente').value = venta.guiaRemitente || '';
        document.getElementById('guiaTransportista').value = venta.guiaTransportista || '';
        document.getElementById('diasCredito').value = venta.diasCredito;
        document.getElementById('fechaVencimiento').value = venta.fechaVencimiento || '';
        document.getElementById('estado').value = venta.estado;
        
        // Reiniciar las pestañas al estado inicial
        if (window.TabsManager) {
            setTimeout(() => {
                const tabsManager = new TabsManager('#ventasTabsContainer');
                // Marcar todas las pestañas como completadas ya que es una edición
                tabsManager.progressSteps.forEach(step => step.classList.add('completed'));
            }, 100);
        }
        
        this.mostrarModal(this.ventaFormModal);
    }

    eliminarVenta(id) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1a237e',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.ventas = this.ventas.filter(v => v.id !== id);
                this.guardarVentas();
                this.renderizarTablaVentas();
                NotificationManager.success('Venta eliminada correctamente');
            }
        });
    }

    getEstadoClass(estado) {
        switch (estado) {
            case 'pagado':
                return 'estado-pagado';
            case 'pendiente':
                return 'estado-pendiente';
            case 'anulado':
                return 'estado-anulado';
            default:
                return '';
        }
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', options);
    }

    capitalizar(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new VentasManager();
});
