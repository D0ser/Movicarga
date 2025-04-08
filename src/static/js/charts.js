// Configuración de los gráficos
const CONFIG = {
    colors: {
        primary: '#2d2e83',
        secondary: '#F39200'
    },
    charts: {
        yearly: {
            type: 'bar',
            title: 'Ventas Anuales'
        },
        monthly: {
            type: 'line',
            title: 'Tendencia Mensual'
        }
    }
};

class ChartManager {
    constructor() {
        this.charts = {};
        this.data = {
            yearly: [],
            monthly: []
        };
        this.initCharts();
        this.setupEventListeners();
        this.loadInitialData();
    }

    initCharts() {
        try {
            this.initializeYearlyChart();
            this.initializeMonthlyChart();
            NotificationManager.success('Gráficos inicializados correctamente');
        } catch (error) {
            NotificationManager.error('Error al inicializar los gráficos');
            console.error('Error en initCharts:', error);
        }
    }

    initializeYearlyChart() {
        const ctx = document.getElementById('yearlyChart');
        if (!ctx) {
            throw new Error('No se encontró el elemento yearlyChart');
        }

        this.charts.yearly = new Chart(ctx, {
            type: CONFIG.charts.yearly.type,
            data: {
                labels: [],
                datasets: [{
                    label: 'Ventas Anuales',
                    data: [],
                    backgroundColor: CONFIG.colors.secondary
                }]
            },
            options: this.getChartOptions(CONFIG.charts.yearly.title)
        });
    }

    initializeMonthlyChart() {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) {
            throw new Error('No se encontró el elemento monthlyChart');
        }

        this.charts.monthly = new Chart(ctx, {
            type: CONFIG.charts.monthly.type,
            data: {
                labels: [],
                datasets: [{
                    label: 'Ventas Mensuales',
                    data: [],
                    borderColor: CONFIG.colors.primary,
                    fill: false
                }]
            },
            options: this.getChartOptions(CONFIG.charts.monthly.title)
        });
    }

    getChartOptions(title) {
        return {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: title
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => 'S/ ' + value.toLocaleString()
                    }
                }
            }
        };
    }

    setupEventListeners() {
        const form = document.getElementById('salesForm');
        if (form) {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
    }

    async loadInitialData() {
        try {
            // Aquí iría la carga de datos desde el backend
            // Por ahora usaremos datos de ejemplo
            const demoData = this.generateDemoData();
            this.updateCharts(demoData);
        } catch (error) {
            NotificationManager.error('Error al cargar los datos iniciales');
            console.error('Error en loadInitialData:', error);
        }
    }

    generateDemoData() {
        // Datos de ejemplo
        return {
            yearly: [
                { year: 2021, amount: 120000 },
                { year: 2022, amount: 150000 },
                { year: 2023, amount: 180000 }
            ],
            monthly: [
                { month: 'Ene 2023', amount: 15000 },
                { month: 'Feb 2023', amount: 18000 },
                { month: 'Mar 2023', amount: 14000 }
            ]
        };
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        const formData = {
            date: document.getElementById('date').value,
            amount: parseFloat(document.getElementById('amount').value)
        };

        try {
            await this.saveData(formData);
            NotificationManager.success('Datos guardados correctamente');
            e.target.reset();
        } catch (error) {
            NotificationManager.error('Error al guardar los datos');
            console.error('Error en handleFormSubmit:', error);
        }
    }

    async saveData(data) {
        // Aquí iría la lógica para guardar en el backend
        // Por ahora solo actualizamos los gráficos
        const [year, month] = data.date.split('-');
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        this.updateCharts({
            yearly: [...this.data.yearly, { year: parseInt(year), amount: data.amount }],
            monthly: [...this.data.monthly, { 
                month: `${monthNames[parseInt(month) - 1]} ${year}`, 
                amount: data.amount 
            }]
        });
    }

    updateCharts(data) {
        this.data = data;
        
        // Actualizar gráfico anual
        this.charts.yearly.data.labels = data.yearly.map(d => d.year);
        this.charts.yearly.data.datasets[0].data = data.yearly.map(d => d.amount);
        this.charts.yearly.update();

        // Actualizar gráfico mensual
        this.charts.monthly.data.labels = data.monthly.map(d => d.month);
        this.charts.monthly.data.datasets[0].data = data.monthly.map(d => d.amount);
        this.charts.monthly.update();

        this.updateTable(data);
    }

    updateTable(data) {
        const tbody = document.querySelector('#salesTable tbody');
        if (!tbody) return;

        tbody.innerHTML = data.monthly.map(d => `
            <tr>
                <td>${d.month}</td>
                <td>S/ ${d.amount.toLocaleString()}</td>
                <td>${this.calculateYearlyComparison(d.amount)}%</td>
            </tr>
        `).join('');
    }

    calculateYearlyComparison(currentAmount) {
        const lastYearAmount = 15000; // Valor de ejemplo
        const difference = ((currentAmount - lastYearAmount) / lastYearAmount) * 100;
        return difference.toFixed(2);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    new ChartManager();
});
