let yearlyData = {
    labels: [],
    datasets: [{
        label: 'Ventas Anuales',
        data: [],
        backgroundColor: '#3498db'
    }]
};

let monthlyData = {
    labels: [],
    datasets: [{
        label: 'Ventas Mensuales',
        data: [],
        backgroundColor: '#2ecc71'
    }]
};

function initCharts() {
    const yearlyChart = new Chart(
        document.getElementById('yearlyChart'),
        {
            type: 'bar',
            data: yearlyData,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Ventas Anuales'
                    }
                }
            }
        }
    );

    const monthlyChart = new Chart(
        document.getElementById('monthlyChart'),
        {
            type: 'line',
            data: monthlyData,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Tendencia Mensual'
                    }
                }
            }
        }
    );
}

document.getElementById('salesForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const date = document.getElementById('date').value;
    const amount = document.getElementById('amount').value;
    
    // Aquí iría la lógica para enviar datos al backend
    console.log('Datos a guardar:', { date, amount });
});

// Inicializar gráficos cuando se carga la página
document.addEventListener('DOMContentLoaded', initCharts);
