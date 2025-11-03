import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consultar',
  standalone: true,
  templateUrl: './consultar.html',
  imports: [
    FormsModule
  ],
  styleUrls: ['./consultar.css']
})
export class Consultar implements AfterViewInit {

  fechaConsulta: string = '';
  dni: string = '';
  private chart: any;

  constructor(private router: Router) {}

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

      // === Aquí cambiamos el gráfico a macronutrientes ===
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
    this.inicializarGrafico();
  }

  salir(): void {
    this.router.navigate(['/inicio']);
  }
}
