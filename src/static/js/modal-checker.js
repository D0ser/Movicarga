/**
 * Utilidad para verificar y corregir el estado de los modales al cargar la página
 */
document.addEventListener('DOMContentLoaded', () => {
    // Encontrar todos los modales en la página
    const modals = document.querySelectorAll('.modal');
    
    // Asegurar que todos estén ocultos al inicio
    modals.forEach(modal => {
        // Ocultar completamente el modal
        modal.style.display = 'none';
        modal.classList.remove('show');
        
        // Registrar en la consola para depuración
        console.log(`Modal ${modal.id} inicializado como oculto`);
    });
    
    console.log('Modal checker: Todos los modales han sido inicializados correctamente como ocultos');
});
