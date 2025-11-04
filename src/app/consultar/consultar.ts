import { Component, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Añadido por si acaso

@Component({
  selector: 'app-consultar',
  standalone: true,
  templateUrl: './consultar.html',
  // Router y RouterLink/Active ya no son necesarios aquí
  imports: [
    FormsModule,
    CommonModule
  ],
  styleUrls: ['./consultar.css']
})
export class Consultar implements AfterViewInit {

  fechaConsulta: string = '';
  dni: string = '';
  private chart: any;

  // Ya no se necesita el Router
  constructor() {}

  ngAfterViewInit(): void {
    // Crea un gráfico de ejemplo apenas carga
    this.inicializarGrafico();
  }

  inicializarGrafico(): void {
    // Espera a que el DOM esté listo
    setTimeout(() => {
      const canvas = document.getElementById('grafico-consulta') as HTMLCanvasElement;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (this.chart) this.chart.destroy();

      // === Gráfico de macronutrientes ===
      this.chart = new Chart(ctx!, {
        type: 'bar',
        data: {
          labels: ['Proteínas', 'Grasas', 'Carbohidratos'],
          datasets: [
            {
              label: 'Consumo (g)',
              data: [80, 55, 130], // Valores de ejemplo
              backgroundColor: ['#4CAF50', '#FFC107', '#2196F3'],
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              labels: { color: '#333' }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 20 }
            }
          }
        }
      });
    });
  }

  buscar(event: Event): void {
    event.preventDefault();
    console.log('Buscando por:', this.fechaConsulta, this.dni);
    // Aquí iría la lógica para buscar datos reales y actualizar el gráfico
    this.inicializarGrafico(); // Por ahora, solo refresca el gráfico de ejemplo
  }

  // El método salir() se eliminó porque ahora está en el layout principal
}
